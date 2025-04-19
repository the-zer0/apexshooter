const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let score = 0;
let gameRunning = false;
let gameStarted = false;
let restartButton = null;
const scoreBoard = document.getElementById('score-board');

// Rocket
const rocket = {
  x: canvas.width / 2,
  y: canvas.height - 60, // Fixed vertical position (bottom of canvas)
  width: 40,
  height: 60,
  speed: 6,
  color: 'red',
  hp: 50 
};

// Bullets
const bullets = [];
const bulletSpeed = 8;
const bulletSize = 6;

// Asteroids
const asteroids = [];
const asteroidSize = 25; 
const rotationSpeed = 0.02; 

// Stars
const numStars = 80;
const stars = [];

for (let i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2 + 1, // Increased size (now 1-3 pixels)
    speed: Math.random() * 0.8 + 0.3 // Reduced speed (now 0.3-1.1)
  });
}

function drawStars() {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.shadowBlur = 5;
  ctx.shadowColor = '#2c0c00';
  stars.forEach(star => {
    // Move stars downward
    star.y += star.speed;
    
    // Reset star position when it moves off screen
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
    
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Mouse tracking for rocket movement
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  // Calculate mouse position relative to the canvas
  mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
});
let mouseX = rocket.x; 

// Shoot on click
canvas.addEventListener('click', (e) => {
  shootBullet();
});

// Shoot on spacebar
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    shootBullet();
    e.preventDefault();
  }
});

// Create new bullet
function shootBullet() {
const bullet = {
    x: rocket.x,
    y: rocket.y - rocket.height / 2, // Start at the tip of the rocket
    size: bulletSize,
    speed: bulletSpeed,
    color: '#ff4619'
};
  
  bullets.push(bullet);
  // Add a small visual effect when shooting
  canvas.style.boxShadow = '0 0 30px rgb(255, 50, 50)';
  setTimeout(() => {
    canvas.style.boxShadow = '0 0 20px rgb(124, 4, 4)';
  }, 50);
}

// Create new asteroid
function spawnAsteroid() {
  const currentSpeed = 1.5 + (score * 0.05); // Speed increases with score
  const asteroid = {
    x: asteroidSize + Math.random() * (canvas.width - asteroidSize * 2),
    y: -asteroidSize, // Start above the canvas
    size: asteroidSize,
    speed: currentSpeed,
    rotation: Math.random() * Math.PI * 2, // Random rotation angle
    rotationSpeed: Math.random() * 0.05 - 0.025 // Random rotation speed
  };
  
  asteroids.push(asteroid);
}

// Check collision between two circles
function checkCollision(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

// Check collision between rocket and asteroids
function checkRocketCollision() {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    if (checkCollision(rocket.x, rocket.y, rocket.width / 2, asteroid.x, asteroid.y, asteroid.size * 0.7)) {
      asteroids.splice(i, 1); // Remove the asteroid
      createExplosion(asteroid.x, asteroid.y); // Create explosion effect
      rocket.hp -= 10; // Reduce rocket HP by 10
      if (rocket.hp <= 0) {
        const lastX = rocket.x; // Store position before making invisible
        const lastY = rocket.y;
        createBigExplosion(lastX, lastY); // Trigger big explosion
        rocket.width = 0; // Make rocket invisible
        rocket.height = 0;
        gameRunning = false; // End the game immediately
        setTimeout(() => {
          alert("Game Over! The rocket has been destroyed.");
        }, 500); // Delay the alert to show explosion
      }
      break;
    }
  }
}

// Create a big explosion when the rocket dies
function createBigExplosion(x, y) {
  const particleCount = 200; // More particles for a bigger explosion
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const speed = 4 + Math.random() * 3; // Add variation to particle speed
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3, // Larger particles
      color: `hsl(${Math.random() * 360}, 100%, 50%)`, // Random bright colors
      life: 40 + Math.random() * 30 // Longer particle life
    });
  }
}

// Main game loop
function gameLoop() {
  if (!gameStarted) return;
  if (!gameRunning) {
    showRestartButton();
    return;
  }
  
  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawStars(); // Draw stars

  // Move rocket towards mouse position
  if (mouseX < rocket.x - 2) {
    rocket.x -= rocket.speed;
  } else if (mouseX > rocket.x + 2) {
    rocket.x += rocket.speed;
  }
  
  // Keep rocket within canvas bounds
  rocket.x = Math.max(rocket.width / 2, Math.min(canvas.width - rocket.width / 2, rocket.x));
  
  // Calculate spawn rate based on current score
  const currentSpawnRate = 0.010 + (score * 0.001); // Adjusted multiplier for better scaling
  
  // Random chance to spawn a new asteroid
  if (Math.random() < currentSpawnRate) {
    spawnAsteroid();
  }

  checkRocketCollision(); // Check for collisions with asteroids
  updateAsteroids();
  updateBullets();
  updateParticles();
  drawRocket();

  // Display rocket HP and score
  scoreBoard.textContent = `Score: ${score} | HP: ${rocket.hp}`;

  requestAnimationFrame(gameLoop);
}

