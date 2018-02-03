var ball_h = 100;
var step = 0;

function animateBalls() {
	$("span").each(function (i) {

		var y = getY(i, step, 0)

		$(this).css('top', y);

		if (y > 95)
		{
			$(this).css("background", "red");
		}
		else if (y < 5)
		{
			$(this).css("background", "orange");
		}
		else if (y > 50 && y < 71)
		{
			$(this).css("background", "hotpink");
		}
		else
		{
			$(this).css("background", "turquoise");
		}
	});
	step++;
}
function getY(i, t, offset) {
	return offset + ball_h / 2 * (1 + Math.sin((step * (i / 500 + 0.02)) % 2 * Math.PI));
}

setInterval(animateBalls, 12);