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
const MODE = {
  LINE: 'line',
  GAP: 'gap'
}

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
    this.mode = MODE.GAP;
    this.gap = 0;
  }

  registerControls() {
    window.addEventListener('keydown', this.onKeyChange.bind(this, true), true);
    window.addEventListener('keyup', this.onKeyChange.bind(this, false), true);
  }

  createDot() {
    const e = document.createElement('div');
    e.className = `dot dot_${this.id}`;
    e.style.background = this.color;
    document.body.appendChild(e);
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
    const moveX = Math.cos(this.dir) * this.speed;
    const moveY = Math.sin(this.dir) * this.speed;
    this.x += moveX;
    this.y += moveY;
    const dot = document.querySelector(`.dot_${this.id}`);
    dot.style.left = `${this.x - this.radius + 200 + 3}px`;
    dot.style.top = `${this.y - this.radius + 3}px`;
  }

  draw() {
    this.drawLine();
    this.setMode();
  }

  drawLine() {
    game.ctx.lineWidth = this.radius;
    game.ctx.strokeStyle = (this.mode === MODE.LINE) ? this.color : this.color + '00';
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
      this.mode = (this.mode === MODE.LINE) ? MODE.GAP : MODE.LINE;
      this.gap = (this.mode === MODE.LINE) ?
                    ~~(Math.random() * 300) + 20 :
                    ~~(Math.random() * 10) + 10;
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
        ~~(this.x + this.radius * Math.cos(this.dir + a)),
        ~~(this.y + this.radius * Math.sin(this.dir + a)),
        1,
        1
      ).data[3];
      if (alpha) {
          this.dead = true;
          updatePoints();
          updateScoreboard();
          break;
      }
    }
  }
}
