import * as App from "./App.js";
import * as Assets from "./Assets.js";

Assets.load()
	.then(App.main)
	.catch(console.error);
