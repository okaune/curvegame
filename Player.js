const COLORS = ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#0000ff' ];
const CONTROLS = [
  {
    left: 37, // Left Arrow
    right: 39 // Right Arrow
  },{
    left: 65, // A
    right: 68 // D
  },{
    left: 66, // B
    right: 77 // M
  }
];

class Player {
  constructor(id) {
    this.id = id;
    this.x = Math.floor(Math.random() * game.canvas.width);
    this.y = Math.floor(Math.random() * game.canvas.height);
    this.oldX = this.x;
    this.oldY = this.y;
    this.state = {left: false, right: false};
    this.dir = Math.random() * 2 * Math.PI;
    this.speed = 2;
    this.turnStrength = 0.05;
    this.color = COLORS[id];
    this.controls = CONTROLS[id];
    this.dead = false;
    this.points = 0;
    this.radius = 5;
    this.mode = "gap";
    this.gap = 0;
  }

  registerControls() {
    window.addEventListener('keydown', this.onKeyChange.bind(this, true), true);
    window.addEventListener('keyup', this.onKeyChange.bind(this, false), true);
  }

  onKeyChange(bool, e) {
    let key = e.which || e.keyCode || 0;
    switch (key) {
      case this.controls.left:
        this.state.left = bool;
        break;
      case this.controls.right:
        this.state.right = bool;
        break;
    }
  }

  move() {
    if (this.state.left) this.dir -= this.turnStrength;
    if (this.state.right) this.dir += this.turnStrength;
  }

  draw() {
    this.drawLine();
    this.setMode();
  }

  drawLine() {
    game.ctx.lineWidth = this.radius;
    game.ctx.strokeStyle = (this.mode === "line") ? this.color : this.color + "00";
    game.ctx.beginPath();
    game.ctx.moveTo(this.oldX, this.oldY);
    game.ctx.lineTo(this.x, this.y);
    game.ctx.stroke();
    this.oldX = this.x;
    this.oldY = this.y;
  }

  setMode() {
    if (this.gap > 0) this.gap--;
    else {
      this.mode = (this.mode === "line") ? "gap" : "line";
      this.gap = (this.mode === "line") ? Math.floor(Math.random() * 200) + 50 : Math.floor(Math.random() * 10) + 10;
    }
  }

  collision() {
    if(
      this.x - this.radius < 0 ||
      this.x + this.radius > game.canvas.width ||
      this.y - this.radius < 0 ||
      this.y + this.radius > game.canvas.height
    ) {
      this.dead = true;
      updatePoints();
      updateScoreboard();
    }
    const PI = Math.PI;
    for(let a = -PI/2; a <= PI/2; a += PI/4) {
      const alpha = game.ctx.getImageData(
        ~~(this.x + this.radius*Math.cos(this.dir+a)),
        ~~(this.y + this.radius*Math.sin(this.dir+a)),
        1,
        1
      ).data[3];
      if (alpha !== 0) {
          this.dead = true;
          updatePoints();
          updateScoreboard();
          break;
      }
    }
  }
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255) {
    throw "Invalid color component";
  }
  return ((r << 16) | (g << 8) | b).toString(16);
}
