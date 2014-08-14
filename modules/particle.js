var THREE = require('n3d-threejs');

var particleSystem,
	particleCount,
	particles;

module.exports.reset = function(scene){

	particleCount = 1000;
	particles = new THREE.Geometry();

	// create particles with random position values
	for ( var i = 0; i < particleCount; i ++ ) {

		var particle = new THREE.Vector3();

		particle.x = Math.random() * 2000 - 1000;
		particle.y = Math.random() * 2000 - 1000;
		particle.z = Math.random() * 2000 - 1000;

		particles.vertices.push( particle );
	}

	var material = new THREE.PointCloudMaterial( { size: 5 } );
	particleSystem = new THREE.PointCloud( particles, material );
	particleSystem.sortParticles = true;
	scene.add( particleSystem );

	return particles.vertices
}