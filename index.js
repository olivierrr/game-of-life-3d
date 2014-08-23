var THREE = require('n3d-threejs')
,   OrbitControls = require('./modules/OrbitControls')(THREE)
,   AnimationFrame = require('animation-frame').shim()
,   Utils = require('./modules/utils')
,   Particle = require('./modules/particle')
,	Gui = require('./modules/gui')
,	Dom = require('./modules/dom')

var GameOfLife = {} //proto

GameOfLife.init = function() {

	// 'setings'
	this.minDistance = 300
	this.maxParticleCount = 200

	// 'rules'
	this.or_more_dies = 5
	this.or_less_dies = 0
	this.equals_offspring = 1

	// THREE setup (rendered/scene/camera/fog/controls)
	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 )
	this.camera.position.z = 1000
	this.controls = new THREE.OrbitControls( this.camera )
	this.controls.maxDistance = 5000
	this.scene = new THREE.Scene()
	//this.scene.fog = new THREE.FogExp2( 0x000000, 0.0004 )
	this.renderer = new THREE.WebGLRenderer()
	this.renderer.setSize( window.innerWidth, window.innerHeight )


	// world size
	this.worldRadius = 800


	// holds line points
	this.linePoints = []

	// line pool 
	this.linePool = []

	// holds active line count
	this.activeLines

	// populate linePool array
	this.initLinePool()


	// particle cloud
	this.particleSystem

	// particles geometry blob
	this.particlesGeo

	// holds all particles
	this.particles = []

	// holds active particle count
	this.activeParticles

	// populate particles array
	this.resetParticles()


	// append scene to dom
	Dom.init(this.renderer, this.camera)

	// FPS meter and GUI
	Gui.init()


	// sim state
	this.isRunning = true

	// ssss
	this.isFirstLoop = true

	// start up animation loop
	this.animate()

}

GameOfLife.reset = function() {

	//particle reset
	this.scene.remove(this.particleSystem)
	this.resetParticles()

	this.isFirstLoop = true

	this.updateParticles()
	this.updateLines()

	//line reset
	//todo
}

GameOfLife.newParticle = function() {

	// new particle
    var particle = new THREE.Vector3()

    // set particle position
    var o = Utils.getWihtinSpehere({x:0,y:0,z:0}, this.worldRadius)

    particle.x = o.x
    particle.y = o.y
    particle.z = o.z

    // set particle acceleration
    particle.a = {}
    particle.a.x = Utils.getRandomNum(-0.5, 0.5)
    particle.a.y = Utils.getRandomNum(-0.5, 0.5)
    particle.a.z = Utils.getRandomNum(-0.5, 0.5)

    // set state to active
    particle.isActive = true

    // set particle id
    particle.id = Math.random()

    // holds particles this particle is connected to
    particle.neighbors = []

    // add particle to geometry blob
    this.particlesGeo.vertices.push(particle)


    // return new particle
    return particle
}

GameOfLife.resetParticles = function() {
	
	var particleMaterial

	this.activeParticles = this.maxParticleCount

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

	// apply rules
	this.updateParticles3()

	// set line points
	this.updateParticles() 

	// set lines from line points
	this.updateLines()

	// wall collision
	this.updateParticles2()

}

GameOfLife.animate = function() {

	Gui.step_begin()

	if(this.isRunning === true) this.update()

	this.renderer.render( this.scene, this.camera )

	Gui.step_end()

	requestAnimationFrame( this.animate.bind(this) )
}

GameOfLife.updateParticles = function() {

	var p1, p2, i, j

	for(i=0; i<this.particles.length; i++) {

		// particle one
		p1 = this.particles[i]

		// check if is active
		if(p1.isActive === false) continue

		// reset neighbor array
		p1.neighbors = []

		for(j=0; j<this.particles.length; j++) {

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
				// if(linePoints[linePoints.length-2]) {
				// 	var last = linePoints[linePoints.length-1]
				// 	var lastlast = linePoints[linePoints.length-2]
				// 	if( last.x === p2.x || last.y === p2.y || last.z === p2.z ) console.log('awdawdawdwdad')
				// }

				this.linePoints.push(p1,p2)
			}	
		}
	}
}

