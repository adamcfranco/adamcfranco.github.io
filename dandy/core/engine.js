var story_metadata, story_chapters, story_id, site_namespace, format_namespace, was_successful = false, chapter_links = {};
let supported_formats = [ "EPUB", "HTML" ];
let supported_sites = [ "fanfiction.net", "fictionpress.com","harrypotterfanfiction.com" ];
let tidy_options = 
{
	"indent": "auto",
	"indent-spaces": 4,
	"markup": true,
	"output-xml": true,
	"show-warnings": false
}
/******************************

	MAIN

******************************/
function startProcess(url, fmt)
{
	clearMessages();
	postMessage(2, "Trying to download <strong>" + url + "</strong> in <strong>" + fmt + "</strong> format.");
	$("#dds-status h3").text("Status: Working...");
	setEngineRunning();
	if (validateURL(url))
	{
		if (checkSupportForURL(url))
		{
			if (checkSupportForFormat(fmt))
			{
				site_namespace = getNamespace(supported_sites, url);
				format_namespace = getNamespace(supported_formats, fmt);
				window[site_namespace].getStoryID(url, function(id)
				{
					story_id = id;
					if (!(typeof story_metadata === 'undefined') && was_successful)
					{
						if (story_metadata["id"] == story_id)
						{
							postMessage(2, "Story was just downloaded. Skipping to file creation.");
							window[format_namespace].createFile(story_metadata, story_chapters);
						}
						else
						{
							downloadStory();
						}
					}
					else
					{
						downloadStory();
					}
				});
			}
		}
	}
}

function downloadStory()
{
	postMessage(2, "Getting story metadata...");
	window[site_namespace].getMetadata(story_id, function(metadata)
	{
		story_metadata = cleanMetadata(metadata);
		printPreview(story_metadata);
		postMessage(1, "Parsed metadata successfully. Preview now available.");
		window[site_namespace].getChapters(story_id, story_metadata["num_chapters"], function(chapters)
		{
			story_chapters = chapters;
			window[format_namespace].createFile(story_metadata, story_chapters);
		});
	});
}

function cleanChapterContent(html)
{
	html = br2p(html).replace(/<[^\/>][^>]*><\/[^>]+>/gi, '').replace(/\s[\s]+/g, ' ');
	var result = tidy_html5(html, tidy_options);
	return result;
}

function cleanMetadata(array)
{
	$.each(array, function(key, value)
	{
		array[key] = $.trim(value).replace(/\s\s+/g, ' ');
		if (array[key] === null || array[key] == " " || array[key] == "")
		{
			array[key] = "N/A";
		}
	});
	return array;
}

function br2p(html)
{
	var regex = /<br\s*[\/]?>/gi;
	html = html.replace(regex, '\n');
	var parts = html.split("\n");
	html = "<p>" + parts.join("</p><p>") + "</p>";
	return html;
}
function getWebPage(site, xpath, charset, callback)
{
	if (!xpath) xpath = "*";
	if (!charset) charset = "utf-8";
	if (!site)
	{
		postMessage(0, "No site was passed in getWebPage.");
		return false;
	}
	$.ajax({
		type: "POST",
		url: "https://anyorigin.com/go?url=" + encodeURIComponent(site) + "&callback=?",
		contentType: "application/html; charset="+charset,
		dataType: "json",
		success: function(json)
		{
			var page = json.contents.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<img[^>]+>/gi, '');
			var doc = new DOMParser().parseFromString(page, 'text/html');
			var nodes = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
	        var result = nodes.iterateNext();
	        var final = [];   
	        while (result) {
	           	final.push(result);
	            result = nodes.iterateNext();
	        }
			callback(final);
		},
		error: function(xhr,textStatus, errorThrown)
		{
			console.log("ERROR: " + xhr.responseText);
		}
	});
}

