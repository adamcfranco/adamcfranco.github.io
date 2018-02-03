$(function()
{
	GetItems();
	$(".cdd").click( function(event)
	{
		if (!$(this).hasClass("disabled"))
		{
			event.stopPropagation();
			$(this).toggleClass("cdd-active");
		}
	});
	$(".cdd ul li").click( function()
	{
		var id = $(this).parent().parent().data("cddid");
		var val = $(this).data("cddval");
		$("select[data-cddid="+id+"] option[value="+val+"]").prop("selected", true);
		$(".cdd[data-cddid="+id+"] span").text($(this).text());
	});
	$(window).click(function() {
		$(".cdd").removeClass("cdd-active");
	});
});

function GetItems()
{	
	$("select").each( function() 
	{

		var id = guid();
		var ul = ".cdd[data-cddid=" + id + "] ul";
		var span = ".cdd[data-cddid=" + id + "] span";
		var selected = $(this).val();
		var i = 0;

		$(this).attr("data-cddid", id);
		$(this).addClass("cdd-hide")
		$(this).after("<div data-cddid=\"" + id + "\" class=\"cdd\"><span></span><ul></ul></div>");
		$(span).text(selected);

		$(this).children().each( function()
		{
			var val = $(this).attr("value");
			if (!val)
			{
				$(this).attr("value", i);
				val = i;
			}
			var txt = $(this).text();
			$("<li data-cddval=\""+val+"\">"+txt+"</li>").appendTo(ul);
			i++;
		});

	});

}

function guid()
{
	var d = new Date().getTime();
	if(window.performance && typeof window.performance.now === "function"){
		d += performance.now();
	}
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
}