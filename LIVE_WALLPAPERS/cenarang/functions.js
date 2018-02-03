function playFromTime(id, sec) {
	myAudio=document.getElementById(id);
	myAudio.addEventListener('canplaythrough', function() {
		this.currentTime = sec;
		this.play();
	});
}

function colorful() {
	document.body.style.backgroundColor = 'hsl(' + Math.floor( 360 * Math.random() ) + ', 85%, 55%)';
	setTimeout(colorful, 250);
}

function playAudio(file, time) {
	var audio = new Audio(file);
	audio.currentTime = time;
	audio.play();
}