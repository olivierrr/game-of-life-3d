var THREE = require('n3d-threejs')

window.particleSystem
window.maxParticleCount = 200
window.particles

var newParticle = function(){

	var particle = new THREE.Vector3()

	// particle position
	particle.x = Math.random() * 2000 - 1000
	particle.y = Math.random() * 2000 - 1000
	particle.z = Math.random() * 2000 - 1000

	// particle acceleration
	particle.a = {}
	particle.a.x = Math.random() - 0.5
	particle.a.y = Math.random() - 0.5
	particle.a.z = Math.random() - 0.5

	//unique particle id
	particle.id = Math.random()

	// holds particles this particle is connected to
	particle.neighbors = []

	particles.vertices.push( particle )
}

module.exports.init = function() {

	var PARTICLE = {}

	PARTICLE.reset = function(){
		particles = new THREE.Geometry()

		// create particles with random position values
		for ( var i = 0; i < maxParticleCount; i ++ ) {
			newParticle()
		}

		var material = new THREE.PointCloudMaterial( { size: 5 } )
		particleSystem = new THREE.PointCloud( particles, material )
		particleSystem.sortParticles = true

		console.log(this)

		this.scene.add( particleSystem )

		return particles.vertices
	}

	return PARTICLE
}