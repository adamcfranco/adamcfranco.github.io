const CHAPTER_REQUEST_DELAY = 750;
/******************************

	FANFICTION.NET

******************************/
var fanfictionnet = 
{
	getStoryID: function(url, callback)
	{
		var regex = /s\/([\d]+)/;
		var match = regex.exec(url);
		if (match)
		{
			callback(match[1]);
		}
		else
		{
			postMessage(0, "Could not get story ID from url.");
		}
	},
	getMetadata: function(story_id, callback)
	{
		var meta_url = "http://www.fanfiction.net/s/" + story_id + "/";
		getWebPage(meta_url, "//div[@id='profile_top']", null, function(results)
		{
			postMessage(1, "Grabbed metadata source successfully.");
			postMessage(2, "Parsing metadata...");
			var div = $(results);
			var infoblock;
			infoblock = div.children("span.xgray").text();
			var publish, updated;
			if (getMatches(infoblock, /Updated\: ([\w\s\,]+)/g, 0).length > 0)
			{
				updated = div.children("span.xgray").find("span[data-xutime]:first-of-type").attr("data-xutime")
				publish = div.children("span.xgray").find("span[data-xutime]:nth-of-type(2)").attr("data-xutime")
			}
			else
			{
				updated = "Never";
				publish = div.children("span.xgray").find("span[data-xutime]").attr("data-xutime");
			}
			var metadata = {
				         id: story_id,
				       uuid: guid(),
				      title: div.children("b.xcontrast_txt").text(),
				     author: div.children("a.xcontrast_txt:first-of-type").text(),
				description: div.children("div.xcontrast_txt:first-of-type").html(),
				      genre: getMatches(infoblock, /\- [\w]+ \- ([\w\/?]+) \-/g, 0),
				     rating: getMatches(infoblock, /Rated\: ([\w\s\+]+)/g, 0),
				  num_words: getMatches(infoblock, /Words\: ([\d\,]+)/g, 0),
			   num_chapters: parseInt(getMatches(infoblock, /Chapters\: ([\d\,]+)/g, 0)),
			   date_publish: publish,
			   date_updated: updated,
			         status: getMatches(infoblock, /Status\: ([\w]+)/g, 0),
			    link_author: "http://www.fanfiction.net" + div.children("a").attr("href"),
			     link_story: meta_url,
			         source: "FanFiction.net"
			};
			callback(metadata);
		});
	},
	getChapters: function(story_id, num_chapters, callback)
	{
		postMessage(2, "Beginning chapter downloads...");
		var progressid = showProgressbar();
		var chapters = [];
		var chapter_number = 1;
		function GetChapter()
		{
			updateProgressBar(chapter_number, num_chapters, progressid);
			var chapter_url = "http://www.fanfiction.net/s/" + story_id + "/" + chapter_number + "/";
			getWebPage(chapter_url, "//div[@id='content_wrapper_inner']", null, function(results)
			{
				var raw = $(results);
				var title = raw.find("#chap_select").first().find(":selected").text().replace(/^\d\.\ /g, "");
				var content = cleanChapterContent(raw.find("#storytext").html());
				chapters.push({ title, content });
				if (chapter_number >= num_chapters)
				{
					updateProgressBar(num_chapters+1, num_chapters, progressid);
					callback(chapters);
				}
				else
				{
					setTimeout(function()
					{
						chapter_number++;
						GetChapter();
					}, CHAPTER_REQUEST_DELAY);
				}
			});
		}
		GetChapter();
	}
};
/******************************

	FICTIONPRESS.COM

******************************/
var fictionpresscom = 
{
	getStoryID: function(url, callback)
	{
		var regex = /s\/([\d]+)/;
		var match = regex.exec(url);
		if (match)
		{
			callback(match[1]);
		}
		else
		{
			postMessage(0, "Could not get story ID from url.");
		}
	},
	getMetadata: function(story_id, callback)
	{
		var meta_url = "http://www.fictionpress.com/s/" + story_id + "/";
		getWebPage(meta_url, "//div[@id='profile_top']", null, function(results)
		{
			postMessage(1, "Grabbed metadata source successfully.");
			postMessage(2, "Parsing metadata...");
			var div = $(results);
			var infoblock;
			infoblock = div.children("span.xgray").text();
			var publish, updated;
			if (getMatches(infoblock, /Updated\: ([\w\s\,]+)/g, 0).length > 0)
			{
				updated = div.children("span.xgray").find("span[data-xutime]:first-of-type").attr("data-xutime")
				publish = div.children("span.xgray").find("span[data-xutime]:nth-of-type(2)").attr("data-xutime")
			}
			else
			{
				updated = "Never";
				publish = div.children("span.xgray").find("span[data-xutime]").attr("data-xutime");
			}
			var metadata = {
				         id: story_id,
				       uuid: guid(),
				      title: div.children("b.xcontrast_txt").html(),
				     author: div.children("a.xcontrast_txt:first-of-type").html(),
				description: div.children("div.xcontrast_txt:first-of-type").html(),
				      genre: getMatches(infoblock, /\- [\w]+ \- ([\w\/?]+) \-/g, 0),
				     rating: getMatches(infoblock, /Rated\: ([\w\s\+]+)/g, 0),
				  num_words: getMatches(infoblock, /Words\: ([\d\,]+)/g, 0),
			   num_chapters: parseInt(getMatches(infoblock, /Chapters\: ([\d\,]+)/g, 0)),
			   date_publish: publish,
			   date_updated: updated,
			         status: getMatches(infoblock, /Status\: ([\w]+)/g, 0),
			    link_author: "http://www.fictionpress.com" + div.children("a").attr("href"),
			     link_story: meta_url,
			         source: "FictionPress.com"
			};
			callback(metadata);
		});
	},
	getChapters: function(story_id, num_chapters, callback)
	{
		postMessage(2, "Beginning chapter downloads...");
		var progressid = showProgressbar();
		var chapters = [];
		var chapter_number = 1;
		function GetChapter()
		{
			updateProgressBar(chapter_number, num_chapters, progressid);
			var chapter_url = "http://www.fictionpress.com/s/" + story_id + "/" + chapter_number + "/";
			getWebPage(chapter_url, "//div[@id='content_wrapper_inner']", null, function(results)
			{
				var raw = $(results);
				var title = raw.find("#chap_select").first().find(":selected").text().replace(/^\d\.\ /g, "");
				var content = cleanChapterContent(raw.find("#storytext").html());
				chapters.push({ title, content });
				if (chapter_number >= num_chapters)
				{
					updateProgressBar(num_chapters+1, num_chapters, progressid);
					callback(chapters);
				}
				else
				{
					setTimeout(function()
					{
						chapter_number++;
						GetChapter();
					}, CHAPTER_REQUEST_DELAY);
				}
			});
		}
		GetChapter();
	}
};

