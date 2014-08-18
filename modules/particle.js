var THREE = require('n3d-threejs')

window.particleSystem
window.maxParticleCount = 200
window.particles

// returns array of particles (vertices)
module.exports.reset = function(scene){

	particles = new THREE.Geometry()

	// create particles with random position values
	for ( var i = 0; i < maxParticleCount; i ++ ) {
		newParticle()
	}

	var material = new THREE.PointCloudMaterial( { size: 5 } )
	particleSystem = new THREE.PointCloud( particles, material )
	particleSystem.sortParticles = true
	scene.add( particleSystem )

	return particles.vertices
}

var newParticle = function(){

	var particle = new THREE.Vector3()

	// particle position
	particle.x = Math.random() * 2000 - 1000
	particle.y = Math.random() * 2000 - 1000
	particle.z = Math.random() * 2000 - 1000

	// could make velocity a Vector3, performance?
	particle.velocity = {}
	particle.velocity.x = Math.random() - 0.5
	particle.velocity.y = Math.random() - 0.5
	particle.velocity.z = Math.random() - 0.5

	//unique particle id
	particle.id = Math.random()

	// holds particles this particle is connected to
	particle.neighbors = []

	particles.vertices.push( particle )
}

function test() {

}

module.exports.new = newParticle