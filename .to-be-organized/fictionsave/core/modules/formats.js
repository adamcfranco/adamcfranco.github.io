/******************************

	EPUB

******************************/

var epub =
{
	createFile: function()
	{

		var max = 1;
		if (story_metadata["num_chapters"] > 9)
		{ max = 2; }
		else if (story_metadata["num_chapters"] > 99)
		{ max = 3; }
		var epub_styles = "body { font-size: 1em; margin: 0; padding: 0; line-height: 1.5; }\n"
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
		zip.file("OEBPS/content.opf", epub.createOPF());
		postMessage(2, "Creating file: OEBPS/toc.ncx");
		zip.file("OEBPS/toc.ncx", epub.createNCX());
		postMessage(2, "Creating file: OEBPS/CSS/stylesheet.css");
		zip.file("OEBPS/CSS/stylesheet.css", epub_styles);
		postMessage(2, "Creating file: OEBPS/Text/Cover.xhtml");
		zip.file("OEBPS/Text/Cover.xhtml", epub.createCoverPage());
		postMessage(2, "Creating file: OEBPS/Text/Title.xhtml");
		zip.file("OEBPS/Text/Title.xhtml", epub.createTitlePage());
		postMessage(2, "Generating Cover Image...");
		createCoverImage(story_metadata["title"], story_metadata["author"], function(base64img)
		{
			zip.file("OEBPS/Images/cover.png", base64img.substr(base64img.indexOf(',')+1), {base64: true});
			postMessage(2, "Creating chapter files...");
			$.each(story_chapters, function(index, chapter)
			{
				zip.file("OEBPS/Text/Chapter" + padString(index + 1, max) + ".xhtml", epub.createChapterPage(chapter.title, chapter.content) );
			});


			postMessage(2, "Compressing files...");
			zip.generateAsync({type: 'blob'}).then(function(file)
			{	
				postMessage(2, "Saving...");
				if (saveAs(file, story_metadata["title"] + ".epub"))
				{
					postMessage(1, "Story downloaded successfully!");
				}
			});

		});
	},
	createOPF: function()
	{
		var chapters_spine = "";
		var chapters_manifest = ""
		var max = 1;
		if (story_metadata["num_chapters"] > 9)
		{ max = 2; }
		else if (story_metadata["num_chapters"] > 99)
		{ max = 3; }
		for (var i = 1; i <= story_metadata["num_chapters"]; i++)
		{
			chapter_num = padString(i, max);
			chapters_spine += "\t\t<itemref idref=\"chapter" + chapter_num + "\" linear=\"yes\" />\n"
			chapters_manifest += "\t\t<item href=\"Text/Chapter" + chapter_num + ".xhtml\" id=\"chapter" + chapter_num + "\" media-type=\"application/xhtml+xml\"/>\n" 
		}
		var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
				+ "<package xmlns=\"http://www.idpf.org/2007/opf\" version=\"2.0\" unique-identifier=\"EPB-UUID\">\n"
				+ "\t<metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:opf=\"http://www.idpf.org/2007/opf\">\n"
				+ "\t\t<dc:title>" + story_metadata["title"] + "</dc:title>\n"
				+ "\t\t<dc:creator opf:file-as=\"" + story_metadata["author"] + "\" opf:role=\"aut\">" + story_metadata["author"] + "</dc:creator>\n"
				+ "\t\t<dc:date opf:event=\"epub-publication\">" + formatTimestamp(story_metadata["date_publish"]) + "</dc:date>\n"
				+ "\t\t<dc:source>" + story_metadata["source"] + "</dc:source>\n"
				+ "\t\t<dc:identifier id=\"EPB-UUID\">" + story_metadata["uuid"] + "</dc:identifier>\n"
				+ "\t\t<dc:language>en-GB</dc:language>\n"
				+ "\t\t<dc:rights>Copyright " + story_metadata["author"] + "</dc:rights>\n"
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
	createNCX: function()
	{
		var navmap = "";
		var max = 1;
		if ( (story_metadata["num_chapters"] + 1) > 9)
		{ max = 2; }
		else if ( (story_metadata["num_chapters"] + 1) > 99)
		{ max = 3; }
		for (var i = 2; i <= (story_metadata["num_chapters"] + 1); i++)
		{
			var chapter_num = padString(i-1, max);
			var navpoint_num = padString(i, max);
			navmap += "\t\t<navPoint id=\"navpoint-" + navpoint_num + "\" playOrder=\"" + navpoint_num + "\">\n"
					+ "\t\t\t<navLabel>\n"
					+ "\t\t\t\t<text>Chapter " + chapter_num + "</text>\n"
					+ "\t\t\t</navLabel>\n"
					+ "\t\t\t<content src=\"Text/Chapter" + chapter_num + ".xhtml\" />\n"
					+ "\t\t</navPoint>\n";
		}
		var ncx = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?><!DOCTYPE ncx PUBLIC \" -//NISO//DTD ncx 2005-1//EN\" \"http://www.daisy.org/z3986/2005/ncx-2005-1.dtd\">\n"
				+ "<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" version=\"2005-1\">\n"
				+ "\t<head>\n"
				+ "\t\t<meta name=\"dtb:uid\" content=\"" + story_metadata["uuid"] + "\" />\n"
				+ "\t\t<meta name=\"dtb:depth\" content=\"1\" />\n"
				+ "\t\t<meta name=\"dtb:totalPageCount\" content=\"0\" />\n"
				+ "\t\t<meta name=\"dtb:maxPageNumber\" content=\"0\" />\n"
				+ "\t</head>\n"
				+ "\t<docTitle>\n"
				+ "\t\t<text>" + story_metadata["title"] + "</text>\n"
				+ "\t</docTitle>\n"
				+ "\t<docAuthor>\n"
				+ "\t\t<text>" + story_metadata["author"] + "</text>\n"
				+ "\t</docAuthor>\n"
				+ "\t<navMap>\n"
				+ "\t\t<navPoint id=\"navpoint-" + padString(1, max) + "\" playOrder=\"" + padString(1, max) + "\">\n"
				+ "\t\t\t<navLabel>\n"
				+ "\t\t\t\t<text>" + story_metadata["title"] + "</text>\n"
				+ "\t\t\t</navLabel>\n"
				+ "\t\t\t<content src=\"Text/Cover.xhtml\" />\n"
				+ "\t\t</navPoint>\n"
				+ navmap
				+ "\t</navMap>\n"
				+ "</ncx>";
		return ncx;
	},
	createTitlePage: function()
	{
		return    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
				+ "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\n"
				+ "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n"
				+ "\t<head>\n"
				+ "\t\t<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n"
				+ "\t\t<title>" + story_metadata["title"] + "</title>\n"
				+ "\t\t<link rel=\"stylesheet\" type=\"text/css\" href=\"../CSS/stylesheet.css\" />\n"
				+ "\t</head>\n"
				+ "\t<body>\n"
				+ "\t\t<div class=\"story_info\">\n"
				+ "\t\t\t<h1>" + story_metadata["title"] + "</h1>\n"
				+ "\t\t\t<h2>" + story_metadata["author"] + "</h2>\n"
				+ "\t\t\t<ul>\n"
				+ "\t\t\t\t<li><strong>Story Link: <a href=\"" + story_metadata["link_story"] + "\">" + story_metadata["link_story"] + "</a></strong></li>\n"
				+ "\t\t\t\t<li><strong>Author Link: <a href=\"" + story_metadata["link_author"] + "\">" + story_metadata["link_author"] + "</a></strong></li>\n"
				+ "\t\t\t\t<li><strong>Rating:</strong> " + story_metadata["rating"] + "</li>\n"
				+ "\t\t\t\t<li><strong>Genre(s):</strong> " + story_metadata["genre"] + "</li>\n"
				+ "\t\t\t\t<li><strong>Chapters:</strong> " + formatTimestamp(story_metadata["num_chapters"]) + "</li>\n"
				+ "\t\t\t\t<li><strong>Word Count:</strong> " + story_metadata["num_words"] + "</li>\n"
				+ "\t\t\t\t<li><strong>Last Updated:</strong> " + story_metadata["date_updated"] + "</li>\n"
				+ "\t\t\t\t<li><strong>Published:</strong> " + formatTimestamp(story_metadata["date_publish"]) + "</li>\n"
				+ "\t\t\t\t<li><strong>Status:</strong> " + story_metadata["status"] + "</li>\n"
				+ "\t\t\t\t<li><strong>Source:</strong> " + story_metadata["source"] + "</li>\n"
				+ "\t\t\t\t<li><strong>Description:</strong> " + story_metadata["description"] + "</li>\n"
				+ "\t\t\t</ul>\n"
				+ "\t\t</div>\n"
				+ "\t</body>\n"
				+ "</html>";
	},
	createCoverPage: function()
	{
		return    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
				+ "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\n"
				+ "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n"
				+ "\t<head>\n"
				+ "\t\t<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n"
				+ "\t\t<title>" + story_metadata["title"] + " (Cover Image)</title>\n"
				+ "\t\t<link rel=\"stylesheet\" type=\"text/css\" href=\"../CSS/stylesheet.css\" />\n"
				+ "\t</head>\n"
				+ "\t<body>\n"
				+ "\t\t<div id=\"cover_image\"><img src=\"../Images/cover.png\" alt=\"" + story_metadata["title"] + " Cover Image\" /></div>\n"
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

	HTML

******************************/

var html =
{
	createFile: function()
	{
		var html_styles = "* { box-sizing: border-box; }\n"
						+ "body { margin: 0; padding: 0; line-height: 2; background: #e9e9e9; font-size: 16px; font-family: Times New Roman, Georgia, serif; }\n"
						+ ".wrapper { border-radius: 4px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); padding: 2.5em 5em; margin: 2em auto; width: 800px; }\n"
						+ "h1, h2, h3, h4, h5, h6 { font-size: 1em; font-family: Arial, Helvetica, sans-serif; font-weight: normal; }\n"
						+ "h1 { font-size: 2em; text-align: center; }\n"
						+ "h2 { font-size: 1.5em; }\n"
						+ "h3 { font-size: 1.25em; text-align: center; }\n"
						+ "h4 { font-size: 1.1em; }\n"
						+ "h5 { font-size: 1em; }\n"
						+ "header { margin: 0 0 2em 0; }\n"
						+ "header h1, header h3 { margin: 0; }\n"
						+ "p { margin: 0.5em 0; padding: 0; text-align: justify; }\n"
						+ "#cover_img { float: left; display: block; width: auto; height: 320px; margin-right: 1em; }\n"
						+ ".info ul { list-style: none; margin: 0; padding: 0; }\n"
						+ ".clear { clear: both; }\n"
						+ ".description { margin: 2em 0 0 0; }\n";
		postMessage(2, "Creating cover image...");
		createCoverImage(story_metadata["title"], story_metadata["author"], function(base64img)
		{
			cover_html  = "\t\t<section id=\"cover\">\n"
						+ "\t\t\t<header>\n"
						+ "\t\t\t\t<h1>" + story_metadata["title"] + "</h1>\n"
						+ "\t\t\t\t<h3>by " + story_metadata["author"] + "</h3>\n"
						+ "\t\t\t</header>\n"
						+ "\t\t\t<img id=\"cover_img\" src=\"" + base64img + "\">\n"
						+ "\t\t\t<div class=\"info\">\n"
						+ "\t\t\t\t<ul>\n"
						+ "\t\t\t\t\t<li><strong>Story Link: </strong><a href=\"" + story_metadata["link_story"] + "\">Click here</a></li>\n"
						+ "\t\t\t\t\t<li><strong>Author Link: </strong><a href=\"" + story_metadata["link_author"] + "\">Click here</a></li>\n"
						+ "\t\t\t\t\t<li><strong>Rating:</strong> " + story_metadata["rating"] + "</li>\n"
						+ "\t\t\t\t\t<li><strong>Genre(s):</strong> " + story_metadata["genre"] + "</li>\n"
						+ "\t\t\t\t\t<li><strong>Chapters:</strong> " + formatTimestamp(story_metadata["num_chapters"]) + "</li>\n"
						+ "\t\t\t\t\t<li><strong>Word Count:</strong> " + story_metadata["num_words"] + "</li>\n"
						+ "\t\t\t\t\t<li><strong>Last Updated:</strong> " + story_metadata["date_updated"] + "</li>\n"
						+ "\t\t\t\t\t<li><strong>Published:</strong> " + formatTimestamp(story_metadata["date_publish"]) + "</li>\n"
						+ "\t\t\t\t\t<li><strong>Status:</strong> " + story_metadata["status"] + "</li>\n"
						+ "\t\t\t\t\t<li><strong>Source:</strong> " + story_metadata["source"] + "</li>\n"
						+ "\t\t\t\t</ul>\n"
						+ "\t\t\t\t<p class=\"description\"><strong>Description:</strong><br>" + story_metadata["description"] + "</p>\n"
						+ "\t\t\t</div>\n"
						+ "\t\t\t<div class=\"clear\"></div>\n"
						+ "\t\t</section>\n";
			var raw  = "<html lang=\"en\">\n"
					 + "\t<head>\n"
					 + "\t\t<meta charset=\"UTF-8\">\n"
					 + "\t\t<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n"
					 + "\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
					 + "\t\t<title>" + story_metadata["author"] + " - " + story_metadata["title"] + "</title>\n"
					 + "\t\t<style>\n"
					 + html_styles
					 + "\t\t</style>\n"
					 + "\t</head>\n"
					 + "\t<body>\n"
					 + "\t\t<div class=\"wrapper\">\n"
					 + cover_html
					 + html.createTOC()
					 + html.createChapters()
					 + "\t\t</div>\n"
					 + "\t</body>\n"
					 + "</html>\n";
			postMessage(2, "Generating HTML file...");
			var file = new Blob([raw], {type: "text/html;charset=utf-8"});
			postMessage(2, "Saving file...");
			if (saveAs(file, story_metadata["title"] + ".html"))
			{
				postMessage(1, "Story downloaded successfully!");
			}
		});
	},
	createTOC: function()
	{
		var toc = '<section id="toc"><h2>Table of Contents</h2><ol>';
		$.each(story_chapters, function(index, chapter)
		{
			toc += '<li><a href="#chapter_' + (index + 1) + '">' + chapter.title + '</a></li>';
		});
		toc += '</ol></section>';
		return toc;
	},
	createChapters: function()
	{
		var chapters = "";
		$.each(story_chapters, function(index, chapter)
		{
			chapters += "\t\t<section class=\"chapter\" id=\"chapter_" + (index + 1) + "\">\n"
					  + "\t\t\t<h2>" + chapter.title + "</h2>\n"
					  + "\t\t\t" + chapter.content
					  + "\t\t</section>\n";
		});
		return chapters;
	}
};