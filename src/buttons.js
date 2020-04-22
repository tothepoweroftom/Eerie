$( document ).ready(function() {
	console.log( "ready!" );
	$( "#info-button" ).click(function() {
		console.log("asdf")
		
	if(document.getElementById("info-content").style.opacity === 1) {
		document.getElementById("info-content").style.opacity = 0;

	} else {
		document.getElementById("info-content").style.opacity = 1;
	}
	});
});
