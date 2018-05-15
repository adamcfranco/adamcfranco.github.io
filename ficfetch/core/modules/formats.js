/******************************
*
* EPUB
*
******************************/
var EPUB =
{
	createFile: function(metadata, chapters)
	{
		let fileName = metadata["title"].replace(/[^a-z0-9]/gi, '_');
		let pad = String(metadata["num_chapters"]).length;
		let epub_styles = "body { font-size: 1em; margin: 0; padding: 0; line-height: 1.5; }\n"
		+ "h1, h2, h3, h4, h5, h6 { text-align: center; font-size: 1em; margin: 0 0 0.8em 0; }\n"
		+ "a { text-decoration: none; }\n"
		+ "h1 { font-size: 2em; }\n"
		+ "h2 { font-size: 1.5em; }\n"
		+ "h3 { font-size: 1.25em; }\n"
		+ "h4 { font-size: 1.1em; }\n"
		+ "h5 { font-size: 1em; }\n"
		+ "p { margin: 0.5em 0; padding: 0; text-align: justify; }\n"
		+ "#cover_image { text-align: center; }\n"
		+ "#cover_image img { display: block; width: auto; max-width: 600px; height: auto; max-height: 800px; }";
		postMessage(2, "Creating ZIP object...");
		var zip = new JSZip();
		postMessage(2, "Creating file: mimetype");
		zip.file("mimetype", "application/epub+zip");
		postMessage(2, "Creating file: META-INF/container.xml");
		zip.file("META-INF/container.xml",
			"<?xml version=\"1.0\"?>\n"
			+ "<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n"
			+ "\t<rootfiles>\n"
			+ "\t\t<rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\"/>\n"
			+ "\t</rootfiles>\n"
			+ "</container>");
		postMessage(2, "Creating file: OEBPS/content.opf");
		zip.file("OEBPS/content.opf", EPUB.createOPF(metadata));
		postMessage(2, "Creating file: OEBPS/toc.ncx");
		zip.file("OEBPS/toc.ncx", EPUB.createNCX(metadata, chapters));
		postMessage(2, "Creating file: OEBPS/CSS/stylesheet.css");
		zip.file("OEBPS/CSS/stylesheet.css", epub_styles);
		postMessage(2, "Creating file: OEBPS/Text/Cover.xhtml");
		zip.file("OEBPS/Text/Cover.xhtml", EPUB.createCoverPage(metadata["title"]));
		postMessage(2, "Creating file: OEBPS/Text/Title.xhtml");
		zip.file("OEBPS/Text/Title.xhtml", EPUB.createTitlePage(metadata));
		postMessage(2, "Generating Cover Image...");
		createCoverImage(metadata["title"], metadata["author"], function(base64img)
		{
			zip.file("OEBPS/Images/cover.png", base64img.substr(base64img.indexOf(',')+1), {base64: true});
			postMessage(2, "Creating chapter files...");
			$.each(story_chapters, function(index, chapter)
			{
				zip.file("OEBPS/Text/Chapter" + padString(index + 1, pad) + ".xhtml", EPUB.createChapterPage(chapter.title, chapter.content) );
			});
			postMessage(2, "Compressing files...");
			zip.generateAsync(
			{
				type: 'blob',
				mimeType: 'application/epub+zip',
				compression: 'DEFLATE',
				compressionOptions:
				{
					level: 9
				}

			}).then(function(file)
			{	
				postMessage(2, "Saving...");
				if (saveAs(file, fileName + ".epub"))
				{
					postMessage(1, "Story downloaded successfully!");
				}
				else
				{
					postMessage(0, "Story was not saved.");
				}
			});
		});
	},
	createOPF: function(metadata)
	{
		let chapters_spine = "";
		let chapters_manifest = ""
		let pad = String(metadata["num_chapters"]).length;
		for (var i = 1; i <= metadata["num_chapters"]; i++)
		{
			chapter_num = padString(i, pad);
			chapters_spine += "\t\t<itemref idref=\"chapter" + chapter_num + "\" linear=\"yes\" />\n"
			chapters_manifest += "\t\t<item href=\"Text/Chapter" + chapter_num + ".xhtml\" id=\"chapter" + chapter_num + "\" media-type=\"application/xhtml+xml\"/>\n" 
		}
		var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		+ "<package xmlns=\"http://www.idpf.org/2007/opf\" version=\"2.0\" unique-identifier=\"EPB-UUID\">\n"
		+ "\t<metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:opf=\"http://www.idpf.org/2007/opf\">\n"
		+ "\t\t<dc:title>" + metadata["title"] + "</dc:title>\n"
		+ "\t\t<dc:creator opf:file-as=\"" + metadata["author"] + "\" opf:role=\"aut\">" + metadata["author"] + "</dc:creator>\n"
		+ "\t\t<dc:date opf:event=\"epub-publication\">" + formatTimestamp(metadata["date_publish"]) + "</dc:date>\n"
		+ "\t\t<dc:source>" + metadata["source"] + "</dc:source>\n"
		+ "\t\t<dc:identifier id=\"EPB-UUID\">" + metadata["uuid"] + "</dc:identifier>\n"
		+ "\t\t<dc:language>en-GB</dc:language>\n"
		+ "\t\t<dc:rights>Copyright " + metadata["author"] + "</dc:rights>\n"
		+ "\t\t<meta name=\"cover\" content=\"img-cover\"/>\n"
		+ "\t</metadata>\n"
		+ "\t<manifest>\n"
		+ "\t\t<item href=\"Text/Cover.xhtml\" id=\"coverpage\" media-type=\"application/xhtml+xml\"/>\n"
		+ "\t\t<item href=\"Text/Title.xhtml\" id=\"titlepage\" media-type=\"application/xhtml+xml\"/>\n"
		+ chapters_manifest
		+ "\t\t<item href=\"CSS/stylesheet.css\" id=\"stylesheet.css\" media-type=\"text/css\"/>\n"
		+ "\t\t<item href=\"Images/cover.png\" id=\"img-cover\" media-type=\"image/png\"/>\n"
		+ "\t\t<item href=\"toc.ncx\" id=\"ncx\" media-type=\"application/x-dtbncx+xml\"/>\n"
		+ "\t</manifest>\n"
		+ "\t<spine toc=\"ncx\">\n"
		+ "\t\t<itemref idref=\"coverpage\" linear=\"yes\" />\n"
		+ "\t\t<itemref idref=\"titlepage\" linear=\"yes\" />\n"
		+ chapters_spine
		+ "\t</spine>\n"
		+ "\t<guide>\n"
		+ "\t\t<reference href=\"Text/Cover.xhtml\" type=\"cover\" title=\"Cover\" />\n"
		+ "\t</guide>\n"
		+ "</package>";
		return xml;
	},
	createNCX: function(metadata, chapters)
	{
		let navmap = "";
		let totalChapters = parseInt(metadata["num_chapters"]) + 1;
		let padding = String(totalChapters).length;
		for (let i = 2; i <= totalChapters; i++)
		{
			let navpoint_num = i.toString().padStart(padding, "0");;
			let chapter_num = (i - 1).toString().padStart(padding, "0");
			navmap += "\t\t<navPoint id=\"navpoint-" + navpoint_num + "\" playOrder=\"" + navpoint_num + "\">\n"
			+ "\t\t\t<navLabel>\n"
			+ "\t\t\t\t<text>" + chapter_num + ": " + chapters[i-2]["title"] + "</text>\n"
			+ "\t\t\t</navLabel>\n"
			+ "\t\t\t<content src=\"Text/Chapter" + chapter_num + ".xhtml\" />\n"
			+ "\t\t</navPoint>\n";
		}
		var ncx = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?><!DOCTYPE ncx PUBLIC \" -//NISO//DTD ncx 2005-1//EN\" \"http://www.daisy.org/z3986/2005/ncx-2005-1.dtd\">\n"
		+ "<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" version=\"2005-1\">\n"
		+ "\t<head>\n"
		+ "\t\t<meta name=\"dtb:uid\" content=\"" + metadata["uuid"] + "\" />\n"
		+ "\t\t<meta name=\"dtb:depth\" content=\"1\" />\n"
		+ "\t\t<meta name=\"dtb:totalPageCount\" content=\"0\" />\n"
		+ "\t\t<meta name=\"dtb:maxPageNumber\" content=\"0\" />\n"
		+ "\t</head>\n"
		+ "\t<docTitle>\n"
		+ "\t\t<text>" + metadata["title"] + "</text>\n"
		+ "\t</docTitle>\n"
		+ "\t<docAuthor>\n"
		+ "\t\t<text>" + metadata["author"] + "</text>\n"
		+ "\t</docAuthor>\n"
		+ "\t<navMap>\n"
		+ "\t\t<navPoint id=\"navpoint-" + "1".padStart(padding, "0") + "\" playOrder=\"" + "1".padStart(padding, "0") + "\">\n"
		+ "\t\t\t<navLabel>\n"
		+ "\t\t\t\t<text>" + metadata["title"] + "</text>\n"
		+ "\t\t\t</navLabel>\n"
		+ "\t\t\t<content src=\"Text/Cover.xhtml\" />\n"
		+ "\t\t</navPoint>\n"
		+ navmap
		+ "\t</navMap>\n"
		+ "</ncx>";
		return ncx;
	},
	createTitlePage: function(metadata)
	{
		let updated = metadata["date_updated"];
		if (updated != "Never") updated = formatTimestamp(metadata["date_updated"]);
		return    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		+ "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\n"
		+ "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n"
		+ "\t<head>\n"
		+ "\t\t<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n"
		+ "\t\t<title>" + metadata["title"] + "</title>\n"
		+ "\t\t<link rel=\"stylesheet\" type=\"text/css\" href=\"../CSS/stylesheet.css\" />\n"
		+ "\t</head>\n"
		+ "\t<body>\n"
		+ "\t\t<div class=\"story_info\">\n"
		+ "\t\t\t<h1>" + metadata["title"] + "</h1>\n"
		+ "\t\t\t<h2>" + metadata["author"] + "</h2>\n"
		+ "\t\t\t<p><strong>Story Link:</strong><br /><a href=\"" + metadata["link_story"] + "\">" + metadata["link_story"] + "</a></p>\n"
		+ "\t\t\t<p><strong>Author Link:</strong><br /><a href=\"" + metadata["link_author"] + "\">" + metadata["link_author"] + "</a></p>\n"
		+ "\t\t\t<p><strong>Rating:</strong> " + metadata["rating"] + "</p>\n"
		+ "\t\t\t<p><strong>Genre(s):</strong> " + metadata["genre"] + "</p>\n"
		+ "\t\t\t<p><strong>Chapters:</strong> " + metadata["num_chapters"] + "</p>\n"
		+ "\t\t\t<p><strong>Word Count:</strong> " + metadata["num_words"] + "</p>\n"
		+ "\t\t\t<p><strong>Published:</strong> " + formatTimestamp(metadata["date_publish"]) + "</p>\n"
		+ "\t\t\t<p><strong>Last Updated:</strong> " + updated + "</p>\n"
		+ "\t\t\t<p><strong>Status:</strong> " + metadata["status"] + "</p>\n"
		+ "\t\t\t<p><strong>Source:</strong> " + metadata["source"] + "</p>\n"
		+ "\t\t\t<p><strong>Description:</strong><br />" + metadata["description"] + "</p>\n"
		+ "\t\t</div>\n"
		+ "\t</body>\n"
		+ "</html>";
	},
	createCoverPage: function(title)
	{
		return    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		+ "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\n"
		+ "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n"
		+ "\t<head>\n"
		+ "\t\t<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n"
		+ "\t\t<title>" + title + " (Cover Image)</title>\n"
		+ "\t\t<link rel=\"stylesheet\" type=\"text/css\" href=\"../CSS/stylesheet.css\" />\n"
		+ "\t</head>\n"
		+ "\t<body>\n"
		+ "\t\t<div id=\"cover_image\"><img src=\"../Images/cover.png\" alt=\"" + title + " Cover Image\" /></div>\n"
		+ "\t</body>\n"
		+ "</html>";
	},
	createChapterPage: function(title, content)
	{
		return    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		+ "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\n"
		+ "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n"
		+ "\t<head>\n"
		+ "\t\t<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n"
		+ "\t\t<title>" + title + "</title>\n"
		+ "\t\t<link rel=\"stylesheet\" type=\"text/css\" href=\"../CSS/stylesheet.css\" />\n"
		+ "\t</head>\n"
		+ "\t<body>\n"
		+ "\t\t" + content + "\n"
		+ "\t</body>\n"
		+ "</html>";
	}
};
/******************************
* 
* HTML
*
******************************/
var HTML =
{
	createFile: function(metadata, chapters)
	{
		let fileName = metadata["title"].replace(/[^a-z0-9]/gi, '_');
		var html_styles = "body { margin: 0; padding: 0; line-height: 2; background: rgb(245, 245, 245); color: rgb(50, 50, 50); font-size: 20px; font-family: Times New Roman, Georgia, serif; }\n"
		+ "a:link, a:visited { color: rgb(0, 127, 255); text-decoration: none; }\n"
		+ "a:link:hover, a:visited:hover { color: rgb(255, 127, 0); text-decoration: underline; }\n"
		+ ".wrapper { margin: 2em auto; width: 800px; }\n"
		+ "h1, h2, h3, h4, h5, h6 { font-size: 1em; font-family: Arial, Helvetica, sans-serif; font-weight: normal; }\n"
		+ "h1 { font-size: 2em; text-align: center; }\n"
		+ "h2 { font-size: 1.5em; }\n"
		+ "h3 { font-size: 1.25em; text-align: center; }\n"
		+ "h4 { font-size: 1.1em; }\n"
		+ "h5 { font-size: 1em; }\n"
		+ "header { margin: 0 0 2em 0; }\n"
		+ "header h1, header h3 { margin: 0; }\n"
		+ "p { margin: 0.5em 0; padding: 0; text-align: justify; }\n"
		+ "#cover_img { display: block; padding: 0 5; margin: 2em auto; width: 400px; }\n"
		+ ".clear { clear: both; }\n"
		+ ".description { margin: 2em 0 0 0; }\n"
		+ ".chapter-title { margin: 1em 0; }\n"
		+ ".chapter-title h2 { margin: 0; line-height: 24px; }\n"
		+ ".hidden { display: none; }\n";

		postMessage(2, "Creating cover image...");
		createCoverImage(metadata["title"], metadata["author"], function(base64img)
		{
			let updated = metadata["date_updated"];
			if (updated != "Never") updated = formatTimestamp(metadata["date_updated"]);
			cover_html  = "\t\t<img id=\"cover_img\" src=\"" + base64img + "\">\n"
			+ "\t\t<section id=\"cover\">\n"
			+ "\t\t\t<header class=\"hidden\">\n"
			+ "\t\t\t\t<h1>" + metadata["title"] + "</h1>\n"
			+ "\t\t\t\t<h3>by " + metadata["author"] + "</h3>\n"
			+ "\t\t\t</header>\n"
			+ "\t\t\t<p><strong>Story Link:</strong> <a href=\"" + metadata["link_story"] + "\">" + metadata["link_story"] + "</a></p>\n"
			+ "\t\t\t<p><strong>Author Link:</strong> <a href=\"" + metadata["link_author"] + "\">" + metadata["link_author"] + "</a></p>\n"
			+ "\t\t\t<p><strong>Rating:</strong> " + metadata["rating"] + "</p>\n"
			+ "\t\t\t<p><strong>Genre(s):</strong> " + metadata["genre"] + "</p>\n"
			+ "\t\t\t<p><strong>Chapters:</strong> " + metadata["num_chapters"] + "</p>\n"
			+ "\t\t\t<p><strong>Word Count:</strong> " + metadata["num_words"] + "</p>\n"
			+ "\t\t\t<p><strong>Published:</strong> " + formatTimestamp(metadata["date_publish"]) + "</p>\n"
			+ "\t\t\t<p><strong>Last Updated:</strong> " + updated + "</p>\n"
			+ "\t\t\t<p><strong>Status:</strong> " + metadata["status"] + "</p>\n"
			+ "\t\t\t<p><strong>Source:</strong> " + metadata["source"] + "</p>\n"
			+ "\t\t\t<p><strong>Description:</strong><br>" + metadata["description"] + "</p>\n"
			+ "\t\t</section>\n";
			var raw  = "<html lang=\"en\">\n"
			+ "\t<head>\n"
			+ "\t\t<meta charset=\"UTF-8\">\n"
			+ "\t\t<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n"
			+ "\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
			+ "\t\t<title>" + metadata["author"] + " - " + metadata["title"] + "</title>\n"
			+ "\t\t<style>\n"
			+ html_styles
			+ "\t\t</style>\n"
			+ "\t</head>\n"
			+ "\t<body>\n"
			+ "\t\t<div class=\"wrapper\">\n"
			+ cover_html
			+ HTML.createTOC(chapters)
			+ HTML.createChapters(chapters)
			+ "\t\t</div>\n"
			+ "\t</body>\n"
			+ "</html>\n";
			postMessage(2, "Generating HTML file...");
			var file = new Blob([raw], {type: "text/html;charset=utf-8"});
			postMessage(2, "Saving file...");
			if (saveAs(file, filename + ".html"))
			{
				postMessage(1, "Story downloaded successfully!");
			}
			else
			{
				postMessage(0, "Story was not saved.");
			}
		});
	},
	createTOC: function(chapters)
	{
		var toc = '<section id="toc"><h2>Table of Contents</h2><ol>';
		let index = 1;
		for (let chapter of chapters)
		{
			toc += '<li><a href="#chapter_' + index + '">' + chapter.title + '</a></li>';
			index++;
		}
		toc += '</ol></section>';
		return toc;
	},
	createChapters: function(chapters)
	{
		var content = "";
		let index = 1;
		for (let chapter of chapters)
		{
			content += "\t\t<section class=\"chapter\" id=\"chapter_" + index + "\">\n"
			+ "\t\t\t<div class=\"chapter-title\">\n"
			+ "\t\t\t\t<a href=\"#toc\"><small>Back to table of contents</small></a>\n"
			+ "\t\t\t\t<h2>" + chapter.title + "</h2>\n"
			+ "\t\t\t</div>\n"
			+ "\t\t\t" + chapter.content
			+ "\t\t</section>\n";
			index++;
		}
		return content;
	}
};
/******************************
*
* PDF
*
******************************/
var PDF =
{
	createFile: function(metadata, chapters)
	{
		let fileName = metadata["title"].replace(/[^a-z0-9]/gi, '_');
		let pdfDef = 
		{
			content:
			[
			{ text: metadata["title"], style: 'header' }

			],
			styles:
			{
				header:
				{
					fontSize: 20,
					bold: true,
					margin: [0, 0, 0, 20]
				},
				chapterTitle:
				{
					fontSize: 18,
					margin: [0, 0, 0, 10]
				}
			},
			pageSize: 'LETTER',
			pageMargins: [ 70, 50, 70, 50 ]
		};
		for (let i = 0; i < chapters.length; i++)
		{
			let chapter = chapters[i];
			let content = $("<div>" + chapter.content + "</div>").text();
			if (i < chapters.length - 1)
			{
				pdfDef.content.push({ text: chapter.title, style: 'chapterTitle' }, { text: content, pageBreak: 'after' });
			}
			else
			{
				pdfDef.content.push({ text: chapter.title, style: 'chapterTitle' }, { text: content });
			}
		}
		postMessage(2, "Generating PDF file...");
		if (window.Worker)
		{
			c.log("worker supported");
			let worker = new Worker('core/modules/create-pdf.js');
			let message = { generatePDFAsync: { def: pdfDef } };
			worker.postMessage(message);
			worker.onmessage = (e) =>
			{
				let blob = e.data;
				c.log(e.data);
				PDF.save(blob, fileName);
			};
		}
		else
		{
			//prone to freezing while creating large files
			pdfMake.createPdf(pdfDef).getBlob((blob) =>
			{
				PDF.save(blob, fileName);
			}); 
		}
	},
	save: function(blob, title)
	{
		postMessage(2, "Saving file...");
		if (saveAs(blob, title + ".pdf"))
		{
			postMessage(1, "Story downloaded successfully!");
		}
		else
		{
			postMessage(0, "Story was not saved.");
		}
	}
};
/******************************
*
* TEXT
*
******************************/
var TXT =
{
	createFile: function(metadata, chapters)
	{
		let fileName = metadata["title"].replace(/[^a-z0-9]/gi, '_');
		postMessage(2, "Generating TXT file...");
		let fileContents = "";
		fileContents = metadata["title"] + "\nby " + metadata["author"] + "\n\nGenerated by ficfetch.xyz\n\n===============\n\n"; 
		for (let chapter of chapters)
		{
			let content = $("<div>" + chapter.content + "</div>").text();
			fileContents += chapter.title + "\n";
			fileContents += content + "\n";			
		}
		var file = new Blob([fileContents], {type: "text/plain;charset=utf-8"});
		postMessage(2, "Saving file...");
		if (saveAs(file, fileName + ".txt"))
		{
			postMessage(1, "Story downloaded successfully!");
		}
		else
		{
			postMessage(0, "Story was not saved.");
		}
	}
};