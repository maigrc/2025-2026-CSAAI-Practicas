/* jshint esversion: 6 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 500;

let state = 'MENU';
let gameMode = 1; 
let score = { player: 0, bot: 0 };
let countdownNum = 3;

// --- CONFIGURACIÓN DE AUDIO ---
const sounds = {
    tick: new Audio('tick.mp3'),
    start: new Audio('start.mp3'),
    goal: new Audio('goal.mp3'),
    win: new Audio('win.mp3'),
    lose: new Audio('lose.mp3')
};

function playSfx(name) {
    if (sounds[name]) {
        const s = sounds[name];
        s.currentTime = 0;
        s.play().catch(function() {});
        setTimeout(function() { s.pause(); s.currentTime = 0; }, 2000);
    }
}

const MARGIN_X = 40; 
const MARGIN_Y = 30; 
const GOAL_TOP = 180;
const GOAL_BOTTOM = 320;

let ball = { x: 400, y: 250, vx: 0, vy: 0, r: 10 };
let player = { x: 150, y: 250, r: 18, color: '#1e4b8a', angle: 0 };
let rivals = [
    { x: 600, y: 180, r: 18, color: '#7a1a15', speed: 1.5 },
    { x: 600, y: 320, r: 18, color: '#7a1a15', speed: 1.5 }
];
let ally = { x: 250, y: 350, r: 18, color: '#3a78a1', speed: 1.2 };

const allPlayers = [player, rivals[0], rivals[1], ally];
const keys = {};

window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
    if (state !== 'MENU') {
        if (e.code === 'KeyR') startGame(gameMode);
        if (e.code === 'KeyM') { state = 'MENU'; updateUI(); }
    } else {
        if (e.key === '1') startGame(1);
        if (e.key === '2') startGame(2);
    }
});

window.addEventListener('keyup', function(e) { keys[e.code] = false; });

function startGame(mode) {
    gameMode = mode;
    score.player = 0; score.bot = 0;
    document.getElementById('score').innerText = "0 - 0";
    resetPositions();
    startCountdown();
}

function resetPositions() {
    ball.x = 400; ball.y = 250; ball.vx = 0; ball.vy = 0;
    player.x = 150; player.y = 250;
    rivals[0].x = 600; rivals[0].y = 180;
    rivals[1].x = 600; rivals[1].y = 320;
    ally.x = 250; ally.y = 380;
}

function startCountdown() {
    state = 'COUNTDOWN';
    countdownNum = 3;
    updateUI();
    let timer = setInterval(function() {
        if(countdownNum > 0) playSfx('tick');
        countdownNum--;
        if (countdownNum <= 0) {
            clearInterval(timer);
            playSfx('start');
            state = 'PLAYING';
            updateUI();
        } else {
            updateUI();
        }
    }, 800);
}

function updateUI() {
    document.getElementById('overlay').className = (state === 'PLAYING') ? 'hidden' : 'visible';
    document.getElementById('menu-content').className = (state === 'MENU') ? '' : 'hidden';
    document.getElementById('status-content').className = (state === 'GOAL' || state === 'GAMEOVER') ? '' : 'hidden';
    document.getElementById('countdown-display').className = (state === 'COUNTDOWN') ? '' : 'hidden';
    document.getElementById('final-options').className = (state === 'GAMEOVER') ? '' : 'hidden';
    if(state === 'COUNTDOWN') document.getElementById('countdown-display').innerText = countdownNum;
}

function update() {
    if (state !== 'PLAYING') return;

    if (keys.ArrowUp) player.y -= 3.0;
    if (keys.ArrowDown) player.y += 3.0;
    if (keys.ArrowLeft) player.x -= 3.0;
    if (keys.ArrowRight) player.x += 3.0;
    if (keys.KeyA) player.angle -= 0.12;
    if (keys.KeyD) player.angle += 0.12;

    for (let p of allPlayers) {
        if (p !== player) {
            let dx = ball.x - p.x, dy = ball.y - p.y;
            let dist = Math.hypot(dx, dy);
            if (dist > 5) { p.x += (dx/dist) * p.speed; p.y += (dy/dist) * p.speed; }
        }
        p.x = Math.max(MARGIN_X + p.r, Math.min(canvas.width - MARGIN_X - p.r, p.x));
        p.y = Math.max(MARGIN_Y + p.r, Math.min(canvas.height - MARGIN_Y - p.r, p.y));

        for (let other of allPlayers) {
            if (p === other) continue;
            let dx = other.x - p.x, dy = other.y - p.y, d = Math.hypot(dx, dy);
            if (d < p.r + other.r) {
                let overlap = (p.r + other.r) - d;
                p.x -= (dx/d) * overlap/2; p.y -= (dy/d) * overlap/2;
                other.x += (dx/d) * overlap/2; other.y += (dy/d) * overlap/2;
            }
        }
        
        let db = Math.hypot(ball.x - p.x, ball.y - p.y);
        if (db < p.r + ball.r) {
            let ang = Math.atan2(ball.y - p.y, ball.x - p.x);
            ball.vx = Math.cos(ang) * 4; ball.vy = Math.sin(ang) * 4;
            ball.x = p.x + Math.cos(ang) * (p.r + ball.r + 2);
            ball.y = p.y + Math.sin(ang) * (p.r + ball.r + 2);
        }
    }

    if (keys.Space) {
        let d = Math.hypot(ball.x - player.x, ball.y - player.y);
        if (d < 50) { ball.vx = Math.cos(player.angle) * 10; ball.vy = Math.sin(player.angle) * 10; }
    }

    ball.x += ball.vx; ball.y += ball.vy;
    ball.vx *= 0.985; ball.vy *= 0.985;

    if (ball.y < MARGIN_Y + ball.r) { ball.y = MARGIN_Y + ball.r; ball.vy *= -1; }
    if (ball.y > canvas.height - MARGIN_Y - ball.r) { ball.y = canvas.height - MARGIN_Y - ball.r; ball.vy *= -1; }

    if (ball.x < MARGIN_X + ball.r) {
        if (ball.y > GOAL_TOP && ball.y < GOAL_BOTTOM) {
            if (ball.x < 15) handleGoal('bot');
        } else {
            ball.x = MARGIN_X + ball.r; ball.vx *= -0.5;
        }
    }
    if (ball.x > canvas.width - MARGIN_X - ball.r) {
        if (ball.y > GOAL_TOP && ball.y < GOAL_BOTTOM) {
            if (ball.x > canvas.width - 15) handleGoal('player');
        } else {
            ball.x = canvas.width - MARGIN_X - ball.r; ball.vx *= -0.5;
        }
    }
}

function handleGoal(who) {
    if (who === 'player') score.player++; else score.bot++;
    document.getElementById('score').innerText = score.player + " - " + score.bot;
    let isGameOver = (gameMode === 1 && (score.player >= 3 || score.bot >= 3)) || gameMode === 2;
    state = isGameOver ? 'GAMEOVER' : 'GOAL';
    playSfx(isGameOver ? (score.player > score.bot ? 'win' : 'lose') : 'goal');
    updateUI();
    document.getElementById('status-title').innerText = isGameOver ? (score.player > score.bot ? "¡Has ganado!" : "¡Perdiste!") : "¡GOOOL!";
    if (!isGameOver) setTimeout(function() { resetPositions(); startCountdown(); }, 1800);
}

function draw() {
    ctx.clearRect(0, 0, 800, 500);
    ctx.strokeStyle = 'white'; ctx.lineWidth = 4;
    ctx.strokeRect(MARGIN_X, MARGIN_Y, canvas.width - MARGIN_X*2, canvas.height - MARGIN_Y*2);
    ctx.beginPath(); ctx.moveTo(400, MARGIN_Y); ctx.lineTo(400, 470); ctx.stroke();
    ctx.beginPath(); ctx.arc(400, 250, 60, 0, Math.PI*2); ctx.stroke();

    ctx.fillStyle = '#666';
    ctx.fillRect(MARGIN_X - 30, GOAL_TOP, 30, GOAL_BOTTOM - GOAL_TOP); 
    ctx.fillRect(canvas.width - MARGIN_X, GOAL_TOP, 30, GOAL_BOTTOM - GOAL_TOP); 

    for(let p of allPlayers) {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke();
        if(p === player) {
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
            ctx.fillStyle = 'white'; ctx.beginPath();
            ctx.moveTo(25, 0); ctx.lineTo(18, -6); ctx.lineTo(18, 6); ctx.fill();
            ctx.restore();
        }
    }

    ctx.save(); ctx.translate(ball.x, ball.y);
    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(0,0,ball.r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = 'black';
    for(let i=0; i<5; i++){ ctx.rotate(72*Math.PI/180); ctx.fillRect(2,-2,5,5); }
    ctx.restore();

    update();
    requestAnimationFrame(draw);
}
draw();

function bindTouch(id, code) {
    const btn = document.getElementById(id);
    if (!btn) return;
    
    btn.addEventListener('touchstart', function(e) { 
        e.preventDefault(); 
        keys[code] = true; 
        if(code === 'KeyR' || code === 'KeyM') {
            if (typeof KeyboardEvent !== 'undefined') {
                window.dispatchEvent(new KeyboardEvent('keydown', { 'code': code }));
            }
        }
    });
    btn.addEventListener('touchend', function(e) { e.preventDefault(); keys[code] = false; });
    btn.addEventListener('mousedown', function(e) { keys[code] = true; });
    btn.addEventListener('mouseup', function(e) { keys[code] = false; });
}

bindTouch('btn-up', 'ArrowUp');
bindTouch('btn-down', 'ArrowDown');
bindTouch('btn-left', 'ArrowLeft');
bindTouch('btn-right', 'ArrowRight');
bindTouch('btn-rot-l', 'KeyA');
bindTouch('btn-rot-r', 'KeyD');
bindTouch('btn-shot', 'Space');