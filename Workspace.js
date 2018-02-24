'use strict'
Workspace.Screen = require('./Screen');
Workspace.Canvas = require('./Canvas');
Workspace.Camera = require('./Camera');
function Workspace(w, h, gridX, gridY) {
  var ws = this;
  this.id = uniqueId();
  this.width = w || 100000;
  this.height = h || 100000;
  this.backgroundColor = "#000000";
  this.gridSizeX = gridX;
  this.gridSizeY = gridY;

  this.gridify();

  this.cotr = "Workspace";
}


Workspace.prototype.updateGridSize = function(w, h) {
  this.gridSizeX = w;
  this.gridSizeY = h;
};

Workspace.prototype.gridify = function() {
  var grid = {};
  for(var i = 0; i < this.width; i += this.gridSizeX) {
    for(var j = 0; j < this.height; j += this.gridSizeY) {
      grid[i + ":" + j] = new Cell(i + this.gridSizeX/2, j + this.gridSizeY/2, this.gridSizeX, this.gridSizeY);
      // {
      //   xmin: i,
      //   xmax: i + this.gridSizeX,
      //   ymin: j,
      //   ymax: j + this.gridSizeY,
      //   x: i + this.gridSizeX/2,
      //   y: j + this.gridSizeY/2,
      //   size: 0,
      //   content: {},
      //   id: uniqueId()
      // };
    }
  }
  this.grid = grid;
};

Workspace.prototype.getGridTile = function(x, y) {
  x -= this.gridSizeX/2;
  y -= this.gridSizeY/2
  var gridX = x - (x % this.gridSizeX);
  var gridY = y - (y % this.gridSizeY);
  return this.grid[gridX + ":" + gridY];
};

Workspace.prototype.getGridTilesOnObject = function(obj) {
  var out = [];
  for(var x = obj.xmin; x < obj.xmax; x += this.gridSizeX) {
    for(var y = obj.ymin; y < obj.ymax; y += this.gridSizeX) {
      let tile = this.getGridTile(x, y);
      if(tile.size) out.push(tile.content);
    }
  }
  return out;
  var d = 50;
  var tile0 = this.getGridTile(obj.xmin - d, obj.ymin - d);
  var tile1 = this.getGridTile(obj.xmax + d, obj.ymin - d);
  var tile2 = this.getGridTile(obj.xmin - d, obj.ymax + d);
  var tile3 = this.getGridTile(obj.xmax + d, obj.ymax + d);
  var tile4 = this.getGridTile(obj.x, obj.y);
  var arr = {};
  tile0 && Object.keys(tile0).forEach((id) => arr[id] = (tile0[id])),
  tile1 && Object.keys(tile1).forEach((id) => arr[id] = (tile1[id])),
  tile2 && Object.keys(tile2).forEach((id) => arr[id] = (tile2[id])),
  tile3 && Object.keys(tile3).forEach((id) => arr[id] = (tile3[id])),
  tile4 && Object.keys(tile4).forEach((id) => arr[id] = (tile4[id]))
  return arr;
};

Workspace.prototype.deleteOnId = function(id, dolog) {
  if(dolog) console.time('deleteOnId');
  var keys = Object.keys(this.grid);
  var i = 0, l = keys.length;
  for(i; i < l; i++) {
    if(this.grid[keys[i]][id]) {
      delete this.grid[keys[i]][id];
    }
  }
  if(dolog) console.timeEnd('deleteOnId');
}

Workspace.prototype.tilesOnId = function(id) {
  var out = [];
  var keys = Object.keys(this.grid);
  var i = 0, l = keys.length;
  for(i; i < l; i++) {
    if(this.grid[keys[i]][id]) {
      out.push({key: keys[i], tile: this.grid[keys[i]]});
    }
  }
  return out;
}

Workspace.prototype.addToCell = function(obj, snap) {
  var tile = this.getGridTile(obj.x, obj.y);
  obj.x = tile.x;
  obj.y = tile.y;
  obj.setBB();
  tile.content[obj.id] = obj;
  tile.size += 1;
  return tile;
}

Workspace.prototype.addToGrid = function(obj, snap) {
  for(var x = obj.xmin; x < obj.xmax; x += this.gridSizeX) {
    for(var y = obj.ymin; y < obj.ymax; y += this.gridSizeX) {
      var tile = this.getGridTile(x, y);
      if(tile) {
        if(snap) {
          obj.x = tile.x;
          obj.y = tile.y;
          obj.setBB();
        }
        tile.content[obj.id] = obj;
        tile.size += 1;
      }
    }
  }
};

Workspace.prototype.save = function() {
  localStorage.grid = JSON.stringify(this.grid);
  console.log('saved grid');
}

Workspace.prototype.load = function() {
  if(!localStorage.grid) return;
  this.grid = JSON.parse(localStorage.grid);
  Object.keys(this.grid).forEach((key) => {
    if(this.grid[key].size) {
      Object.keys(this.grid[key].content).forEach((key2) => {
        var s = this.grid[key].content[key2];
        this.grid[key].content[key2] = new Tile(s.x, s.y, s.w, s.h);
      });
    }
  });
  console.log('loaded grid')
}

Workspace.prototype.purgeCell = function(cell, layerId) {
  if(layerId) {
    var tile = cell.onLayer(layerId);
    if(tile) {
      delete cell.content[tile.id];
      cell.size -= 1;
    }
  } else {
    cell.content = {};
    cell.size = 0;
  }
}


Workspace.prototype.removeFromGrid = function(obj, dolog) {
  if(dolog) console.time('removeFromGrid');
  for(var x = obj.xmin; x < obj.xmax; x += this.gridSizeX) {
    for(var y = obj.ymin; y < obj.ymax; y += this.gridSizeX) {
      var tile = this.getGridTile(x, y);
      if(dolog) console.log(tile, obj.id);
      if(tile) {
        delete tile.content[obj.id];
        tile.size -= 1;
      }

      if(dolog) console.log(tile);
    }
  }
  if(dolog) console.timeEnd('removeFromGrid');
};

Workspace.prototype.updateGrid = function(x, y, obj, snap) {
  this.deleteOnId(obj.id);
  this.addToGrid(obj, snap);
};

function Cell(x, y, w, h) {
  this.id = uniqueId();
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.content = {};
  this.size = 0;
  this.stats = new Stats({walkable: true, breakable: false});
  this.setBB();
}

Cell.prototype.onLayer = function(layerId) {
  var out;
  Object.keys(this.content).find((key) => {
    if(this.content[key].layerId == layerId) {
      return out = this.content[key];
    }
  })
  return out;
}

Cell.prototype.add = function(obj, snap) {
  if(snap) {
    obj.x = this.x;
    obj.y = this.y;
    obj.setBB();
  }
  if(!this.content[obj.id]) this.size += 1;
  this.content[obj.id] = obj;
}

Cell.prototype.setBB = function() {
  this.xmin = this.x - this.w/2;
  this.xmax = this.x + this.w/2;
  this.ymin = this.y - this.h/2;
  this.ymax = this.y + this.h/2;
};
