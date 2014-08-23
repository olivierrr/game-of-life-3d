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
	this.worldRadius = 800
	//this.simSpeed = 1
	//this.startingParticleCount = 200

	// f3 'stats'
	this.particleCount = "aNumber"
	this.lineCount = "aNumber"
	this.particlePoolSize = "aNumber"
	this.linePoolSize = "aNumber"
	
	// f4 'rules'
	this.or_more_dies = 5
	this.or_less_dies = 0
	this.equals_offspring = 1

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
 	//var simSpeed = f2.add(text, 'simSpeed', 0, 10).step(1)
 	var minDistance = f2.add(text, 'minDistance', 100, 1000).step(10)
 	var maxParticleCount = f2.add(text, 'maxParticleCount', 10, 1000).step(50)
 	var worldRadius = f2.add(text, 'worldRadius', 300, 1000)
 	//var startingParticleCount = f2.add(text, 'startingParticleCount', 10, 1000)


 	var f3 = gui.addFolder('stats')
 	f3.add(text, 'particleCount')
 	f3.add(text, 'lineCount')
 	f3.add(text, 'particlePoolSize')
 	f3.add(text, 'linePoolSize')


 	var f4 = gui.addFolder('rules')
 	var or_more_dies = f4.add(text, 'or_more_dies', 0, 10).step(1)
 	var or_less_dies = f4.add(text, 'or_less_dies', 0, 10).step(1)
 	var equals_offspring = f4.add(text, 'equals_offspring', 1, 10).step(1)


	// open all folder by default
	f1.open()
	f2.open()
	f3.open()
	f4.open()


 	// events
 	minDistance.onChange(function(value) {
		o.settings_minDistance(value)
	})
	maxParticleCount.onChange(function(value) {
		o.settings_maxParticleCount(value)
	})
	worldRadius.onChange(function(value) {
		o.settings_worldRadius(value)
	})

	// f4 events
	or_more_dies.onChange(function(value) {
		o.settings_or_more_dies(value)
	})
	or_less_dies.onChange(function(value) {
		o.settings_or_less_dies(value)
	})
	equals_offspring.onChange(function(value) {
		o.settings_equals_offspring(value)
	})

	// updates stats folder
	var update = function() {
	  
	    text.particleCount = o.activeParticles
	    text.lineCount = o.activeLines
	    text.particlePoolSize = o.particles.length
	    text.linePoolSize = o.linePool.length

	    // Iterate over all controllers
	  	for (var i in f3.__controllers) {
	    	f3.__controllers[i].updateDisplay();
	  	}

	}
	update()

	window.setInterval(update, 100)
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

