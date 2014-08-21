Stats = require('../modules/stats')
DatGui = require('dat-gui')

var o, stats

var g = function() {

	o = window.o

	this.resume = function() { o.settings_resume() }
	this.stop = function() { o.settings_stop() }
	this.step = function() { o.settings_step() }
	this.reset = function() { o.settings_reset() }
}

function datgui(){
	
	var text = new g()
 	var gui = new DatGui.GUI()

 	gui.add(text, 'resume')
 	gui.add(text, 'stop')
 	gui.add(text, 'step')
 	gui.add(text, 'reset')
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