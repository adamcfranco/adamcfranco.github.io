var autoplay = true;
var interval = 8000;
var currentIndex = 0;
var numSlides;
var slideWidth;
var containerWidth;

$(function() {


	numSlides = $('.slideshow .slides li').size();
	maxIndex = numSlides - 1;
	slideWidth = 100 / numSlides + "%";
	containerWidth = 100 * numSlides + "%";
	$('.slideshow .slides li').css('width', slideWidth);
	$('.slideshow .slides').css('width', containerWidth);


	// Autoplay Functionality
	setInterval(function(){
		if (autoplay) { 
			nextSlide();	
		}
	}, interval);


	// Controls
	$('#control_autoplay').click(function() {
		if (autoplay) {
			autoplay = false;
		} else {
			autoplay = true;
		}
		$(this).children('i').toggleClass("fa-play");
		$(this).children('i').toggleClass("fa-pause");
	});
	$('#control_left').click(function() {
		prevSlide();
		override();
	});
	$('#control_right').click(function() {
		nextSlide();
		override();
	});

	// Create Map
	$('.controls')
	.append($("<ul></ul>")
			.addClass("map")
			.append($("<li></li>"))
	);
	for (i = 1; i <= numSlides; i++) {
		$('.map li')
		.append($('<a></a>')
			.addClass("map-item")
		);
	}


	// Map Controls
	$('.map-item').click(function() {
		currentIndex = $('.map li a').index(this);
		setSlide(currentIndex);
		override();
	});

	// Initialize
	updateMap();

});

function prevSlide() {
	if (currentIndex <= 0) {
		currentIndex = maxIndex;
	} else {
		currentIndex--;
	}
	setSlide(currentIndex);
}
function nextSlide() {
	if (currentIndex >= maxIndex) {
		currentIndex = 0;
	} else {
		currentIndex++;
	}
	setSlide(currentIndex);
}
function updateMap() {
	$('.map li a').removeClass("active");
	$('.map li a:eq('+currentIndex+')').addClass("active");
}
function override() {
	autoplay = false;
	$("#control_autoplay").children('i').addClass("fa-play");
	$("#control_autoplay").children('i').removeClass("fa-pause");
}
function setSlide(index) {
	var currentLeft = -index * 100 + "%";
	$('.slideshow .slides').css('left', currentLeft);
	updateMap();
}