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
	this.particlePoolSize = 200
	this.linePoolSize = 2000
	this.worldRadius = 800
	this.spawnDistance = 200
	this.particleAcceleration = 4

	// 'rules'
	this.or_more_dies = 5
	this.or_less_dies = 0
	this.equals_offspring = 1

	// THREE setup (rendered/scene/camera/fog/controls)
	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 )
	this.camera.position.z = 1700
	this.controls = new THREE.OrbitControls( this.camera )
	this.controls.maxDistance = 2500
	this.scene = new THREE.Scene()
	//this.scene.fog = new THREE.FogExp2( 0x000000, 0.0004 )
	this.renderer = new THREE.WebGLRenderer()
	this.renderer.setSize( window.innerWidth, window.innerHeight )


	// holds line instances
	this.LINES = []

	// holds line points
	this.linePoints = []

	// line pool 
	this.linePool = []


	// particle cloud
	this.particleSystem

	// particles geometry blob
	this.particlesGeo


	// append scene to dom
	Dom.init(this.renderer, this.camera)

	// FPS meter and GUI
	Gui.init()


	// sim state
	this.isRunning = true

	this.reset()

	// start up animation loop
	this.animate()

}

GameOfLife.reset = function() {

	// 'stats'
	this.activeLines = 0
	this.activeParticles = 0
	this.deadParticlesCount = 0
	this.particlesBornCount = 0
	this.generations = 0

	// particles reset
	this.particlePool = []
	this.resetParticles()

	// lines reset
	this.resetLines()

	this.updateParticles()
	this.updateParticles2()
	this.updateLines()
}

GameOfLife.newParticle = function() {

	this.particlesBornCount += 1

	// new particle
    var particle = new THREE.Vector3()

    // set particle position
    var o = Utils.getWihtinSpehere({x:0,y:0,z:0}, this.worldRadius)

    particle.x = o.x
    particle.y = o.y
    particle.z = o.z

    var a = this.particleAcceleration
    var aM = -Math.abs(this.particleAcceleration)

    // set particle acceleration
    particle.a = {}
    particle.a.x = Utils.getRandomNum(aM, a)
    particle.a.y = Utils.getRandomNum(aM, a)
    particle.a.z = Utils.getRandomNum(aM, a)

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

	this.scene.remove(this.particleSystem)

	this.activeParticles = this.particlePoolSize

    this.particlesGeo = new THREE.Geometry()

    // create particles with random position values
    for (var i = 0; i < this.particlePoolSize; i++) {
        this.newParticle()
    }

    particleMaterial = new THREE.PointCloudMaterial({ size: 5 })

    this.particleSystem = new THREE.PointCloud(this.particlesGeo, particleMaterial)

    // enables particle updating
	this.particleSystem.sortParticles = true

    // set particle array
    this.particlePool = this.particlesGeo.vertices

    // add particle system to scene
    this.scene.add(this.particleSystem)

}

GameOfLife.update = function() {

	this.generations += 1

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

	// is game running && are there active particles
	if(this.isRunning === true && this.activeParticles !== 0) this.update()

	this.renderer.render( this.scene, this.camera )

	requestAnimationFrame( this.animate.bind(this) )

	Gui.step_end()
}

GameOfLife.updateParticles = function() {

	var p1, p2, i, j

	for(i=0; i<this.particlePool.length; i++) {

		// particle one
		p1 = this.particlePool[i]

		// check if is active
		if(p1.isActive === false) continue

		// clear neighbor array
		while (p1.neighbors.length > 0) {
  			p1.neighbors.pop()
		}

		for(j=0; j<this.particlePool.length; j++) {

			// particle two
			p2 = this.particlePool[j]

			// check if is active
			if(p2.isActive === false) continue

			if( Utils.calcDistance(p1,p2) < this.minDistance ) {

				// check if is neighbor
				if(p2.neighbors.indexOf(p1.id) !== -1) continue

				// check if is self
				if(p2.id === p1.id) continue

				// update neighbor array
				p1.neighbors.push(p2.id)

				// add points to linePoints array
				this.linePoints.push(p1,p2)
			}
		}
	}
}

