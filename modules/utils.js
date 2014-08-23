var calcDistance = function(p1,p2) {
	var o = ( (Math.pow((p1.x - p2.x),2)) + (Math.pow((p1.y - p2.y),2)) + (Math.pow((p1.z - p2.z),2)) )
	o = Math.sqrt(o)
	return o
}

var getWihtinSpehere = function(center, r, o) {

	var o = {}
	var min = -Math.abs(r)
	var max = r

	do {
		o.x = getRandomNum(min, max)
		o.y = getRandomNum(min, max)
		o.z = getRandomNum(min, max)

		console.log('don')

	} while (calcDistance(o, center) > r)

	console.log('der')

	return o
}

var getRandomNum = function(min, max) {

	return min + (Math.random() * (max - min))
}

module.exports.calcDistance = calcDistance
module.exports.getWihtinSpehere = getWihtinSpehere
module.exports.getRandomNum = getRandomNum