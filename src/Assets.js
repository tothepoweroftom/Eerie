import { SMAAImageLoader } from "postprocessing";
import { CubeTextureLoader, LoadingManager, sRGBEncoding } from "three";

/**
 * Loads scene assets.
 *
 * @return {Promise} A promise that returns a collection of assets.
 */

export function load() {

	const assets = new Map();
	const loadingManager = new LoadingManager();
	const smaaImageLoader = new SMAAImageLoader(loadingManager);
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	const path =
		"./textures/skies/space-dark/";
	const format = ".jpg";
	const urls = [
		path + "px" + format,
		path + "nx" + format,
		path + "py" + format,
		path + "ny" + format,
		path + "pz" + format,
		path + "nz" + format
	];

	return new Promise((resolve, reject) => {

		loadingManager.onError = reject;
		loadingManager.onLoad = () => resolve(assets);

		cubeTextureLoader.load(urls, t => {

			t.encoding = sRGBEncoding;
			assets.set("sky", t);

		});

		smaaImageLoader.load(([search, area]) => {

			assets.set("smaa-search", search);
			assets.set("smaa-area", area);

		});

	});

}