// update position
GameOfLife.updateParticles2 = function() {

	var p1, i

	for(i=0; i<this.particlePool.length; i++) {

		p1 = this.particlePool[i]

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

	var p1, neighbors, i

	for(i=0; i<this.particlePool.length; i++) {

		p1 = this.particlePool[i]
		neighbors = p1.neighbors.length

		// check if is active
		if(p1.isActive === false) continue

		if(neighbors >= this.equals_offspring) {
			
			this.addParticle(p1)
			continue
		}

		else if(neighbors <= this.or_more_dies) {

			this.removeParticle(p1)
			continue
		}

		else if(neighbors >= this.or_less_dies) {

			this.removeParticle(p1)
			continue
		}
	}
}

GameOfLife.removeParticle = function(p1) {

	this.deadParticlesCount +=1
	this.activeParticles -= 1

	p1.set(5000, 5000, 5000)

	p1.isActive = false
}

GameOfLife.addParticle = function(inherits) {

	var i, o, p1

	// look for avaliable particle on pool
	for(i=0; i<this.particlePool.length; i+=1) {

		if(this.particlePool[i].isActive === false) {

			this.particlesBornCount += 1
			this.activeParticles += 1

			p1 = this.particlePool[i]

			p1.isActive = true

			p1.id = Math.random()

			p1.neighbors = []

			o = Utils.getWihtinSpehere(inherits, this.spawnDistance)

			p1.x = o.x
			p1.y = o.y
			p1.z = o.z

			return p1
		}
	}

	//console.log('no avaliable particlePool in pool')

	// if no avaliable partciles in pool
	// create new particle

}

GameOfLife.updateLines = function() {

	var i = this.linePool.length

	// reset count
	this.activeLines = 0

	while(i--) {

		if(this.linePoints[i]) {

			// move point to linePool
			this.linePool[i].vertices[0].x = this.linePoints[this.linePoints.length-1].x
			this.linePool[i].vertices[0].y = this.linePoints[this.linePoints.length-1].y
			this.linePool[i].vertices[0].z = this.linePoints[this.linePoints.length-1].z
			// remove point from point array
			this.linePoints.pop()
			

			// move point to linePool
			this.linePool[i].vertices[1].x = this.linePoints[this.linePoints.length-1].x
			this.linePool[i].vertices[1].y = this.linePoints[this.linePoints.length-1].y
			this.linePool[i].vertices[1].z = this.linePoints[this.linePoints.length-1].z
			// remove point from point array
			this.linePoints.pop()


			// line is active
			this.linePool[i].isActive = true
			this.activeLines += 1

			// update vertices
			this.linePool[i].verticesNeedUpdate = true
		}

		else {

			// skip if line was inactive on last loop
			if(this.linePool[i].isActive === false) continue


			// put line away
			this.linePool[i].vertices[0].set(5000, 5000, 5000)
			this.linePool[i].vertices[1].set(5000, 5000, 5000)

			// line is not active
			this.linePool[i].isActive = false

			// update vertices
			this.linePool[i].verticesNeedUpdate = true
		}
	}

	this.linePoints = []
}

GameOfLife.resetLines = function() {

	var lineGeometry, lineMaterial, point1, point2, line, i

	// clear vector pool
	this.linePool = []

	// remove lines previous lines from scene
	for(var k=0; k<this.LINES.length; k++) {
		this.scene.remove(this.LINES[k])
	}
	this.LINES = []

	// set line material
	lineMaterial = new THREE.LineBasicMaterial({
        color: 'red'
    })

	for(i=0; i<this.linePoolSize; i++) {

		lineGeometry = new THREE.Geometry()

		point1 = new THREE.Vector3(5000, 5000, 5000)
		point2 = new THREE.Vector3(5000, 5000, 5000)

		lineGeometry.vertices.push( point1, point2 )

		line = new THREE.Line( lineGeometry, lineMaterial )

		line.geometry.isActive = false

		this.linePool.push(line.geometry)

		this.LINES.push(line)

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

GameOfLife.settings_particlePoolSize = function(value) {

	this.particlePoolSize = value
}

GameOfLife.settings_minDistance = function(value) {

	this.minDistance = value
}

GameOfLife.settings_spawnDistance = function(value) {

	this.spawnDistance = value
}

GameOfLife.settings_worldRadius = function(value) {

	this.worldRadius = value
}

GameOfLife.settings_linePoolSize = function(value) {

	this.linePoolSize = value
}

GameOfLife.settings_particleAcceleration = function(value) {

	this.particleAcceleration = value
}

// rules
GameOfLife.settings_or_less_dies = function(value) {

	this.or_less_dies = value
	console.log(this.or_less_dies + ' or less')
}

GameOfLife.settings_or_more_dies = function(value) {

	this.or_more_dies = value
	console.log(this.or_more_dies + ' or more')
}

GameOfLife.settings_equals_offspring = function(value) {

	this.equals_offspring = value
	console.log(this.equals_offspring + ' e')
}

/////////////////////////////////////////////////////////////////

window.o = Object.create(GameOfLife)

window.o.init()