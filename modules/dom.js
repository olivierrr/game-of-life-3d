module.exports.init = function(renderer, camera) {
	document.body.style.margin = 0;
	document.body.style.overflow = "hidden";
	var container = document.createElement( 'div' );
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );

	function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	}
}