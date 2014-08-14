module.exports.init = function(THREE, scene){

	var particleCount = 100000;
	var geometry = new THREE.Geometry();

	// create particles with random position values
	for ( var i = 0; i < particleCount; i ++ ) {

		var vertex = new THREE.Vector3();

		vertex.x = Math.random() * 2000 - 1000;
		vertex.y = Math.random() * 2000 - 1000;
		vertex.z = Math.random() * 2000 - 1000;

		geometry.vertices.push( vertex );
	}

	var material = new THREE.PointCloudMaterial( { size: 5 } );
	var particles = new THREE.PointCloud( geometry, material);
	scene.add( particles );
}