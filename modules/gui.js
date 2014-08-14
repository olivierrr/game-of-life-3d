DatGui = require('dat-gui')

var g = function() {
  this.message = 'game of life';
  this.speed = 0.8;
  this.displayOutline = false;
};

var init = function() {
  var text = new g();
  var gui = new DatGui.GUI()
  gui.add(text, 'message');
  gui.add(text, 'speed', -5, 5);
};

module.exports.init = init
