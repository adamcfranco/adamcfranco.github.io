var ball_h = 100;
var step = 0;

function animateBalls() {
	$("span").each(function (i) {
		$(this).css('top', getY(i, step, -48));
	});
	step++;
}
function getY(i, t, offset) {
	return offset + ball_h / 2 * (1 + Math.sin((step * (i / 500 + 0.02)) % 2 * Math.PI));
}


$(document).ready(function() {
	setInterval(animateBalls, 8);
});