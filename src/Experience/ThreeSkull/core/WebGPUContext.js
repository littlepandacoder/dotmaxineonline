import * as THREE from "three/webgpu";

class WebGPUContext {
	constructor(container) {
		if (!!WebGPUContext.instance) {
			return WebGPUContext.instance;
		}

		this.container = container;
		this.renderer = null;
		this.canvas = null;
		this.pixelRatio = Math.min(window.devicePixelRatio, 2.0);

		WebGPUContext.instance = this;
	}

	async init() {
		this.canvas = this.#createCanvas();
		this.renderer = new THREE.WebGPURenderer({
			canvas: this.canvas,
			antialias: false,
		});

		await this.renderer.init();

		const { width, height } = this.getFullScreenDimensions();
		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(this.pixelRatio);
		this.renderer.shadowMap.enabled = false;
		this.renderer.autoClear = false;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
	}

	getFullScreenDimensions() {
		return {
			width: this.container.offsetWidth || window.innerWidth,
			height: this.container.offsetHeight || window.innerHeight,
		};
	}

	#createCanvas() {
		const canvas = document.createElement("canvas");
		canvas.style.position = "absolute";
		canvas.style.left = "0";
		canvas.style.top = "0";
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		canvas.style.zIndex = "0";
		canvas.style.pointerEvents = "auto";
		this.container.appendChild(canvas);
		return canvas;
	}

	onResize(width, height) {
		this.pixelRatio = Math.min(window.devicePixelRatio, 2);
		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(this.pixelRatio);
	}
}

WebGPUContext.instance = null;

export default WebGPUContext;
