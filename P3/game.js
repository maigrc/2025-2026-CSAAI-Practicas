/* jshint esversion: 6 */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const baseWidth = 800;
const baseHeight = 500;

canvas.width = baseWidth;
canvas.height = baseHeight;

function getScale() {
  return canvas.clientWidth / baseWidth;
}

const playerImg = new Image();
playerImg.src = "nave.png";

const alienImg = new Image();
alienImg.src = "alien.png";

const explosionImg = new Image();
explosionImg.src = "explosion.png";

const explosionSound = new Audio("explosion.mp3");
const hitSound = new Audio("hit.mp3");
const winSound = new Audio("win.mp3");
const gameOverSound = new Audio("gameover.mp3");

explosionSound.volume = 0.5;
hitSound.volume = 0.5;
winSound.volume = 0.6;
gameOverSound.volume = 0.7;

let gameOver = false;
let victory = false;

let confetti = [];
let shakeTime = 0;

const player = {
  x: baseWidth / 2 - 25,
  y: baseHeight - 60,
  width: 50,
  height: 40,
  speed: 6,
  lives: 3
};

let bullets = [];
let enemyBullets = [];
let aliens = [];
let explosions = [];
let score = 0;

let energy = 5;
const maxEnergy = 5;

let keys = {};

function createAliens() {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      aliens.push({
        x: 80 + col * 70,
        y: 50 + row * 60,
        width: 40,
        height: 40
      });
    }
  }
}

createAliens();

function createConfetti() {
  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: Math.random() * baseWidth,
      y: Math.random() * baseHeight - baseHeight,
      size: Math.random() * 6 + 4,
      speed: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }
}

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (e.key === " ") shoot();

  if (e.key.toLowerCase() === "r" && (gameOver || victory)) {
    location.reload();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

canvas.addEventListener("touchmove", e => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const scale = getScale();
  player.x = (touch.clientX - rect.left) / scale - player.width / 2;
});

canvas.addEventListener("touchstart", shoot);

function shoot() {
  if (energy > 0 && !gameOver && !victory) {
    bullets.push({ x: player.x + player.width / 2 - 3, y: player.y });
    energy--;
  }
}

setInterval(() => {
  if (energy < maxEnergy) energy++;
}, 500);

setInterval(() => {
  if (aliens.length > 0 && !gameOver && !victory) {
    let alien = aliens[Math.floor(Math.random() * aliens.length)];
    enemyBullets.push({ x: alien.x + alien.width / 2, y: alien.y });
  }
}, 1000);

let alienDirection = 1;

function triggerGameOver() {
  if (!gameOver) {
    gameOver = true;
    shakeTime = 30;
    gameOverSound.currentTime = 0;
    gameOverSound.play();
  }
}

function update() {
  if (gameOver || victory) return;

  if (keys.ArrowLeft) player.x -= player.speed;
  if (keys.ArrowRight) player.x += player.speed;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > baseWidth) player.x = baseWidth - player.width;

  bullets.forEach((b, i) => { b.y -= 8; if (b.y < 0) bullets.splice(i, 1); });
  enemyBullets.forEach((b, i) => { b.y += 4; if (b.y > baseHeight) enemyBullets.splice(i, 1); });

  let speed = 1 + (24 - aliens.length) * 0.06;

  let hitEdge = false;
  aliens.forEach(a => { a.x += speed * alienDirection; if (a.x <= 0 || a.x + a.width >= baseWidth) hitEdge = true; });
  if (hitEdge) { alienDirection *= -1; aliens.forEach(a => a.y += 15); }

  let highestAlien = baseHeight; 
  aliens.forEach(a => { if (a.y < highestAlien) highestAlien = a.y; });
  if (highestAlien + 40 >= player.y) triggerGameOver(); // 40 = altura del alien

  bullets.forEach((b, bi) => {
    aliens.forEach((a, ai) => {
      if (b.x < a.x + a.width && b.x + 6 > a.x && b.y < a.y + a.height && b.y + 10 > a.y) {
        explosions.push({ x: a.x, y: a.y, frame: 0 });
        explosionSound.currentTime = 0;
        explosionSound.play();
        aliens.splice(ai, 1);
        bullets.splice(bi, 1);
        score += 10;
      }
    });
  });

  enemyBullets.forEach((b, i) => {
    if (b.x > player.x && b.x < player.x + player.width && b.y > player.y && b.y < player.y + player.height) {
      enemyBullets.splice(i, 1);
      player.lives--;
      hitSound.currentTime = 0;
      hitSound.play();
    }
  });

  if (player.lives <= 0) triggerGameOver();

  if (aliens.length === 0 && !victory) {
    victory = true;
    createConfetti();
    winSound.currentTime = 0;
    winSound.play();
  }
}

function draw() {
  ctx.save();

  if (shakeTime > 0) {
    let dx = (Math.random() - 0.5) * 10;
    let dy = (Math.random() - 0.5) * 10;
    ctx.translate(dx, dy);
    shakeTime--;
  }

  ctx.clearRect(0, 0, baseWidth, baseHeight);

  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  aliens.forEach(a => ctx.drawImage(alienImg, a.x, a.y, a.width, a.height));

  ctx.fillStyle = "yellow";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 10));

  ctx.fillStyle = "red";
  enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 10));

  explosions.forEach((e, i) => { ctx.drawImage(explosionImg, e.x, e.y, 40, 40); e.frame++; if (e.frame > 15) explosions.splice(i, 1); });

  confetti.forEach(c => { ctx.fillStyle = c.color; ctx.fillRect(c.x, c.y, c.size, c.size); c.y += c.speed; });

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Puntuación: " + score, 10, 20);
  ctx.fillText("Vidas: " + player.lives, 10, 40);
  ctx.fillText("Energía: " + energy, 10, 60);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", baseWidth / 2, baseHeight / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Pulsa R para reiniciar", baseWidth / 2, baseHeight / 2 + 50);
  }

  if (victory) {
    ctx.fillStyle = "lime";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("WINNER", baseWidth / 2, baseHeight / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Pulsa R para reiniciar", baseWidth / 2, baseHeight / 2 + 50);
  }

  ctx.restore();
}

let loaded = 0;
function startGame() { loaded++; if (loaded === 3) gameLoop(); }
playerImg.onload = startGame;
alienImg.onload = startGame;
explosionImg.onload = startGame;

function gameLoop() { update(); draw(); if (!gameOver && !victory) requestAnimationFrame(gameLoop); }

/* CONTROLES MOVIL */

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const shootBtn = document.getElementById("shootBtn");
const restartBtn = document.getElementById("restartBtn");

if(leftBtn){
leftBtn.addEventListener("touchstart",()=>{keys["ArrowLeft"]=true;});
leftBtn.addEventListener("touchend",()=>{keys["ArrowLeft"]=false;});
}

if(rightBtn){
rightBtn.addEventListener("touchstart",()=>{keys["ArrowRight"]=true;});
rightBtn.addEventListener("touchend",()=>{keys["ArrowRight"]=false;});
}

if(shootBtn){
shootBtn.addEventListener("touchstart",shoot);
}

if(restartBtn){
restartBtn.addEventListener("touchstart",()=>location.reload());
}