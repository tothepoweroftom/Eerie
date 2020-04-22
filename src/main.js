import * as App from "./App.js";
import * as Assets from "./Assets.js";
import "./css/style.css"
import "./css/mqueries.css"

Assets.load()
	.then(App.main)
	.catch(console.error); 
