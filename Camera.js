function Camera(x, y, w, h) {
  // the camera represents the player's view
  // which has a position relative to the
  // workspace.
  this.x = x || 0;
  this.y = y || 0;
  this.w = w;
  this.h = h;
  this.hw = this.w/2;
  this.hh = this.h/2;
  this.cotr = "Camera";
  this.setBB();
}

Camera.prototype.setBB = function() {
  this.xmin = this.x - this.hw;
  this.xmax = this.x + this.hw;
  this.ymin = this.y - this.hh;
  this.ymax = this.y + this.hh;
};

Camera.prototype.render = function(workspace, layer) {
  var tiles = workspace.getGridTilesOnObject(this);
  var c = layer.screen.context;
  tiles.forEach((t) => {
    Object.keys(t).forEach((key) => {
      if(t[key].layerId != layer.id) return;
      t[key].render(layer.screen, this.xmin, this.ymin)
    });
  })
}

Camera.prototype.clear = function() {
  // Layer.layers.forEach((l) => l.screen.renderBackground())
}

if(typeof module != 'undefined') module.exports = Camera;
