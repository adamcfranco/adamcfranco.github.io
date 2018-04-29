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
		var meta_url = "www.fanfiction.net/s/" + story_id + "/";
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
			     link_story: "http://" + meta_url,
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
			var chapter_url = "www.fanfiction.net/s/" + story_id + "/" + chapter_number + "/";
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
		var meta_url = "www.fictionpress.com/s/" + story_id + "/";
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
			     link_story: "http://" + meta_url,
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
			var chapter_url = "www.fictionpress.com/s/" + story_id + "/" + chapter_number + "/";
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