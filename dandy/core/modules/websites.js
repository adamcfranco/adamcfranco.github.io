const CHAPTER_REQUEST_DELAY = 750;
/******************************

HPFANFICARCHIVE.COM

******************************/
var hpfanficarchivecom = 
{
	getStoryID: function(url, callback)
	{
		var regex = /\?sid=([\d]+)/;
		var match = regex.exec(url);
		if (match) callback(match[1]);
		else postMessage(0, "Could not get story ID from url.");
	},
	getMetadata: function(story_id, callback)
	{
		var meta_url = "http://anonymouse.org/cgi-bin/anon-www.cgi/http://www.hpfanficarchive.com/stories/viewstory.php?sid=" + story_id;
		getWebPage(meta_url, "(//div[@id='mainpage'])", "iso-8859-1", function(results)
		{
			postMessage(1, "Grabbed metadata source successfully.");
			postMessage(2, "Parsing metadata...");
			results = $(results)[0].outerHTML;
			let pageTitle = $(parseXPATH(results, "//div[@id='pagetitle']")).html();
			let storyInfo = $(parseXPATH(results, "(//div[@class='block'])[2]")).html();
			let titleHTML = String(getMatches(pageTitle, /<!-- TITLE START -->(.+)<!-- TITLE END -->/g, 0));
			let authorHTML = String(getMatches(pageTitle, /<!-- AUTHOR START -->(.+)<!-- AUTHOR END -->/g, 0));
			let storyTitle = $(titleHTML).text();
			let storyAuthor = $(authorHTML).text();
			let storyDesc = String(getMatches(storyInfo, /<!-- SUMMARY START -->([\S\s]+)<!-- SUMMARY END -->/g, 0));
			storyDesc = removeEmptyTags(storyDesc);
			let genreRaw = String(getMatches(storyInfo, /Genres: <\/span>(.+)<br><span class="label">P/g, 0));
			let genreText = $($.parseHTML(genreRaw)).text().trim();
			let storyRating = String(getMatches(storyInfo, /Rated:<\/span>(.+)<br>/g, 0));
			let wordCount = getMatches(storyInfo, /<!-- WORDCOUNT START -->([\d\,]+)<!-- WORDCOUNT END -->/g, 0);
			let chapCount = parseInt(getMatches(storyInfo, /Chapters: <\/span>(.+)<span/g, 0));
			let publish = new Date(getMatches(storyInfo, /<!-- PUBLISHED START -->(.+)<!-- PUBLISHED END -->/g, 0)).getTime() / 1000;
			let updateMatches = getMatches(storyInfo, /<!-- UPDATED START -->(.+)<!-- UPDATED END -->/g, 0);
			let updated = updateMatches.length > 0 ? new Date(updateMatches).getTime() / 1000 : "Never";
			let status = String(getMatches(storyInfo, /Completed:<\/span>(.+)<br/g, 0)).includes("No") ? "In Progress" : "Complete";
			let linkAuthor = $(authorHTML).attr("href").replace("http://anonymouse.org/cgi-bin/anon-www.cgi/", "");
			let linkStory = meta_url.replace("http://anonymouse.org/cgi-bin/anon-www.cgi/", "");
			let storySource = "Harry Potter FanFic Archive";
			let metadata = { id: story_id, uuid: guid(), title: storyTitle, author: storyAuthor, description: storyDesc, genre: genreText, rating: storyRating, num_words: wordCount, num_chapters: chapCount, date_publish: publish, date_updated: updated, status: status, link_author: linkAuthor, link_story: linkStory, source: storySource };
			callback(metadata);
		});
	},
	getChapters: function(story_id, num_chapters, callback)
	{
		postMessage(2, "Beginning chapter downloads...");
		let progressid = showProgressbar();
		let chapters = [];
		let chapter_number = 1;
		function GetChapter()
		{
			updateProgressBar(chapter_number, num_chapters, progressid);
			let chapter_url = "http://anonymouse.org/cgi-bin/anon-www.cgi/http://www.hpfanficarchive.com/stories/viewstory.php?sid=" + story_id + "&chapter=" + chapter_number; 
			getWebPage(chapter_url, "//div[@id='container']", null, function(results)
			{
				results = $(results)[0].outerHTML;
				let title = String($(results).find('select[name="chapter"]').first().find(":selected").text().replace(chapter_number + ". ", "")) || "Chapter " + chapter_number;
				let content = cleanChapterContent( $(parseXPATH(results, "//div[@id='story']")).html() );
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
				updated = div.children("span.xgray").find("span[data-xutime]:first-of-type").attr("data-xutime");
				publish = div.children("span.xgray").find("span[data-xutime]:nth-of-type(2)").attr("data-xutime");
			}
			else
			{
				updated = "Never";
				publish = div.children("span.xgray").find("span[data-xutime]").attr("data-xutime");
			}
			let status = String(getMatches(infoblock, /Status\: ([\w]+)/g, 0)) || "In Progress";
			var metadata = {
				id: story_id,
				uuid: guid(),
				title: div.children("b.xcontrast_txt").text(),
				author: div.children("a.xcontrast_txt:first-of-type").text(),
				description: div.children("div.xcontrast_txt:first-of-type").html(),
				genre: getMatches(infoblock, /\- [\w]+ \- ([\w\/?]+) \-/g, 0),
				rating: getMatches(infoblock, /Rated\: ([\w\s\+]+)/g, 0),
				num_words: getMatches(infoblock, /Words\: ([\d\,]+)/g, 0),
				num_chapters: parseInt(getMatches(infoblock, /Chapters\: ([\d\,]+)/g, 0)) || 1,
				date_publish: publish,
				date_updated: updated,
				status: status,
				link_author: "http://www.fanfiction.net" + div.children("a").attr("href"),
				link_story: "http://" + meta_url,
				source: "FanFiction"
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
				let raw = $(results);
				let title = raw.find("#chap_select").first().find(":selected").text().replace(chapter_number + ". ", "") || "Chapter " + chapter_number;
				let content = cleanChapterContent(raw.find("#storytext").html());
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
				updated = div.children("span.xgray").find("span[data-xutime]:first-of-type").attr("data-xutime");
				publish = div.children("span.xgray").find("span[data-xutime]:nth-of-type(2)").attr("data-xutime");
			}
			else
			{
				updated = "Never";
				publish = div.children("span.xgray").find("span[data-xutime]").attr("data-xutime");
			}
			let status = String(getMatches(infoblock, /Status\: ([\w]+)/g, 0)) || "In Progress";
			var metadata = {
				id: story_id,
				uuid: guid(),
				title: div.children("b.xcontrast_txt").text(),
				author: div.children("a.xcontrast_txt:first-of-type").text(),
				description: div.children("div.xcontrast_txt:first-of-type").html(),
				genre: getMatches(infoblock, /\- [\w]+ \- ([\w\/?]+) \-/g, 0),
				rating: getMatches(infoblock, /Rated\: ([\w\s\+]+)/g, 0),
				num_words: getMatches(infoblock, /Words\: ([\d\,]+)/g, 0),
				num_chapters: parseInt(getMatches(infoblock, /Chapters\: ([\d\,]+)/g, 0)) || 1,
				date_publish: publish,
				date_updated: updated,
				status: status,
				link_author: "http://www.fictionpress.com" + div.children("a").attr("href"),
				link_story: "http://" + meta_url,
				source: "FictionPress"
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
				let raw = $(results);
				let title = raw.find("#chap_select").first().find(":selected").text().replace(chapter_number + ". ", "") || "Chapter " + chapter_number;
				let content = cleanChapterContent(raw.find("#storytext").html());
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