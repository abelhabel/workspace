function Canvas(w, h) {
  this.canvas = document.createElement('canvas');
  this.w = this.canvas.width = w;
  this.h = this.canvas.height = h;
  this.context = this.canvas.getContext('2d');
}
