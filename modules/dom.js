module.exports.init = function(renderer, camera) {

	// temp css 'reset'
	document.body.style.margin = 0;
	document.body.style.overflow = "hidden";

	// append canvas
	var container = document.createElement( 'div' );
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );

	// resize event
	window.addEventListener( 'resize', onWindowResize, false );
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
}