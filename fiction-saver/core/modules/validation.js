/******************************

	VALIDATION

******************************/

function validateURL(url)
{
	postMessage(2, "Validating URL...");
	var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?(\?([-a-zA-Z0-9@:%_\+.~#?&//=]+)|)/ig;
	if (url.match(regex))
	{
		postMessage(1, "URL validated successfully.");
		return true;
	}
	else
	{
		postMessage(0, "URL was unable to be validated.");
		return false;
	}
}

function checkSupportForURL(url)
{
	postMessage(2, "Checking for URL support...");
	if (new RegExp(supported_sites.join("|")).test(url)) {

	    postMessage(1, "URL is supported.");
		return true;
	}
	else
	{
		postMessage(0, "URL is not supported.");
		return false;
	}
}

function checkSupportForFormat(format)
{
	postMessage(2, "Checking for format support...");
	if (!supported_formats.length == 0 && new RegExp(supported_formats.join("|")).test(format))
	{
		postMessage(1, "Format is supported.");
		return true;
	}
	else
	{
		postMessage(0, "Format is not supported.");
		return false;
	}
}