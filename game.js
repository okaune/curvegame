"use strict";

const STATE = {
  START: "start",
  PLAY: "play",
  END_ROUND: "end_round",
  NEXT_ROUND: "next_round",
  WIN: "win"
}

let game = {
  MAX_PLAYERS: 3,
  DEAD: 0,
  POINTS: null,
  canvas: null,
  ctx: null,
  players: [],
  state: STATE.START,
  resetTimer: 300
}

document.addEventListener('DOMContentLoaded', function(event) {
  game.canvas = document.getElementById('canvas');
  game.canvas.width = window.innerWidth - 200 - 6;
  game.canvas.height = window.innerHeight - 6;
  game.ctx = game.canvas.getContext('2d');
  game.ctx.imageSmoothingEnabled = false;
  [...document.querySelectorAll('.start-button')].map(btn => btn.onclick = setup);
});

function setup(e) {
  const n = e.target.getAttribute('data-players');
  createPlayers(n);
  for (let player of game.players) {
    player.registerControls();
  }
  document.querySelector('.start-screen').style.display = 'none';
  updateScoreboard();
  game.STATE = STATE.PLAY;
  update();
}

function update() {
  switch(game.STATE) {
    case STATE.PLAY:
      for (let player of game.players) {
        if (!player.dead) {
          player.move();
          player.collision();
          player.draw();
        }
      }
      break;
    case STATE.END_ROUND:
      endRound();
      break;
    case STATE.WIN:
      win();
      break;
  }
  checkState();
  requestAnimationFrame(update);
}

function createPlayers(n) {
  game.POINTS = (n - 1) * 10;
  for (let i = 0; i < n; i++) {
    let player = new Player(i);
    player.createDot();
    game.players.push(player);
  }
}

function updatePoints() {
  for (let player of game.players) {
    if (!player.dead) {
      player.points++;
    }
  }
  updateScoreboard();
}

function updateScoreboard() {
  game.players.sort((a, b) => {
    return b.points - a.points;
  });
  const scoreboard = document.querySelector('.scoreboard');
  scoreboard.innerHTML = `
  <span class='play-to'>PLAY to ${game.POINTS} points.</span>
  ${game.players.map(player => `
    <div style='color:${player.color}'>Player ${player.id + 1}
      <span class='points-table_points'>${player.points}</span>
    </div>
    `).join('')}
  `;
}

function checkState() {
  if (game.STATE === STATE.NEXT_ROUND) return;
  if (game.players.length === game.DEAD) {
    for (let player of game.players) {
      if (player.points >= game.POINTS) {
        game.STATE = STATE.WIN;
        return;
      }
    }
    game.STATE = STATE.END_ROUND;
  }
}

function endRound() {
  game.STATE = STATE.NEXT_ROUND;
  game.resetTimer = 5;
  const countdown = document.querySelector('.countdown');
  let counter = setInterval(() => {
    game.resetTimer--;
    if (game.resetTimer <= 0) {
      clearInterval(counter);
      countdown.style.display = 'none';
      game.resetTimer = 300;
      nextRound();
      return;
    }
    countdown.innerHTML = game.resetTimer;
    countdown.style.display = 'block';
  }, 1000);
}

function nextRound() {
  game.ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let player of game.players) {
    const tempColor = player.color;
    player.color = '#00000000';
    const x = Math.floor(Math.random() * canvas.width);
    const y = Math.floor(Math.random() * canvas.height);
    player.oldX = x;
    player.oldY = y;
    player.x = x;
    player.y = y;
    player.dir = Math.random() * 2 * Math.PI;
    player.speed = 2;
    player.turnStrength = 0.05;
    player.color = tempColor;
    player.dead = false;
    player.radius = 5;
    player.mode = MODE.GAP;
    player.gap = 0;
  }
  game.DEAD = 0;
  game.STATE = STATE.PLAY;
}

function win() {
  const player = game.players[0];
  let e = document.createElement('div');
  e.className = 'win-message';
  e.innerHTML = `<span style="color:${player.color}">Player ${player.id + 1}</span> won!`;
  document.body.appendChild(e);
}
