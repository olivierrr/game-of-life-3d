var calcDistance = function(p1,p2) {
	var o = ( (Math.pow((p1.x - p2.x),2)) + (Math.pow((p1.y - p2.y),2)) + (Math.pow((p1.z - p2.z),2)) )
	o = Math.sqrt(o)
	return o
}

var getWihtinSpehere = function(center, radius) {

	var o = {}
	var min = -Math.abs(radius)
	var max = radius

	do {
		o.x = getRandomNum(min, max) + center.x
		o.y = getRandomNum(min, max) + center.y
		o.z = getRandomNum(min, max) + center.z

	} while (calcDistance(o, center) > radius)

	return o
}

var isWithinSphere = function(center, radius) {

	//if()
}

var getRandomNum = function(min, max) {

	return min + (Math.random() * (max - min))
}

module.exports.calcDistance = calcDistance
module.exports.getWihtinSpehere = getWihtinSpehere
module.exports.getRandomNum = getRandomNum