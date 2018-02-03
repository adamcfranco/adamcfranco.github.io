<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge"> 
		<meta name="viewport" content="width=device-width, initial-scale=1"> 
		<title>Dank Memes</title>
		<meta name="description" content="">
		<meta name="keywords" content="">
		<meta name="author" content="">
		<meta name="shortcut icon" content="favicon.ico">
		<link rel="stylesheet" type="text/css" href="_common/main.css">
	</head>
	<body>
		<div class="container">
			<h2>Dank Memes</h2>
			<ul>
				<?php
				$dirs = glob('*', GLOB_ONLYDIR);
				unset($dirs[0]);
				foreach ($dirs as $index => $dir) {
					$url = "./{$dir}";
					$name = str_replace("_", " ", $dir);
					$name = ucwords($name);
					?><li><a href="<?= $url; ?>"><?= $name; ?></a></li><?php
				}
				?>
			</ul>
		</div>
	</body>
</html>