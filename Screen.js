function Screen(w, h, canvas) {
  // the screen object represents the physical screen,
  // or rather the view port in the browser and so,
  // its width and height should only change when
  // the view port changes
  this.id = uniqueId();
  this.canvas = document.createElement('canvas');
  this.canvas.className = 'screen';
  this.width = this.canvas.width = w;
  this.height = this.canvas.height = h;
  this.w = this.width;
  this.h = this.height;
  this.context = this.canvas.getContext('2d');
  this.cotr = "Screen";
  this.index = Screen.screens.length;
  this.canvas.dataset.index = this.index;
  Screen.screens[this.index] = this;
}

Screen.screens = [];
Screen.container = document.getElementById('board');

Screen.reorder = function() {
  var arr = this.screens.sort((c, n) => {
    return parseInt(c.offsetTop) > parseInt(n.offsetTop) ? 1 : -1;
  });
  arr.forEach((c, i) => {
    this.container.appendChild(arr[i]);
  });
};

Screen.render = function() {
  this.screens.forEach((c) => c && c.render());
};

Screen.prototype.settings = function(s) {
  console.log('settings for screen', s)
  if(s.hasOwnProperty('visible')) {
    this.canvas.style.display = s.visible ? 'block' : 'none';
  }
  if(s.hasOwnProperty('invert')) {
    if(s.invert) {
      this.canvas.style.filter = 'invert()';
    } else {
      this.canvas.style.removeProperty('filter');
    }
  }
}

Screen.prototype.render = function() {
  Screen.container.appendChild(this.canvas);
}

Screen.prototype.renderBackground = function() {
  if(this.fillStyle) this.context.fillStyle = this.fillStyle;
  this.context.fillRect(0,0,this.width, this.height);
};

if(typeof module != 'undefined') module.exports = Screen;
