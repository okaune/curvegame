let game = {
  MAX_PLAYERS: 3,
  DEAD: 0,
  POINTS: null,
  canvas: null,
  ctx: null,
  players: [],
  win: false,
  finalTime: 300,
  countdownTime: 5
}

document.addEventListener("DOMContentLoaded", function(event) {
  game.canvas = document.getElementById("canvas");
  game.canvas.width = window.innerWidth - 200 - 6;
  game.canvas.height = window.innerHeight - 6;
  game.ctx = game.canvas.getContext("2d");
  [...document.querySelectorAll('.start-button')].map(btn => btn.onclick = setup);
});

function createPlayers(num) {
  game.POINTS = (num - 1) * 10;
  for (let i = 0; i < num; i++) {
    let player = new Player(i);
    player.createDot();
    game.players.push(player);
  }
}

function resetGame() {
  game.ctx.clearRect(0, 0, canvas.width, canvas.height);
  checkWin();
  if (!game.win) {
    for (let player of game.players) {
      var tempColor = player.color;
      player.color = '#00000000';
      const x = Math.floor(Math.random() * canvas.width);
      const y = Math.floor(Math.random() * canvas.height);
      player.oldX = x;
      player.oldY = y;
      player.x = x;
      player.y = y;
      player.dir = Math.random() * 2 * Math.PI;
      player.color = tempColor;
      player.dead = false;
    }
    DEAD = 0;
  }
}

function checkReset() {
  if (game.players.length - 2 === game.DEAD) {
    countdown();
    if (game.finalTime <= 0) {
      resetGame();
      game.finalTime = 300;
    }
    game.finalTime--;
  } else if (game.players.length - 1 === game.DEAD) {
    resetGame();
    game.finalTime = 300;
  }
}


function countdown() {
  const counter = document.querySelector('.countdown');
  if (game.countdownTime > 0) {
    counter.innerHTML = game.countdownTime;
    counter.style.display = 'block';
    game.countdownTime--;
    countdown();
  } else {
    counter.style.display = 'none';
    game.countdownTime = 5;
  }
}


function checkWin() {
  for (var player of game.players) {
    if (player.points >= game.POINTS) {
      updateScoreboard();
      [...document.querySelectorAll('.dot')].map(dot => dot.parentNode.removeChild(dot));
      game.win = true;
      winMessage(game.players[0]);
    }
  }
}

function winMessage(player) {
  let e = document.createElement('div');
  e.className = 'win-message';
  e.innerHTML = `<span style="color:${player.color}">Player ${player.id + 1}</span> won!`;
  document.body.appendChild(e);
}

function setup(e) {
  const num = e.target.getAttribute('data-players');
  createPlayers(num);
  for (let player of game.players) {
    player.registerControls();
  }
  document.querySelector('.start-screen').style.display = 'none';
  updateScoreboard();
  update();
}

function update() {
  if (!game.win) {
    for (let player of game.players) {
      if (!player.dead) {
        player.move();
        player.draw();
        player.collision();
      }
    }
  }
  checkReset();
  requestAnimationFrame(update);
}

function updatePoints() {
  for (var player of game.players) {
    if (!player.dead) {
      player.points++;
    }
  }
}

function updateScoreboard() {
  game.players.sort((a, b) => {
    return b.points - a.points;
  });
  const scoreboard = document.querySelector('.scoreboard');
  scoreboard.innerHTML = `
  <span class='play-to'>Playing to ${game.POINTS} points.</span>
  ${game.players.map(player => `
    <div style='color:${player.color}'>Player ${player.id + 1}
      <span class='points-table_points'>${player.points}</span>
    </div>
    `).join('')}
  `;
}
