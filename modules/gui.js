Stats = require('../modules/stats')
DatGui = require('dat-gui')

var g = function() {
  this.message = 'game of life';
  this.speed = 0.8;
  this.displayOutline = false;
};

var init = function() {
	datgui()
	stats()
};

function datgui(){
	 var text = new g();
 	 var gui = new DatGui.GUI()
 	 gui.add(text, 'message');
 	 gui.add(text, 'speed', -5, 5);
}

var begin, end;

var stats;

function stats() {
	stats = new Stats();
	stats.setMode(0); // 0: fps, 1: ms
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.body.appendChild( stats.domElement );
}

function step_begin() {
	stats.begin()
}

function step_end() {
	stats.end()
}



module.exports.init = init
module.exports.step_begin = step_begin
module.exports.step_end = step_end
