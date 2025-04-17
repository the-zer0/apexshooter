const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

let mouse = { x: 0, y: 0 };
let bullets = [];
let enemies = [];
let score = 0;

// Setup canvas
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Mouse input
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  shootBullet();
});

// Touch input (Tap to shoot and aim)
canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  mouse.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  mouse.y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  shootBullet();
}, { passive: true });

function shootBullet() {
  const centerX = canvas.width / 2;
  const cannonY = canvas.height - 30;
  const angle = Math.atan2(mouse.y - cannonY, mouse.x - centerX);
  const speed = 6;
  bullets.push({
    x: centerX,
    y: cannonY,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed
  });
}

function drawCannon() {
  const centerX = canvas.width / 2;
  const cannonY = canvas.height - 30;
  const angle = Math.atan2(mouse.y - cannonY, mouse.x - centerX);

  ctx.fillStyle = 'gray';
  ctx.fillRect(centerX - 25, cannonY, 50, 20);

  const barrelLength = 40;
  ctx.save();
  ctx.translate(centerX, cannonY);
  ctx.rotate(angle);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, -5, barrelLength, 10);
  ctx.restore();
}

function drawBullets() {
  ctx.fillStyle = 'red';
  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
    ctx.fill();

    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  });
}

function spawnEnemies() {
  if (Math.random() < 0.02) {
    enemies.push({
      x: Math.random() * (canvas.width - 40),
      y: 0,
      width: 40,
      height: 20
    });
  }
}

function drawEnemies() {
  ctx.fillStyle = 'lime';
  enemies.forEach((e, i) => {
    e.y += 2;
    ctx.fillRect(e.x, e.y, e.width, e.height);
    if (e.y > canvas.height) enemies.splice(i, 1);
  });
}

function checkCollisions() {
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (
        b.x > e.x && b.x < e.x + e.width &&
        b.y > e.y && b.y < e.y + e.height
      ) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
      }
    });
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCannon();
  drawBullets();
  spawnEnemies();
  drawEnemies();
  checkCollisions();
  requestAnimationFrame(gameLoop);
}

gameLoop();
