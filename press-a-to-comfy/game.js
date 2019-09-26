let app = new PIXI.Application({ width: 1920, height: 1080 });
let assets;

PIXI.Loader.shared
	.add("comfy", "./comfy.png")
	.add("not-comfy", "./nocomfy.png")
	.add("comfysound", "./comfysound.ogg")
	.load((loader, resources) => {
		assets = resources;
		start();
	});

function start() {
	document.body.appendChild(app.view);
	const comfySprite = new PIXI.Sprite(assets["comfy"].texture);
	const notComfySprite = new PIXI.Sprite(assets["not-comfy"].texture);
	const comfySound = assets["comfysound"].data;
	comfySprite.visible = false;

	const textStyle = {
		fontFamily: "Arial",
		fontSize: "50px",
		fill: "white"
	};
	const text = new PIXI.Text("press a to comfy", textStyle);
	text.position.set(1920 - 400, 540);

	app.stage.addChild(notComfySprite, text, comfySprite);
	window.addEventListener("keydown", event => {
		if (event.key === "a") {
			comfySprite.visible = true;
			comfySound.play();
		}
	});
	window.addEventListener("keyup", event => {
		if (event.key === "a") {
			comfySprite.visible = false;
			comfySound.pause();
			comfySound.currentTime = 0;
		}
	});
}
