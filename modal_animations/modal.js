$(function() {
	$('[data-modal]').click(function () {
		var id = $(this).data("modal");
		$("#"+id).addClass("active");
	});
	$('.md-close').click(function() {
		$(this).closest('.md').removeClass("active");
	});
});
