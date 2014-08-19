var THREE = require('n3d-threejs')
,   OrbitControls = require('./modules/OrbitControls')(THREE)
,   AnimationFrame = require('animation-frame').shim()
,   Utils = require('./modules/utils')
,   Particle = require('./modules/particle')
,	Gui = require('./modules/gui')
,	Dom = require('./modules/dom')

var GameOfLife = {} //proto

GameOfLife.P = Particle(GameOfLife)

GameOfLife.init = function() {

	// THREE setup (rendered/scene/camera/fog/controls)
	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 )
	this.camera.position.z = 1000
	this.controls = new THREE.OrbitControls( this.camera )
	this.controls.autoRotate = true
	this.scene = new THREE.Scene()
	this.scene.fog = new THREE.FogExp2( 0x000000, 0.0004 )
	this.renderer = new THREE.WebGLRenderer()
	this.renderer.setSize( window.innerWidth, window.innerHeight )

	this.particles = this.PARTICLE.reset.call(this)

	this.vectorArray = []

	Dom.init(this.renderer, this.camera)
	Gui.init()

	this.isRunning = true
}

//todo: bind to dat.gui
function reset() {
	this.particles = Particle.reset(scene)
}

GameOfLife.update = function() {

	this.updateParticles()
	this.updateParticles2()
}

GameOfLife.animate = function() {

	Gui.step_begin()

	if(this.isRunning === true) this.update()

	this.renderer.render( this.scene, this.camera )

	Gui.step_end()

	requestAnimationFrame( this.animate.bind(this) )
}


// window.step = function() {
// 	update()
// }

GameOfLife.calcDistance = function(p1,p2) {
	var o = ( (Math.pow((p1.x - p2.x),2)) + (Math.pow((p1.y - p2.y),2)) + (Math.pow((p1.z - p2.z),2)) )
	o = Math.sqrt(o)
	return o
}

GameOfLife.updateParticles = function() {

	var p1, p2, vectors = []

	for(var i=0; i<this.particles.length; i++) {

		// particle one
		p1 = this.particles[i]

		// reset neighbor array
		p1.neighbors = []

		for(var j=0; j<this.particles.length; j++) {

			// particle two
			p2 = this.particles[j]

			if( this.calcDistance(p1,p2) < 300 ) {

				// check if is neighbor
				if(p2.neighbors.indexOf(p1.id) !== -1) continue

				// check if is self
				if(p2.id === p1.id) continue

				// update neighbor array
				p1.neighbors.push(p2.id)

				vectors.push(p1,p2)
			}	
		}
	}

	this.drawVectorsEach(vectors)
	vectors = []
}

// update position
GameOfLife.updateParticles2 = function() {

	var p1

	for(var i=0; i<this.particles.length; i++) {

		p1 = this.particles[i]

		// accelerate
		p1.x += p1.a.x
		p1.y += p1.a.y
		p1.z += p1.a.z

		// bounce on wall collision
		if(p1.x > 1000) p1.a.x = -Math.abs(p1.a.x)
		if(p1.y > 1000) p1.a.y = -Math.abs(p1.a.y)
		if(p1.z > 1000) p1.a.z = -Math.abs(p1.a.z)
		if(p1.x < -1000) p1.a.x = Math.abs(p1.a.x)
		if(p1.y < -1000) p1.a.y = Math.abs(p1.a.y)
		if(p1.z < -1000) p1.a.z = Math.abs(p1.a.z)

	}
}

GameOfLife.drawVectorsEach = function(vectors) {

	// remove vectors from scene
	for(var i=0; i<this.vectorArray.length; i++) {
		this.scene.remove(this.vectorArray[i])
	}
	// clear array
	this.vectorArray = []


	var material = new THREE.LineBasicMaterial({ color: 'red' })

	for(var i=0; i<vectors.length; i+=2) {

		var geometry = new THREE.Geometry()

		var vec1 = vectors[i]
		var vec2 = vectors[i+1]

		var vert1 = new THREE.Vector3(vec1.x, vec1.y, vec1.z)
		var vert2 = new THREE.Vector3(vec2.x, vec2.y, vec2.z)

		geometry.vertices.push( vert1, vert2 )

		var line = new THREE.Line( geometry, material )

		this.vectorArray.push(line)

		this.scene.add(line)
	}
}

window.instance = Object.create(GameOfLife)

window.instance.init()
window.instance.animate()

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