function createCoverImage(title, author, callback, outputFormat)
{
	var img = new Image();
	img.crossOrigin = 'Anonymous';
	img.onload = function()
	{
		var canvas = document.createElement('CANVAS');
		var ctx = canvas.getContext('2d');
		var dataURL;
		canvas.height = this.height;
		canvas.width = this.width;
		ctx.drawImage(this, 0, 0);
		ctx.fillStyle = "white";
		// Draw Title Text
		ctx.font = "50px Open Sans";
		var lines = getLines(ctx, title, 546);
		var num_lines = lines.length;
		var lines_height = num_lines * 75;
		var y = (448 / 2) - ((lines_height - 75) / 2);
		$.each(lines, function(key, value)
		{
			var lineWidth = ctx.measureText(value).width;
			var x = (canvas.width / 2) - (lineWidth / 2);
			ctx.fillText(value, x, y, 546);
			y += 75;
		});
		// Draw Author Text
		ctx.font = "25px Open Sans";
		var author_text = "by: " + author;
		var author_width = ctx.measureText(author_text).width;
		if (author_width > 546)
		{
			author_text = "by: " + author.substr(17) + "..."; 
			author_width = ctx.measureText(author_text).width;
		}
		ctx.fillText(author_text, (canvas.width / 2) - (author_width / 2), 425, 546);
		dataURL = canvas.toDataURL(outputFormat);
		callback(dataURL);
		canvas = null; 
	};
	img.src = "core/cover.png";
}

function getLines(ctx, text, maxWidth)
{
	var words = text.split(" ");
	var lines = [];
	var currentLine = words[0];
	for (var i = 1; i < words.length; i++) {
		var word = words[i];
		var width = ctx.measureText(currentLine + " " + word).width;
		if (width < maxWidth) {
			currentLine += " " + word;
		} else {
			lines.push(currentLine);
			currentLine = word;
		}
	}
	lines.push(currentLine);
	return lines;
}

function getNamespace(arr, str)
{
	for (var i = 0; i < arr.length; i++)
	{
		var compare = arr[i];
		if (str.indexOf(compare) > -1)
		{
			return compare.replace(".", "");
		}
	}
}

function getMatches(string, regex, index)
{
	index || (index = 1);
	var matches = [];
	var match;
	while (match = regex.exec(string))
	{
		matches.push(match[index]);
	}
	return matches;
}

function debugPrint(arr)
{
	for (var key in arr)
	{
		console.log("[" + key + "] => '" + arr[key] + "'");
	}
}

function padString(str, max)
{
	str = str.toString();
	return str.length < max ? padString("0" + str, max) : str;
}

function formatTimestamp(unix)
{
	var d = new Date(unix * 1000);
	return d.getFullYear() + "-" + padString(d.getMonth() + 1, 2) + "-" + padString(d.getDate(), 2);
}

/******************************

	UI

******************************/

var $table = $('#status table');
var $tbody = $('#status table tbody');
var $title = $('#status h3')

$(function()
{

	postMessage(2, "Awaiting user input.");

	$('html').removeClass('no-js');
	
	$('a[data-page]').click(function() 
	{
		var page = $(this).data("page");
		if (page.includes("http://"))
		{
			window.open(page, "_blank");
		}
		$('.dialog-wrapper#'+page).addClass("active");
		return false;
	});
	$('.dialog input').click(function()
		{
			$(this).parents(".dialog-wrapper").removeClass("active");
		});

	$("#download").click(function()
	{
		var input_url = $("#url").val();
		var input_fmt = $("#format span").text();
		startProcess(input_url, input_fmt);
	});

	$(window).click( () => $("#format-list").removeClass("active") );

	$("#format").click((event) => 
	{
		event.stopPropagation();
		$("#format-list").toggleClass("active");
	});

	$("#format-list p").click(function()
	{
		$("#format span").html($(this).text());
	});

	$.each(supported_sites, function(index, value)
	{
		$('#supported-sites').append('<li><small>'+value+'</small></li>');
	});

	$.each(supported_formats, function(index, value)
	{
		$('#dds-fmt').append('<option value="' + value + '">' + value + '</option>');
		$('#supported-formats').append('<li><small>'+value+'</small></li>');
	});

});

function setEngineRunning()
{
	$('body').addClass("running");
	$('.textbox').addClass("disabled");
	$('.cdd').addClass("disabled");
	$('.button').addClass("disabled");
	$('.button, .textbox').prop("disabled", true);
}

