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

	//test
	initVector()
}

//todo: bind to dat.gui
function reset() {
	particles = Particle.reset(scene);
}

function animate() {

	Gui.step_begin()

	update();
	render();

	Gui.step_end()

	requestAnimationFrame( animate );
}

function update() {
	updateParticles()
	updateParticles2()
}

function render() {

	renderer.render( scene, camera );
}


function updateParticles() {

	var p1, p2, vectors = []

	for(var i=0; i<particles.length; i++) {

		p1 = particles[i];

		for(var j=0; j<particles.length; j++) {
			p2 = particles[j];

			if(calcDistance(p1,p2) < 1) {
				vectors.push(p1,p2)
			}	
		}
	}

	drawVectors(vectors)
	vectors = [];
}

// applies velocity
function updateParticles2() {

	var p1;

	for(var i=0; i<particles.length; i++) {

		p1 = particles[i];

		p1.x += p1.velocity.x;
		p1.y += p1.velocity.y;
		p1.z += p1.velocity.z;

		// bounce logic
		if(p1.x > 500) p1.velocity.x = -Math.abs(p1.velocity.x)
		if(p1.y > 500) p1.velocity.y = -Math.abs(p1.velocity.y)
		if(p1.z > 500) p1.velocity.z = -Math.abs(p1.velocity.z)
		if(p1.x < -500) p1.velocity.x = Math.abs(p1.velocity.x)
		if(p1.y < -500) p1.velocity.y = Math.abs(p1.velocity.y)
		if(p1.z < -500) p1.velocity.z = Math.abs(p1.velocity.z)

	}
}

function calcDistance(p1,p2) {
	var o = ( (Math.pow((p1.x - p2.x),2)) + (Math.pow((p1.y - p2.y),2)) + (Math.pow((p1.z - p2.z),2)) );
	return Math.sqrt(o);
}

// should be single geometry with alphas
function drawVector(p1,p2) {

	var material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });

	var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));
    geometry.vertices.push(new THREE.Vector3(p2.x, p2.y, p2.z));

    var line = new THREE.Line(geometry, material);
    scene.add(line);
}

var geo, line;

function initVector(){

	var material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
	geo = new THREE.Geometry();

	for(var i=0; i<1000; i++) {
		geo.vertices.push(new THREE.Vector3(i,i,i));
	}
	line = new THREE.Line(geo, material);

    scene.add(line);

    console.log(line)
}

// should be single geometry with alphas
function drawVectors(vectors) {
	for(var i=0; i<1000; i+=2) {

		var p1 = vectors[i]
		var p2 = vectors[i+1]

		geo.vertices[i].set(p1.x, p1.y, p1.z)
		geo.vertices[i+1].set(p2.x, p2.y, p2.z)

	}
	line.geometry.verticesNeedUpdate = true;
}