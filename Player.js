var colors = ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#0000ff' ];
var controls = [
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
    this.x = Math.floor(Math.random() * canvas.width);
    this.y = Math.floor(Math.random() * canvas.height);
    this.oldX = this.x;
    this.oldY = this.y;
    this.state = {left: false, right: false};
    this.dir = Math.floor(Math.random() * 360);
    this.speed = 2;
    this.turnStrength = 3;
    this.color = colors[id];
    this.controls = controls[id];
    this.dead = false;
    this.points = 0;
    this.radius = 5;
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
    ctx.lineWidth = this.radius;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.oldX, this.oldY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    //ctx.closePath();
    this.oldX = this.x;
    this.oldY = this.y;
    //lineGap(player);


  }

  lineGap(entity) {
    /*
    if (entity.nextGap > 0) {
      ctx.strokeStyle = entity.color;
      entity.nextGap--;
    } else {
      if (entity.gapSize > 0) {
        ctx.strokeStyle = '#000000';
        entity.gapSize--;
      } else {
        ctx.strokeStyle = entity.color;
        entity.gapSize = Math.floor(Math.random() * 5) + 20; // From 20 to 25
        entity.nextGap = Math.floor(Math.random() * 300) + 50; // From 50 to 350
      }
    }
    */
  }

  collision() {
    const pixels = ctx.getImageData(
      ~~(this.x - this.radius),
      ~~(this.y - this.radius),
      this.radius * 2,
      this.radius * 2
    ).data;

    for(var i = 0; i < pixels.length; i += 4) {
      if (pixels[i+3] != 0) {
        const red = (pixels[i] < 255) ? 0 : 255;
        const green = (pixels[i+1] < 255) ? 0 : 255;
        const blue = (pixels[i+2] < 255) ? 0 : 255;
        const hex = "#" + ("000000" + rgbToHex(red, green, blue)).slice(-6);
        if (hex != this.color || this.x < 0 + this.radius  || this.x > canvas.width - this.radius || this.y < 0 + this.radius || this.y > canvas.height - this.radius) {
          this.dead = true;
          updatePoints();
          updateScoreboard();
          break;
        }
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
