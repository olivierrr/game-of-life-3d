var THREE = require('n3d-threejs')
,   OrbitControls = require('./modules/OrbitControls')(THREE)
,   AnimationFrame = require('animation-frame').shim()
,   Utils = require('./modules/utils')
,   Particle = require('./modules/particle')
,	Gui = require('./modules/gui')
,	Dom = require('./modules/dom')

var camera, scene, renderer, controls;

var particles;

init();
animate();

function init() {

	// THREE setup (rendered/scene/camera/fog/controls)
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
	camera.position.z = 1000;
	controls = new THREE.OrbitControls( camera );
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.0005 );
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	particles = Particle.reset(scene);

	Dom.init(renderer, camera);
	Gui.init();
}

function animate() {

	requestAnimationFrame( animate );
	update();
	render();
}

function update() {
	//particles[46].x += 10 //test
}

function render() {

	renderer.render( scene, camera );
}