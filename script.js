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
  [...document.querySelectorAll('.start-button')].map(btn => btn.onclick = init);
});

function createPlayers(num) {
  game.POINTS = (num - 1) * 10;
  for (let i = 0; i < num; i++) {
    let player = new Player(i);
    game.players.push(player);
    makeDot(player);
  }
}

function makeDot(player) {
  const e = document.createElement('div');
  e.className = `dot dot_${player.id}`;
  e.style.background = player.color;
  document.body.appendChild(e);
}

function moveDot(player) {
  const xDeg = Math.cos(player.dir) * player.speed;
  const yDeg = Math.sin(player.dir) * player.speed;
  player.x += xDeg;
  player.y += yDeg;
  const dot = document.querySelector(`.dot_${player.id}`);
  dot.style.left = `${player.x - player.radius + 200 + 3}px`;
  dot.style.top = `${player.y - player.radius + 3}px`;
}

// FIXME
/*
function resetGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  checkWin();
  if (!win) {
    //countdown();
    for (let player of players) {
      var tempColor = player.color;
      player.color = '#000000';
      var newX = Math.floor(Math.random() * canvas.width);
      var newY = Math.floor(Math.random() * canvas.height);
      player.xPrev = newX;
      player.yPrev = newY;
      player.xPos = newX;
      player.yPos = newY;
      player.degrees = Math.floor(Math.random() * 360);
      player.color = tempColor;
      player.dead = false;
    }
    DEAD = 0;
  }
}

function checkReset() {
  if (PLAYERS - 1 === DEAD) {
    if (finalTime <= 0) {
      resetGame();
      GAME_TICK = 0;
      finalTime = 300;
    }
    finalTime--;
  } else if (PLAYERS === DEAD) {
    resetGame();
    GAME_TICK = 0;
    finalTime = 300;
  }
}

function countdown() {
  const cd = document.querySelector('.countdown');
  setTimeout(function() {
    if (countdownTime > 0) {
      cd.innerHTML = countdownTime;
      cd.style.display = 'block';
      countdownTime--;
      countdown();
    } else {
      cd.style.display = 'none';
      countdownTime = 5;
    }
  }, 1000);
}

function checkWin() {
  var mostPoints = 0;
  for (var player of players) {
    if (player.points >= POINTS) {
      updateScoreboard();
      [...document.querySelectorAll('.dot')].map(dot => dot.parentNode.removeChild(dot));
      win = true;
      winMessage(players[0]);
    }
  }
}

function winMessage(player) {
  let e = document.createElement('div');
  e.className = 'win-message';
  e.innerHTML = `<span style='color:" + player.color + "'>" + player.id + "</span> vant!`;
  document.body.appendChild(e);
}
*/

/******************
  PREPARING GAME
*******************/
function init(e) {
  const num = e.target.getAttribute('data-players');
  createPlayers(num);
  for (let player of game.players) {
    player.registerControls();
  }
  updateScoreboard();
  document.querySelector('.start-screen').style.display = 'none';
  update();
}

/**************
  GAME LOOP
**************/
function update() {
  if (!game.win) {
    for (let player of game.players) {
      if (!player.dead) {
        player.move();
        player.draw();
        moveDot(player);
        player.collision();
      }
    }
  }
  //checkReset();
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