// Asteroid functionality
function updateAsteroids() {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    
    // Move asteroid and rotate
    asteroid.y += asteroid.speed;
    asteroid.rotation += rotationSpeed;
    
    // Remove asteroids that are off-screen
    if (asteroid.y > canvas.height + asteroid.size) {
      asteroids.splice(i, 1);
      continue;
    }
    
    // Draw asteroid
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);
    
    // Simple polygon asteroid shape
    ctx.fillStyle = '#5f1b00'; 
    ctx.beginPath();
    
    // Asteroid shape
    for (let j = 0; j < 11; j++) {
      const angle = (j / 11) * Math.PI * 2;
      const x = Math.cos(angle) * asteroid.size;
      const y = Math.sin(angle) * asteroid.size;
      
      if (j === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Simple border
    ctx.strokeStyle = '#011627';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
}

// Update bullets
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    
    // Move bullet upward
    bullet.y -= bullet.speed;
    
    // Check collision with asteroids
    let hitAsteroid = false;
    
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const asteroid = asteroids[j];
      
      if (checkCollision(bullet.x, bullet.y, bullet.size, asteroid.x, asteroid.y, asteroid.size * 0.7)) {
        asteroids.splice(j, 1);
        score += 1;
        createExplosion(asteroid.x, asteroid.y);
        hitAsteroid = true;
        break;
      }
    }

    if (bullet.y < -bullet.size || hitAsteroid) {
      bullets.splice(i, 1);
      continue;
    }
    
    // Draw bullet
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 18;
    ctx.shadowColor = 'red';
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Particles array for explosions
const particles = [];

// Create more noticeable explosion when asteroid is destroyed
function createExplosion(x, y) {
    const particleCount = 100; // Increase particle count for a bigger explosion
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = 3 + Math.random() * 2; // Add variation to particle speed
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1.6 + Math.random() * 2, // Larger particles
            color: `hsl(${Math.random() * 360}, 100%, 50%)`, // Random bright colors
            life: 25 + Math.random() * 20 // Longer particle life
        });
    }
}

// Explosion particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Decrease life
        particle.life--;
        
        // Remove dead particles
        if (particle.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        // Draw particle
        ctx.globalAlpha = particle.life / 40; // Adjust transparency for fading effect
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Draw the rocket sprite
function drawRocket() {
  ctx.save();
  
  // Rocket body
  ctx.fillStyle = rocket.color;
  ctx.beginPath();
  ctx.moveTo(rocket.x, rocket.y - rocket.height/2);  // Top point
  ctx.lineTo(rocket.x + rocket.width/2, rocket.y + rocket.height/2);  // Bottom right
  ctx.lineTo(rocket.x - rocket.width/2, rocket.y + rocket.height/2);  // Bottom left
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#065ca2';
  ctx.beginPath();
  ctx.arc(rocket.x, rocket.y - 5, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Engine flames
  const flameHeight = 15 + Math.random() * 5;
  ctx.fillStyle = 'orange';
  ctx.beginPath();
  ctx.moveTo(rocket.x - rocket.width/3, rocket.y + rocket.height/2);  // Left edge
  ctx.lineTo(rocket.x, rocket.y + rocket.height/2 + flameHeight);  // Bottom point
  ctx.lineTo(rocket.x + rocket.width/3, rocket.y + rocket.height/2);  // Right edge
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.moveTo(rocket.x - rocket.width/6, rocket.y + rocket.height/2);
  ctx.lineTo(rocket.x, rocket.y + rocket.height/2 + flameHeight * 0.7);
  ctx.lineTo(rocket.x + rocket.width/6, rocket.y + rocket.height/2);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

// Create a button element
function createButton(text) {
  const button = document.createElement('button');
  button.className = 'game-button';
  button.textContent = text;
  return button;
}

// Show the start button
function showStartButton() {
  const startButton = createButton('Ready');
  startButton.onclick = () => {
    gameStarted = true;
    gameRunning = true;
    startButton.remove();
    gameLoop();
  };
  
  const container = canvas.parentElement;
  container.style.position = 'relative';
  container.appendChild(startButton);
}

// Show the restart button
function showRestartButton() {
  if (restartButton) return;
  
  restartButton = createButton('Play Again');
  restartButton.onclick = () => {
    // Reset game state
    score = 0;
    gameRunning = true;
    gameStarted = true;
    rocket.hp = 50;
    rocket.width = 40;
    rocket.height = 60;
    rocket.x = canvas.width / 2;
    asteroids.length = 0;
    bullets.length = 0;
    particles.length = 0;
    
    // Remove restart button
    restartButton.remove();
    restartButton = null;
    
    // Start game loop
    gameLoop();
  };
  
  const container = canvas.parentElement;
  container.appendChild(restartButton);
}

// Initialize game
window.addEventListener('load', () => {
  console.log("Game initializing");
  canvas.width = 800;
  canvas.height = 600;
  rocket.x = canvas.width / 2;
  rocket.y = canvas.height - 60;

  showStartButton();
});

// Responsive canvas resize handler
window.addEventListener('resize', () => {
  // For simplicity, keep the game's internal dimensions fixed
  rocket.x = rocket.x * (800 / canvas.width);
  canvas.width = 800;
  canvas.height = 600;
  
  // Keep rocket at the bottom
  rocket.y = canvas.height - 60;
});