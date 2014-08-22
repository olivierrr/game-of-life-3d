var calcDistance = function(p1,p2) {
	var o = ( (Math.pow((p1.x - p2.x),2)) + (Math.pow((p1.y - p2.y),2)) + (Math.pow((p1.z - p2.z),2)) )
	o = Math.sqrt(o)
	return o
}

// 'inherits' = sphere dimmensions
var getWihtinSpehere = function(max, inherits) {
	
	var o = {}

	var x_max = (max + inherits.x) 
	var x_min = (max + inherits.x)*2
	var y_max = (max + inherits.y)
	var y_min = (max + inherits.y)*2
	var z_max = (max + inherits.z)
	var z_min = (max + inherits.z)*2

	//Math.random() * 2000 - 1000

	o.x = Math.random() * x_min - x_max
	o.y = Math.random() * y_min - y_max
	o.z = Math.random() * z_min - z_max

	// console.log(o)
	// console.log(inherits)
	// console.log(calcDistance(o,inherits))

	if ( calcDistance(o, inherits) > max ) {
		o.x = Math.random() * 2000 - 1000
		o.y = Math.random() * 2000 - 1000
		o.z = Math.random() * 2000 - 1000
		return o
	}
	else {
		console.log('yup')
		return o
	}
}

module.exports.calcDistance = calcDistance
module.exports.getWihtinSpehere = getWihtinSpehere