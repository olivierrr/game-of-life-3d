var THREE = require('n3d-threejs')
,   OrbitControls = require('./modules/OrbitControls')(THREE)
,   AnimationFrame = require('animation-frame').shim()
,   Utils = require('./modules/utils')
,   Particle = require('./modules/particle')
,	Gui = require('./modules/gui')
,	Dom = require('./modules/dom')

var GameOfLife = {} //proto

GameOfLife.init = function() {

	//setings
	this.minDistance = 300
	this.maxParticleCount = 200

	// THREE setup (rendered/scene/camera/fog/controls)
	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 )
	this.camera.position.z = 1000
	this.controls = new THREE.OrbitControls( this.camera )
	this.controls.maxDistance = 2500
	this.scene = new THREE.Scene()
	this.scene.fog = new THREE.FogExp2( 0x000000, 0.0004 )
	this.renderer = new THREE.WebGLRenderer()
	this.renderer.setSize( window.innerWidth, window.innerHeight )

	// holds all vectors
	this.vectorArray = []

	// particle cloud
	this.particleSystem

	// particles geometry blob
	this.particlesGeo

	// holds all particles
	this.particles = []

	// holds all INACTIVE particles
	this.particlesInactive = []

	// reset particles
	this.resetParticles()

	// append scene to dom
	Dom.init(this.renderer, this.camera)

	// FPS meter and GUI
	Gui.init()

	this.isRunning = true

	// start up animation loop
	this.animate()

}

GameOfLife.reset = function() {

	//particle reset
	this.scene.remove(this.particleSystem)
	this.resetParticles()

	//vector reset
	//todo
}

GameOfLife.newParticle = function() {

	// new particle
    var particle = new THREE.Vector3()

    // set particle position
    particle.x = Math.random() * 2000 - 1000
    particle.y = Math.random() * 2000 - 1000
    particle.z = Math.random() * 2000 - 1000

    // set particle acceleration
    particle.a = {}
    particle.a.x = Math.random() - 0.5
    particle.a.y = Math.random() - 0.5
    particle.a.z = Math.random() - 0.5

    // set state to active
    particle.isActive = true

    // set particle id
    particle.id = Math.random()

    // holds particles this particle is connected to
    particle.neighbors = []

    // add particle to geometry blob
    this.particlesGeo.vertices.push(particle)
}

GameOfLife.resetParticles = function() {
	
	var particleMaterial

    this.particlesGeo = new THREE.Geometry()

    // create particles with random position values
    for (var i = 0; i < this.maxParticleCount; i++) {
        this.newParticle()
    }

    particleMaterial = new THREE.PointCloudMaterial({ size: 5 })

    this.particleSystem = new THREE.PointCloud(this.particlesGeo, particleMaterial)

    // enables particle updating
    this.particleSystem.sortParticles = true

    // set particle array
    this.particles = this.particlesGeo.vertices

    // add particle system to scene
    this.scene.add(this.particleSystem)

}

GameOfLife.update = function() {

	this.updateParticles()
	this.updateParticles2()
	this.updateParticles3()
}

GameOfLife.animate = function() {

	Gui.step_begin()

	if(this.isRunning === true) this.update()

	this.renderer.render( this.scene, this.camera )

	Gui.step_end()

	requestAnimationFrame( this.animate.bind(this) )
}

GameOfLife.updateParticles = function() {

	var p1, p2, vectorsPoints = []

	for(var i=0; i<this.particles.length; i++) {

		// particle one
		p1 = this.particles[i]

		// check if is active
		if(p1.isActive === false) continue

		// reset neighbor array
		p1.neighbors = []

		for(var j=0; j<this.particles.length; j++) {

			// particle two
			p2 = this.particles[j]

			// check if is active
			if(p2.isActive === false) continue

			if( Utils.calcDistance(p1,p2) < this.minDistance ) {

				// check if is neighbor
				if(p2.neighbors.indexOf(p1.id) !== -1) continue

				// check if is self
				if(p2.id === p1.id) continue

				// update neighbor array
				p1.neighbors.push(p2.id)

				vectorsPoints.push(p1,p2)
			}	
		}
	}

	// draw vectors
	this.drawVectorsEach(vectorsPoints)

	// clear vector array for next loop
	vectorsPoints = []
}

// update position
GameOfLife.updateParticles2 = function() {

	var p1

	for(var i=0; i<this.particles.length; i++) {

		p1 = this.particles[i]

		// check if is active
		if(p1.isActive === false) continue

		// bounce on wall collision
		if(p1.x > 1000) p1.a.x = -Math.abs(p1.a.x)
		if(p1.y > 1000) p1.a.y = -Math.abs(p1.a.y)
		if(p1.z > 1000) p1.a.z = -Math.abs(p1.a.z)
		if(p1.x < -1000) p1.a.x = Math.abs(p1.a.x)
		if(p1.y < -1000) p1.a.y = Math.abs(p1.a.y)
		if(p1.z < -1000) p1.a.z = Math.abs(p1.a.z)

		// accelerate
		p1.x += p1.a.x
		p1.y += p1.a.y
		p1.z += p1.a.z

	}
}

GameOfLife.updateParticles3 = function() {

	var p1

	for(var i=0; i<this.particles.length; i++) {

		p1 = this.particles[i]

		// check if is active
		if(p1.isActive === false) continue

		if(p1.neighbors.length > 5) {
			
			p1.x = 5000
			p1.y = 5000
			p1.z = 5000

			p1.isActive = false
		}

	}
}

GameOfLife.drawVectorsEach = function(vectors) {

	// remove vectors from scene
	for(var i=0; i<this.vectorArray.length; i++) {
		this.scene.remove(this.vectorArray[i])
	}
	// clear array
	this.vectorArray = []

	var vectorGeo, point1, point2, vector

	var vectorMaterial = new THREE.LineBasicMaterial({ color: 'red' })

	for(var i=0; i<vectors.length; i+=2) {

		vectorGeo = new THREE.Geometry()

		point1 = vectors[i] 
		point2 = vectors[i+1]

		point1 = new THREE.Vector3(point1.x, point1.y, point1.z)
		point2 = new THREE.Vector3(point2.x, point2.y, point2.z)

		vectorGeo.vertices.push( point1, point2 )

		vector = new THREE.Line( vectorGeo, vectorMaterial )

		this.vectorArray.push(vector)

		this.scene.add(vector)
	}
}

// 'settings'

GameOfLife.settings_stop = function() {

	this.isRunning = false
}

GameOfLife.settings_step = function() {

	if(this.isRunning === false) this.update()
}

GameOfLife.settings_resume = function() {

	this.isRunning = true
}

GameOfLife.settings_reset = function() {

	this.reset()
}

GameOfLife.settings_maxParticleCount = function(val) {

	this.maxParticleCount = val
}

GameOfLife.settings_minDistance = function(val) {

	this.minDistance = val
}

// start

window.o = Object.create(GameOfLife)

window.o.init()

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