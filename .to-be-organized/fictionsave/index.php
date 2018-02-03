<?php require('core/support.php'); ?>
<!DOCTYPE html>
<html class="no-js" lang="en">
	<head>
		<meta charset="iso-8859-1">
		<meta http-equiv="X-UA-Compatible" content="IE=edge"> 
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="keywords" content="fictionsave save story fan fiction download harry potter">
		<meta name="author" content="Adam Franco">
		<meta name="description" content="Ficiton Save allows you to download stories and fanfiction from various websites around the web.">
		<link rel="icon" type="image/png" href="favicon/256.png" sizes="256x256">
		<link rel="icon" type="image/png" href="favicon/128.png" sizes="128x128">
		<link rel="icon" type="image/png" href="favicon/64.png" sizes="64x64">
		<link rel="icon" type="image/png" href="favicon/32.png" sizes="32x32">
		<link rel="icon" type="image/png" href="favicon/16.png" sizes="16x16">
		<link rel="shortcut icon" href="favicon/favicon.ico">
		<title>Fiction.Save, The online story and fanfiction downloader.</title>
		<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
		<link rel="stylesheet" href="core/stylesheet.css">
	</head>
	<body>

		<!--
		
		MODAL SECTIONS

		-->

		<div class="dialog-wrapper" id="about">
			<div class="dialog">
				<div class="dialog-title">Fiction.Save is an online story downloader.</div>
				<div class="dialog-content">
				<p>I don't know what else to say on the matter. If you have a link to a story, and want to make it into a file, then this is the website for you.</p>
				<p>This website is a hobby project I work on when I'm bored. So take it's usability with a grain of salt.</p>
				<p>Created with <span class="heart">&#10084;</span> for the community over at <a href="http://www.reddit.com/r/HPFanFiction">/r/HPFanFiction</a>.</p>
				</div>
				<div class="dialog-options" align="right"><input type="button" class="button flat" value="CLOSE"></div>
			</div>
		</div>

		<div class="dialog-wrapper" id="support">
			<div class="dialog">
				<div class="dialog-title">Support Information</div>
				<div class="dialog-content">
					<p>As this is a hobby project, I'm periodically adding support for different websites and formats, but there is no real time-frame for updates or replies.</p>
					<p>If you are experiencing any issues downloading a story, please send an email to <a href="mailto:help@fiction.save">help@fiction.save</a>. I will try to provide help as often as I can.</p>
					<p><strong>Currently supported websites:</strong></p>
					<ul id="supported_site_list"><?php foreach($supported_websites as $website) echo "<li>$website</li>"; ?></ul>
					<p><strong>Currently supported formats:</strong></p>
					<ul id="supported_format_list"><?php foreach($supported_formats as $format) echo "<li>$format</li>"; ?></ul>
					<p>Have a general question or want to suggest a website/format for a future update? Send an email to <a href="mailto:hello@fiction.save">hello@dandysave.com</a>!</p>
				</div>
				<div class="dialog-options" align="right"><input type="button" class="button flat" value="CLOSE"></div>
			</div>
		</div>

		<!--

		MAIN PAGE

		-->

		<header id="dds-header">
			<div class="wrapper">
				<ul id="dds-nav_links">
					<li><a href="#" data-page="about">about</a></li>
					<li><a href="#" data-page="support">support</a></li>
					<li><a href="#" data-page="contact">contact</a></li>
					<li><a href="#" data-page="prefs">preferences</a></li>
				</ul>
				<h1>FICTIONSAVE</h1>
				<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="990.000000pt" height="135.000000pt" viewBox="0 0 990.000000 135.000000" preserveAspectRatio="xMidYMid meet">
					<g transform="translate(0.000000,135.000000) scale(0.100000,-0.100000)" stroke="none" id="logo">
						<path d="M1607 1335 c-168 -35 -318 -149 -391 -296 -56 -116 -77 -212 -77 -364 -1 -228 50 -380 168 -506 120 -127 262 -176 483 -165 177 9 180 9 180 58 0 40 0 40 -32 34 -18 -4 -76 -9 -128 -13 -275 -17 -455 93 -537 329 -22 62 -26 96 -30 223 -6 173 8 257 56 359 109 227 366 326 649 250 20 -6 22 -3 22 39 0 41 -3 45 -27 51 -64 14 -269 15 -336 1z"/>
						<path d="M3855 1336 c-204 -47 -353 -198 -410 -412 -36 -137 -36 -354 0 -495 45 -172 163 -319 305 -381 107 -47 266 -60 393 -33 198 42 354 201 414 425 25 92 25 377 0 470 -55 205 -183 352 -357 411 -83 27 -257 35 -345 15z m256 -86 c183 -35 315 -178 354 -383 20 -103 19 -287 -1 -385 -30 -151 -113 -276 -222 -335 -93 -51 -233 -69 -353 -47 -177 33 -312 176 -354 376 -19 90 -19 308 0 398 30 141 111 264 215 324 91 54 239 75 361 52z"/>
						<path d="M6523 1335 c-176 -48 -274 -161 -274 -317 1 -192 70 -260 384 -379 71 -27 149 -60 172 -73 225 -132 155 -425 -114 -476 -104 -20 -287 -6 -401 29 l-60 19 0 -44 c0 -54 8 -58 150 -80 198 -29 368 -13 481 47 115 61 173 161 173 294 -1 184 -78 259 -385 375 -161 61 -201 82 -248 129 -84 84 -79 245 8 324 55 49 88 65 170 79 88 15 215 1 319 -35 l71 -25 14 37 c8 20 13 39 10 43 -6 12 -130 46 -203 58 -89 14 -205 11 -267 -5z"/>
						<path d="M0 665 l0 -665 50 0 50 0 0 305 0 305 295 0 295 0 0 40 0 40 -295 0 -295 0 0 280 0 280 310 0 310 0 0 40 0 40 -360 0 -360 0 0 -665z"/>
						<path d="M830 665 l0 -665 50 0 50 0 0 665 0 665 -50 0 -50 0 0 -665z"/>
						<path d="M2070 1285 l0 -45 210 0 210 0 0 -620 0 -620 50 0 50 0 0 620 0 620 210 0 210 0 0 45 0 45 -470 0 -470 0 0 -45z"/>
						<path d="M3110 665 l0 -665 50 0 50 0 0 665 0 665 -50 0 -50 0 0 -665z"/>
						<path d="M4780 665 l0 -665 46 0 45 0 -3 590 c-2 324 1 585 5 581 5 -5 183 -269 395 -587 l387 -579 43 -3 42 -3 0 665 0 666 -45 0 -45 0 -2 -576 -3 -577 -384 577 -384 576 -49 0 -48 0 0 -665z"/>
						<path d="M7292 676 c-144 -360 -262 -659 -262 -665 0 -7 20 -11 49 -11 43 0 51 3 56 23 4 12 46 120 93 240 l85 217 266 0 266 0 94 -240 94 -240 53 0 54 0 -22 53 c-12 28 -130 328 -262 664 l-241 613 -30 0 -31 0 -262 -654z m411 179 c55 -148 102 -276 104 -282 4 -10 -45 -13 -226 -13 -127 0 -231 2 -231 4 0 3 44 119 98 258 55 139 107 278 117 308 l18 55 10 -30 c5 -16 54 -151 110 -300z"/>
						<path d="M8069 1253 c15 -43 126 -342 246 -666 l219 -587 32 0 c28 0 34 5 49 43 40 99 475 1270 475 1278 0 5 -21 9 -47 9 l-48 0 -208 -578 c-115 -317 -211 -584 -214 -592 -3 -8 -33 66 -67 165 -35 99 -127 353 -206 565 -78 212 -147 397 -152 413 -9 24 -15 27 -59 27 l-49 0 29 -77z"/>
						<path d="M9180 665 l0 -665 360 0 360 0 0 40 0 40 -310 0 -310 0 0 290 0 290 290 0 290 0 0 40 0 40 -290 0 -290 0 0 255 0 255 310 0 310 0 0 40 0 40 -360 0 -360 0 0 -665z"/>
					</g>
				</svg>
			</div>
		</header>


		<main id="dds-main">

			<section id="dds-form_wrapper">
				<div class="wrapper">
					<input id="dds-url" name="dds-url" class="textbox" placeholder="URL" value="http://www.harrypotterfanfiction.com/viewstory.php?psid=180497">
					<select id="dds-fmt" name="dds-fmt"><?php foreach($supported_formats as $format) echo "\t\t\t\t<option value=\"$format\">$format</option>\n"; ?></select>
					<button id="dds-sub" name="dds-sub" class="button"><i class="fa fa-fw fa-download"></i><span>DOWNLOAD</span></button>
				</div>
			</section>

			<section id="dds-preview" class="collapsed"></section>

		</main>
		

		<section id="dds-status">
			<div class="wrapper">
				<h3>Status: Idle</h3>
				<div id="dds-status_table_wrapper">
					<table id="dds-status_table">
						<tbody>
						</tbody>
					</table>
				</div>
			</div>
		</section>

		<!--
		
		JAVASCRIPT DISABLED NOTIFICATION

		
		<div id="no-js-notification">
			<div class="wrapper">
				<span class="header-img"></span>
				<p><strong>Hey there,</strong></p>
				<p>Fiction.Save is built on <strong>javascript</strong>. Please enable it and refresh your browser in order to use it!</p>
			</div>
		</div> -->

		<!--
		
		SCRIPTS

		-->

		<script type="text/javascript">
			var supported_sites = <?php echo json_encode($supported_websites); ?>;
			var supported_formats = <?php echo json_encode($supported_formats); ?>;
		</script>

		<script type="text/javascript" src="core/libraries/jquery.min.js"></script>
		<script type="text/javascript" src="core/libraries/FileSaver.min.js"></script>
		<script type="text/javascript" src="core/libraries/jszip.min.js"></script>

		<script type="text/javascript" src="core/modules/dropdown.js"></script>
		<script type="text/javascript" src="core/modules/validation.js"></script>
		<script type="text/javascript" src="core/modules/websites.js"></script>
		<script type="text/javascript" src="core/modules/formats.js"></script>

		<script type="text/javascript" src="core/engine.js"></script>

		<!--
		
		CLOSING TAGS

		-->

	</body>
</html>