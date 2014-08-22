Stats = require('../modules/stats')
DatGui = require('dat-gui')

var o, stats

var g = function() {

	// instance
	o = window.o

	// f1 'controls'
	this.resume = function() { o.settings_resume() }
	this.stop = function() { o.settings_stop() }
	this.step = function() { o.settings_step() }
	this.reset = function() { o.settings_reset() }

	// f2 'settings'
	this.minDistance = 300
	this.maxParticleCount = 200

	// f3 'stats'
	this.particleCount = "aNumber"
	this.lineCount = "aNumber"
	this.particlePoolSize = "aNumber"
	this.linePoolSize = "aNumber"

}

function datgui(){

	var text = new g()
 	var gui = new DatGui.GUI()


 	var f1 = gui.addFolder('controls')
 	f1.add(text, 'resume')
 	f1.add(text, 'stop')
 	f1.add(text, 'step')
 	f1.add(text, 'reset')


 	var f2 = gui.addFolder('settings')
 	var minDistance = f2.add(text, 'minDistance', 100, 1000).step(10)
 	var maxParticleCount = f2.add(text, 'maxParticleCount', 10, 1000).step(50)


 	var f3 = gui.addFolder('stats')
 	f3.add(text, 'particleCount')
 	f3.add(text, 'lineCount')
 	f3.add(text, 'particlePoolSize')
 	f3.add(text, 'linePoolSize')

	// open all folder by default
	f1.open()
	f2.open()
	f3.open()


 	// events
 	minDistance.onChange(function(value) {
		o.settings_minDistance(value)
	})
	maxParticleCount.onChange(function(value) {
		o.settings_maxParticleCount(value)
	})

	var update = function() {
	  
	    text.particleCount = o.activeParticles
	    text.lineCount = o.activeLines
	    text.particlePoolSize = o.linePool.length
	    text.linePoolSize = o.particles.length

	    // Iterate over all controllers
	  	for (var i in f3.__controllers) {
	    	f3.__controllers[i].updateDisplay();
	  	}

	}
	update()

	window.setInterval(update, 100)

	console.log(f3)

}

function stats() {
	stats = new Stats()
	stats.setMode(0) // 0: fps, 1: ms
	stats.domElement.style.position = 'absolute'
	stats.domElement.style.left = '0px'
	stats.domElement.style.top = '0px'
	document.body.appendChild( stats.domElement )
}


function step_begin() {
	stats.begin()
}

function step_end() {
	stats.end()
}

var init = function() {
	datgui()
	stats()
}

module.exports.init = init
module.exports.step_begin = step_begin
module.exports.step_end = step_end

