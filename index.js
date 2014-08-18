var THREE = require('n3d-threejs')
,   OrbitControls = require('./modules/OrbitControls')(THREE)
,   AnimationFrame = require('animation-frame').shim()
,   Utils = require('./modules/utils')
,   Particle = require('./modules/particle')
,	Gui = require('./modules/gui')
,	Dom = require('./modules/dom')

var camera, scene, renderer, controls;

var particles;

var vectorArray = []

running = true;

init();
animate();

function init() {

	// THREE setup (rendered/scene/camera/fog/controls)
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 )
	camera.position.z = 1000
	controls = new THREE.OrbitControls( camera )
	scene = new THREE.Scene()
	scene.fog = new THREE.FogExp2( 0x000000, 0.0004 )
	renderer = new THREE.WebGLRenderer()
	renderer.setSize( window.innerWidth, window.innerHeight )

	particles = Particle.reset(scene);

	Dom.init(renderer, camera)
	Gui.init();
}

//todo: bind to dat.gui
function reset() {
	particles = Particle.reset(scene)
}

function animate() {

	Gui.step_begin()

	if(running === true) update();
	render();

	Gui.step_end()

	requestAnimationFrame( animate )
}

//temp
window.step = function() {
	update()
}

function update() {

	updateParticles()
	updateParticles2()

}

function render() {

	renderer.render( scene, camera )
}

function calcDistance(p1,p2) {
	var o = ( (Math.pow((p1.x - p2.x),2)) + (Math.pow((p1.y - p2.y),2)) + (Math.pow((p1.z - p2.z),2)) )
	o = Math.sqrt(o);
	return o
}

function updateParticles() {

	var p1, p2, vectors = []

	for(var i=0; i<particles.length; i++) {

		p1 = particles[i]

		// reset neighbor array
		p1.neighbors = []

		for(var j=0; j<particles.length; j++) {

			p2 = particles[j]

			if( calcDistance(p1,p2) < 300 ) {

				// check if is neighbor
				if(p2.neighbors.indexOf(p1.id) !== -1) continue

				// check if is self
				if(p2.id === p1.id) continue

				p1.neighbors.push(p2.id)
				vectors.push(p1,p2)
			}	
		}

	}

	drawVectorsEach(vectors)
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

		// bounce on wall collision
		if(p1.x > 1000) p1.velocity.x = -Math.abs(p1.velocity.x)
		if(p1.y > 1000) p1.velocity.y = -Math.abs(p1.velocity.y)
		if(p1.z > 1000) p1.velocity.z = -Math.abs(p1.velocity.z)
		if(p1.x < -1000) p1.velocity.x = Math.abs(p1.velocity.x)
		if(p1.y < -1000) p1.velocity.y = Math.abs(p1.velocity.y)
		if(p1.z < -1000) p1.velocity.z = Math.abs(p1.velocity.z)

	}
}

function drawVectorsEach(vectors) {

	//
	for(var i=0; i<vectorArray.length; i++) {
		scene.remove(vectorArray[i])
	}
	vectorArray = []
	//

	var material = new THREE.LineBasicMaterial({ color: 'red' })

	for(var i=0; i<vectors.length; i+=2) {

		var geometry = new THREE.Geometry()

		var vec1 = vectors[i]
		var vec2 = vectors[i+1]

		var vert1 = new THREE.Vector3(vec1.x, vec1.y, vec1.z)
		var vert2 = new THREE.Vector3(vec2.x, vec2.y, vec2.z)

		geometry.vertices.push( vert1, vert2 )

		var line = new THREE.Line( geometry, material )

		vectorArray.push(line)

		scene.add(line)
	}

}





///////////////////////////////////////////////////////////////////////////////
// vectors should be a single object 
///////////////////////////////////////////////////////////////////////////////
// var geo, line;

// function initVector(){

// 	var color, t = 1

// 	var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors })

// 	geo = new THREE.Geometry()

// 	// initiate vector blob
// 	for(var i=0; i<1000; i+=2) {

// 		var vert1 = new THREE.Vector3(i,i,i)
// 		var vert2 = new THREE.Vector3(i,i,i)

// 		geo.vertices.push( vert1, vert2 );

// 		if(t === 1) {
// 			color = new THREE.Color( 'red' )
// 			t = 0
// 		} else {
// 			color = new THREE.Color( 'blue' )
// 			t = 1
// 		}


// 		geo.colors[i] = color
// 		geo.colors[i+1] = color

// 		//console.log( JSON.stringify(geo.colors[i]) + ' ' + JSON.stringify(geo.colors[i+1]))
// 	}

// 	line = new THREE.Line(geo, material);

//     scene.add(line);

//     console.log(geo)
// }

// // should be single geometry with alphas
// function drawVectors(vectors) {

// 	//console.log(vectors.length)
// 	console.log(vectors)

// 	var last, p1, p2

// 	for(var i=0; i<1000; i+=2) {

// 		p1 = vectors[i]
// 		p2 = vectors[i+1]

// 		if(geo.vertices[i] && geo.vertices[i+1] && p1 && p2) {

// 			//if(i!==0) geo.vertices[i].set(last.x, last.y, last.z)
// 			geo.vertices[i].set(p1.x, p1.y, p1.z)

// 			geo.vertices[i+1].set(p2.x, p2.y, p2.z)

// 			last = p2

// 		} else {

// 			//set slack away in 'pool'
// 			geo.vertices[i].set(i,i,i)
// 			geo.vertices[i+1].set(i,i,i)
// 		}
// 	}

// 	//this should be auto
// 	line.geometry.verticesNeedUpdate = true;
// 	line.geometry.colorsNeedUpdate = true;
// }