// update position
GameOfLife.updateParticles2 = function() {

	var p1, i

	for(i=0; i<this.particles.length; i++) {

		p1 = this.particles[i]

		// check if is active
		if(p1.isActive === false) continue

		// bounce on wall collision
		if(Utils.calcDistance(p1, {x:0, y:0, z:0}) > this.worldRadius) {
			if(p1.x > 0) p1.a.x = -Math.abs(p1.a.x)
			if(p1.y > 0) p1.a.y = -Math.abs(p1.a.y)
			if(p1.z > 0) p1.a.z = -Math.abs(p1.a.z)
			if(p1.x < 0) p1.a.x = Math.abs(p1.a.x)
			if(p1.y < 0) p1.a.y = Math.abs(p1.a.y)
			if(p1.z < 0) p1.a.z = Math.abs(p1.a.z)
		}

		// accelerate
		p1.x += p1.a.x
		p1.y += p1.a.y
		p1.z += p1.a.z

	}
}

GameOfLife.updateParticles3 = function() {

	var p1, i

	if(this.isFirstLoop === true) {

		this.isFirstLoop = false
		return
	}

	for(i=0; i<this.particles.length; i++) {

		p1 = this.particles[i]

		// check if is active
		if(p1.isActive === false) continue

		if(p1.neighbors.length >= this.equals_offspring) {
			
			this.addParticle(p1)
			continue
		}

		else if(p1.neighbors.length >= this.or_more_dies) {

			this.removeParticle(p1)
			continue
		}

		else if(p1.neighbors.length <= this.or_less_dies) {

			this.removeParticle(p1)
			continue
		}
	}
}

GameOfLife.removeParticle = function(p1) {

	this.activeParticles -= 1

	p1.set(5000, 5000, 5000)

	p1.isActive = false
}

GameOfLife.addParticle = function(inherits) {

	var i, o

	// look for avaliable particle on pool
	for(i=0; i<this.particles.length; i+=1) {

		if(this.particles[i].isActive === false) {

			this.activeParticles += 1

			p1 = this.particles[i]

			p1.isActive = true

			p1.id = Math.random()

			p1.neighbors = []

			o = Utils.getWihtinSpehere(inherits, 200)

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

GameOfLife.updateLines = function() {

	var i, points = this.linePoints

	//reset activeLine count
	this.activeLines = 0

	for(i=0; i<this.linePool.length; i+=2) {

		if( points[i] && points[i+1] ) {

			this.linePool[i].vertices[0].x = points[i].x
			this.linePool[i].vertices[0].y = points[i].y
			this.linePool[i].vertices[0].z = points[i].z

			this.linePool[i].vertices[1].x = points[i+1].x
			this.linePool[i].vertices[1].y = points[i+1].y
			this.linePool[i].vertices[1].z = points[i+1].z

			this.isActive = true

			this.activeLines += 1

			// update vertices
			this.linePool[i].verticesNeedUpdate = true
		}

		else {

			if(this.linePool[0].isActive === false) continue

			this.linePool[i].vertices[0].set(5000, 5000, 5000)
			this.linePool[i].vertices[1].set(5000, 5000, 5000)

			this.isActive = false

			// update vertices
			this.linePool[i].verticesNeedUpdate = true

		}

	}

	// clear line array for next loop
	this.linePoints = []
}

GameOfLife.initLinePool = function() {

	var lineGeometry, lineMaterial, point1, point2, line, i

	// clear vector pool
	this.linePool = []

	// set line material
	lineMaterial = new THREE.LineBasicMaterial({
        color: 'red'
    })

	for(i=0; i<2000; i++) {

		lineGeometry = new THREE.Geometry()

		point1 = new THREE.Vector3(5000, 5000, 5000)
		point2 = new THREE.Vector3(5000, 5000, 5000)

		lineGeometry.vertices.push( point1, point2 )

		line = new THREE.Line( lineGeometry, lineMaterial )

		this.linePool.push(line.geometry)

		this.scene.add(line)
		
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

GameOfLife.settings_maxParticleCount = function(value) {

	this.maxParticleCount = value
}

GameOfLife.settings_minDistance = function(value) {

	this.minDistance = value
}

GameOfLife.settings_worldRadius = function(value) {

	this.worldRadius = value
}


// rules
GameOfLife.settings_or_less_dies = function(value) {

	this.or_less_dies = value
}

GameOfLife.settings_or_more_dies = function(value) {

	this.or_more_dies = value
}

GameOfLife.settings_equals_offspring = function(value) {

	this.equals_offspring = value
}


/////////////////////////////////////////////////////////////////

window.o = Object.create(GameOfLife)

window.o.init()

