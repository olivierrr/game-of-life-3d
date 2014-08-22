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

	// holds vect points
	this.vectorsPoints = []

	// vector pool // test
	this.vectorPool = []

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

		this.initVectorPool()

	// append scene to dom
	Dom.init(this.renderer, this.camera)

	// FPS meter and GUI
	Gui.init()

	this.isRunning = true

	//this.initVector()

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

    return this.particlesGeo.vertices[this.particlesGeo.vertices.length-1]
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

	// draw vectors
	//this.drawVectorsEach(this.vectorsPoints)
	this.drawVectors()

	// clear vector array for next loop
	this.vectorsPoints = []


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

	var p1, p2

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

				// test
				// if(vectorsPoints[vectorsPoints.length-2]) {
				// 	var last = vectorsPoints[vectorsPoints.length-1]
				// 	var lastlast = vectorsPoints[vectorsPoints.length-2]
				// 	if( last.x === p2.x || last.y === p2.y || last.z === p2.z ) console.log('awdawdawdwdad')
				// }

				this.vectorsPoints.push(p1,p2)
			}	
		}
	}
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

		//console.log(p1.neighbors.length)

		if(p1.neighbors.length > 1) {
			
			this.addParticle(p1)
			continue
		}

		else if(p1.neighbors.length > 3) {

			this.removeParticle(p1)
			continue
		}

		else if(p1.neighbors.length === 0) {

			//console.log('deleted!')
			this.removeParticle(p1)
			continue
		}
	}
}

GameOfLife.removeParticle = function(p1) {

	p1.x = 5000
	p1.y = 5000
	p1.z = 5000

	p1.isActive = false
}

GameOfLife.addParticle = function(inherits) {

	// look for avaliable particle on pool
	for(var i=0; i<this.particles.length; i+=1) {

		if(this.particles[i].isActive === false) {

			p1 = this.particles[i]

			p1.isActive = true

			p1.id = Math.random()

			p1.neighbors = []

			//todo FIX THIS
			var o = Utils.getWihtinSpehere( this.minDistance, inherits )

			p1.x = o.x
			p1.y = o.y
			p1.z = o.z

			return p1
		}
	}

	//console.log('no avaliable particles in pool')

	// if no avaliable partciles in pool
	// create new particle

}

GameOfLife.drawVectors = function() {

	for(var i=0; i<this.vectorPool.length; i+=2) {

		if( this.vectorsPoints[i] && this.vectorsPoints[i+1] ) {

			this.vectorPool[i].vertices[0].x = this.vectorsPoints[i].x
			this.vectorPool[i].vertices[0].y = this.vectorsPoints[i].y
			this.vectorPool[i].vertices[0].z = this.vectorsPoints[i].z

			this.vectorPool[i].vertices[1].x = this.vectorsPoints[i+1].x
			this.vectorPool[i].vertices[1].y = this.vectorsPoints[i+1].y
			this.vectorPool[i].vertices[1].z = this.vectorsPoints[i+1].z

			this.isActive = true

			// update vertices
			this.vectorPool[i].verticesNeedUpdate = true
		}

		else {

			if(this.vectorPool[0].isActive === false) continue

			this.vectorPool[i].vertices[0].x = 5000
			this.vectorPool[i].vertices[0].y = 5000
			this.vectorPool[i].vertices[0].z = 5000

			this.vectorPool[i].vertices[1].x = 5000
			this.vectorPool[i].vertices[1].y = 5000
			this.vectorPool[i].vertices[1].z = 5000

			this.isActive = false

		}

		// TODO: nope
		if(this.particles[0].isActive === false) {
			this.vectorPool[i].verticesNeedUpdate = true
		}
	}
}

GameOfLife.initVectorPool = function() {

	this.vectorPool = []

	var lineGeometry, point1, point2, line
	var lineMaterial = new THREE.LineBasicMaterial({
        color: 0x0000ff
    })

	for(var i=0; i<1000; i++) {

		lineGeometry = new THREE.Geometry()

		point1 = new THREE.Vector3(5000 , 5000, 5000)
		point2 = new THREE.Vector3(5000 , 5000, 5000)

		lineGeometry.vertices.push( point1, point2 )

		line = new THREE.Line( lineGeometry, lineMaterial )

		this.vectorPool.push(line.geometry)

		this.scene.add(line)
		
	}

	console.log(this.vectorPool)
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

/////////////////////////////////////////////////////////////////

window.o = Object.create(GameOfLife)

window.o.init()