function setEngineOff()
{
	$('body').removeClass("running");
	$('.textbox').removeClass("disabled");
	$('.cdd').removeClass("disabled");
	$('.button').removeClass("disabled");
	$('.button, .textbox').prop("disabled", false);
}

function postMessage(type, message)
{
	var time = new Date();
	var hour = time.getHours();
	var minute;
	var denotion = " AM";
	if (hour > 12)
	{
		hour = hour - 12;
		denotion = " PM";
	}
	var msgtype;
	switch (type)
	{
		case 0:
			msgtype = '<i class="fa fa-fw fa-times-circle" title="Error"></i>';
			setEngineOff();
			$title.text("Status: Idle");
			was_successful = false;
			break;
		case 1:
			msgtype = '<i class="fa fa-fw fa-check-circle" title="Success"></i>';
			if (message == "Story downloaded successfully!")
			{
				setEngineOff();
				$title.text("Status: Idle");
				was_successful = true;
			}
			break;
		case 2:
			msgtype = '<i class="fa fa-fw fa-info-circle" title="Update"></i>';
			break;
	}
	var timestamp = ("0" + hour).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + denotion;
	$tbody.prepend('<tr><td class="icon">' + msgtype + '</td><td class="timestamp">' + timestamp + '</td><td class="message-body">' + message + '</td></tr>');
	$table.show();
}

function clearMessages()
{
	$tbody.empty();
	$table.hide();
}

function showProgressbar()
{
	var time = new Date();
	var hour = time.getHours();
	var minute;
	var denotion = " AM";
	if (hour > 12)
	{
		hour = hour - 12;
		denotion = " PM";
	}
	var timestamp = ("0" + hour).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + denotion;
	var progressid = guid();
	var html = '<tr class="progressbar-wrapper"><td class="icon"><i class="fa fa-fw fa-cog fa-spin" title="Active Download"></i></td><td class="timestamp">' + timestamp + '</td><td width="100%"><div class="progressbar" id="' + progressid + '"><div class="progressbar-inner" style="width: 0%"><span class="progressbar-text">Beginning Download</span></div></div></td></tr>';
	$tbody.prepend(html);
	$table.show();
	return progressid;
}

function updateProgressBar(current, max, id)
{
	var bar = $(".progressbar#"+id);
	var percentage = (current / max) * 100;
	if (current > max)
	{
		percentage = 100;
		$('.fa-cog').removeClass('fa-spin').addClass('fa-check-circle').removeClass('fa-cog');
		bar.find(".progressbar-text").html("Completed Chapter Download.");
	}
	else
	{
		bar.find(".progressbar-text").html("Downloading Chapter " + current + " of " + max + ".");
	}
	bar.children(".progressbar-inner").css("width", percentage+"%");
}

function printPreview(metadata)
{

	var html = '<div class="wrapper">'
			 + '<div id="head">'
			 + '<a class="muted" href="' + metadata["link_story"] + '" title="' + metadata["source"] + '">' + metadata["id"] + '</a>'
			 + '<h2>' + metadata["title"] + '</h2>'
			 + 'by <a href="' + metadata["link_author"] + '">' + metadata["author"] + '</a> on ' + formatTimestamp(metadata["date_publish"])
			 + '</div>'
			 + '<p>' + metadata["description"] + '</p>'
			 + '<ul id="meta">'
			 + '<li><a title="Genre(s)">' + metadata["genre"] + '</a></li>'
			 + '<li><a title="Rating">' + metadata["rating"] + '</a></li>'
			 + '<li><a title="Status">' + metadata["status"] + '</a></li>'
			 + '<li><a title="Chapter Count">' + metadata["num_chapters"] + '</a></li>'
			 + '<li><a title="Word Count">' + metadata["num_words"] + '</a></li>'
			 + '<li><a title="Last Update">' + (metadata["date_updated"] == 'Never' ? 'Never' : formatTimestamp(metadata["date_updated"])) + '</a></li>'
			 + '</ul>';
	$('#preview').html(html);
	setTimeout(function()
	{
		$('#preview').removeClass("collapsed");
	}, 500);
}




function guid()
{
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, 
	function(c) 
	{
	    var r = Math.random() * 16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
}