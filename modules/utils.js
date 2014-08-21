var calcDistance = function(p1,p2) {
	var o = ( (Math.pow((p1.x - p2.x),2)) + (Math.pow((p1.y - p2.y),2)) + (Math.pow((p1.z - p2.z),2)) )
	o = Math.sqrt(o)
	return o
}

module.exports.calcDistance = calcDistance