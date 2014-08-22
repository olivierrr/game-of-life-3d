var calcDistance = function(p1,p2) {
	var o = ( (Math.pow((p1.x - p2.x),2)) + (Math.pow((p1.y - p2.y),2)) + (Math.pow((p1.z - p2.z),2)) )
	o = Math.sqrt(o)
	return o
}

// 'inherits' = sphere dimmensions
var getWihtinSpehere = function(max, inherits) {
	
	var o = {}

	o.x = Math.floor((Math.random() * -Math.abs(inherits.x)) + inherits.x)
	o.y = Math.floor((Math.random() * -Math.abs(inherits.y)) + inherits.y)
	o.z = Math.floor((Math.random() * -Math.abs(inherits.z)) + inherits.z)

	if ( calcDistance(o, inherits) > max ) {
		o.x = Math.random() * 2000 - 1000
		o.y = Math.random() * 2000 - 1000
		o.z = Math.random() * 2000 - 1000
		return o
	}
	else return o
}

module.exports.calcDistance = calcDistance
module.exports.getWihtinSpehere = getWihtinSpehere