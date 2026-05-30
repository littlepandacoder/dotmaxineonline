import * as THREE from "three/webgpu";
import WebGPUContext from "./WebGPUContext";
import Scene from "../scenes/Scene";
import MouseTrail from "../utils/MouseTrail";
import FluidSim from "../postprocessing/FluidSim";
import PostProcessing from "../postprocessing/PostProcessing";

class Three {
	constructor(container) {
		this.container = container;
		this.clock = new THREE.Clock();
		this._rafId = null;
	}

	async run() {
		this.context = new WebGPUContext(this.container);
		await this.context.init();

		this.#setup();
		this.#animate();
		this.#addResizeListener();
	}

	#setup() {
		const { width, height } = this.context.getFullScreenDimensions();
		const pr = this.context.pixelRatio;
		this.scene = new Scene();
		this.mouseTrail = new MouseTrail(width * pr, height * pr);
		this.fluidSim = new FluidSim(width * pr, height * pr);

		this.postProcessing = new PostProcessing(
			this.context.renderer,
			this.scene.solidScene,
			this.scene.wireScene,
			this.scene.camera,
			this.fluidSim.texture,
		);
	}

	#animate() {
		const delta = this.clock.getDelta();

		this.scene.animate(delta, this.clock.elapsedTime);

		this.mouseTrail.update(
			this.scene.cameraRig.mouseNormalized.x,
			this.scene.cameraRig.mouseNormalized.y,
		);
		this.fluidSim.update(this.context.renderer, this.mouseTrail.texture);

		this.postProcessing.render();

		this._rafId = requestAnimationFrame(() => this.#animate());
	}

	#addResizeListener() {
		this._onResize = () => this.#onResize();
		window.addEventListener("resize", this._onResize);
	}

	#onResize() {
		const { width, height } = this.context.getFullScreenDimensions();
		const pr = this.context.pixelRatio;

		this.context.onResize(width, height);
		this.scene.onResize(width, height);
		this.fluidSim.onResize(width * pr, height * pr);
	}

	destroy() {
		if (this._rafId) cancelAnimationFrame(this._rafId);
		if (this._onResize) window.removeEventListener("resize", this._onResize);
		this.fluidSim?.dispose();
		this.postProcessing?.dispose();
		this.mouseTrail?.dispose();
		WebGPUContext.instance = null;
	}
}

export default Three;