/******************************

	HARRYPOTTERFANFICTION.COM

******************************/
var harrypotterfanfictioncom = 
{
	getStoryID: function(url, callback)
	{
		getWebPage(url, "//select[@name='chapterid']", "iso-8859-1", function(results)
		{
			var select = $(results[0]);
			var psid = select.find("option:contains('Story Index')").attr("value");
			select.find("option").each(function(i)
			{
				if (i > 1)
				{
					chapter_links[ i - 1 ] = { url: $(this).attr("value"), title: $(this).text().replace(/^\d\.\ /g, "") };			
				}
			});
			var regex = /psid\=([\d]+)/;
			var match = regex.exec(psid);
			if (match)
			{
				callback(match[1]);
			}
			else
			{
				postMessage(0, "Could not get story ID from url.");
			}
		});
	},
	getMetadata: function(story_id, callback)
	{
		var meta_url = "http://www.harrypotterfanfiction.com/viewstory.php?psid=" + story_id;
		getWebPage(meta_url, "//div[@id='mainpage2']", "iso-8859-1", function(results)
		{
			postMessage(1, "Grabbed metadata source successfully.");
			postMessage(2, "Parsing metadata...");
			var div = $(results);
			var table_info = div.find("table.storymaininfo");
			var table_description = div.find("table.storysummary");
			var table_chapterlinks = div.find("table.text");
			var infohtml = table_info.html();
			var regex = /<br\s*[\/]?>/gi
			table_info.html( infohtml.replace(regex, "[END]") );
			var infotext = table_info.text();
			var publish, updated;
			var metadata = {
				         id: story_id,
				       uuid: guid(),
				      title: div.find("a[href*='?psid']:first-of-type").text(),
				     author: div.find("a[href*='showuid']").text(),
				description: table_description.text(),
				      genre: getMatches(infotext, /Genre\(s\)\: ([\w\s\+\,\/]+)\[END\]/g, 0),
				     rating: getMatches(infotext, /Rating\: ([\w\s\+]+)Story/g, 0),
				  num_words: getMatches(infotext, /Words\: ([\d\,]+)\[END\]/g, 0),
			   num_chapters: parseInt(getMatches(infotext, /Chapters\: ([\d\,]+)\[END\]/g, 0)),
			   date_publish: getMatches(infotext, /First Published\: ([\d\.]+)\[END\]/g, 0),
			   date_updated: getMatches(infotext, /Last Updated\: ([\d\.]+)\[END\]/g, 0),
			         status: getMatches(infotext, /Status\: ([\w]+)\[END\]/g, 0),
			    link_author: "http://www.harrypotterfanfiction.com/" + div.find("a[href*='showuid']").attr("href"),
			     link_story: meta_url,
			         source: "HarryPotterFanFiction.com"
			};
			metadata["date_publish"] = new Date(metadata["date_publish"].toString().replace(/\./g, "-")).getTime() / 1000;
			metadata["date_updated"] = new Date(metadata["date_updated"].toString().replace(/\./g, "-")).getTime() / 1000;
			callback(metadata);
		});
	},
	getChapters: function(story_id, num_chapters, callback)
	{
		postMessage(2, "Beginning chapter downloads...");
		var progressid = showProgressbar();
		var chapters = [];
		var chapter_number = 1;
		function GetChapter()
		{
			updateProgressBar(chapter_number, num_chapters, progressid);
			var chapter_url = "http://www.harrypotterfanfiction.com/viewstory.php" + chapter_links[chapter_number].url;
			getWebPage(chapter_url, "//div[@id='fluidtext']", "iso-8859-1", function(results)
			{
				var raw = results[0].innerHTML;
				var title = chapter_links[chapter_number].title;
				var content = cleanChapterContent(raw);
				chapters.push({ title, content });
				if (chapter_number >= num_chapters)
				{
					updateProgressBar(num_chapters + 1, num_chapters, progressid);
					callback(chapters);
				}
				else
				{
					setTimeout(function()
					{
						chapter_number++;
						GetChapter();
					}, CHAPTER_REQUEST_DELAY);
				}
			});
		}
		GetChapter();
	}
};