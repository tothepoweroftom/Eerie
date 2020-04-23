import * as App from "./app.js";
import * as Assets from "./Assets.js";
import "./css/style.css"
// import "./css/mqueries.css"
import $ from "jquery";

let muteState = false;

$('#info-button').click(()=>{
	$('#info-content').toggle(500)
})


Assets.load()
	.then(App.main)
	.catch(console.error); 
