const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_HEIGHT = 80;
const PIPE_WIDTH = 70;
const PIPE_GAP = 180;
const PIPE_DISTANCE = 280;
const GRAVITY = 0.38;
const JUMP_FORCE = -7.4;

const mario = {
  x: 120,
  y: HEIGHT / 2,
  velocity: 0,
  width: 36,
  height: 36,
};

let pipes = [];
let frame = 0;
let score = 0;
let bestScore = 0;
let running = false;
let gameOver = false;

function resetGame() {
  mario.y = HEIGHT / 2;
  mario.velocity = 0;
  pipes = [];
  frame = 0;
  score = 0;
  running = true;
  gameOver = false;
}

function spawnPipe() {
  const offset = 140;
  const gapY =
    Math.random() * (HEIGHT - GROUND_HEIGHT - PIPE_GAP - offset) + offset / 2;
  pipes.push({
    x: WIDTH,
    gapY,
    passed: false,
  });
}

function update() {
  if (!running) {
    draw();
    return;
  }

  mario.velocity += GRAVITY;
  mario.y += mario.velocity;

  if (mario.y + mario.height > HEIGHT - GROUND_HEIGHT) {
    mario.y = HEIGHT - GROUND_HEIGHT - mario.height;
    endGame();
  }

  if (mario.y < 0) {
    mario.y = 0;
    mario.velocity = 0;
  }

  frame++;
  if (frame % PIPE_DISTANCE === 0) {
    spawnPipe();
  }

  pipes.forEach((pipe) => {
    pipe.x -= 2.8;

    // Collision with top pipe
    if (
      mario.x < pipe.x + PIPE_WIDTH &&
      mario.x + mario.width > pipe.x &&
      (mario.y < pipe.gapY || mario.y + mario.height > pipe.gapY + PIPE_GAP)
    ) {
      endGame();
    }

    if (!pipe.passed && pipe.x + PIPE_WIDTH < mario.x) {
      pipe.passed = true;
      score += 1;
      bestScore = Math.max(bestScore, score);
    }
  });

  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0);

  draw();
  requestAnimationFrame(update);
}

function endGame() {
  if (!gameOver) {
    running = false;
    gameOver = true;
    setTimeout(() => {
      draw();
    }, 0);
  }
}

function drawBackground() {
  // Sky already set via canvas background; draw clouds and hills
  ctx.fillStyle = "#7ec9ff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT - GROUND_HEIGHT);

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(80, 120, 45, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(110, 110, 35, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(140, 120, 45, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(360, 160, 40, 18, 0, 0, Math.PI * 2);
  ctx.ellipse(390, 150, 30, 18, 0, 0, Math.PI * 2);
  ctx.ellipse(420, 160, 40, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hills
  ctx.fillStyle = "#2ecc71";
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT - GROUND_HEIGHT);
  ctx.quadraticCurveTo(120, HEIGHT - 200, 220, HEIGHT - GROUND_HEIGHT);
  ctx.quadraticCurveTo(320, HEIGHT - 160, 420, HEIGHT - GROUND_HEIGHT);
  ctx.lineTo(0, HEIGHT - GROUND_HEIGHT);
  ctx.fill();

  // Ground bricks
  ctx.fillStyle = "#f39c12";
  ctx.fillRect(0, HEIGHT - GROUND_HEIGHT, WIDTH, GROUND_HEIGHT);
  ctx.strokeStyle = "#d35400";
  ctx.lineWidth = 4;
  for (let x = 0; x < WIDTH; x += 40) {
    ctx.strokeRect(x + 2, HEIGHT - GROUND_HEIGHT + 2, 36, GROUND_HEIGHT - 4);
  }
}

function drawPipes() {
  ctx.fillStyle = "#27ae60";
  ctx.strokeStyle = "#145a32";
  ctx.lineWidth = 6;
  pipes.forEach((pipe) => {
    const topHeight = pipe.gapY;
    const bottomY = pipe.gapY + PIPE_GAP;

    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topHeight);
    ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, topHeight);

    ctx.fillRect(pipe.x - 10, topHeight - 30, PIPE_WIDTH + 20, 30);
    ctx.strokeRect(pipe.x - 10, topHeight - 30, PIPE_WIDTH + 20, 30);

    const bottomHeight = HEIGHT - GROUND_HEIGHT - bottomY;
    ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight);
    ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight);

    ctx.fillRect(pipe.x - 10, bottomY, PIPE_WIDTH + 20, 30);
    ctx.strokeRect(pipe.x - 10, bottomY, PIPE_WIDTH + 20, 30);
  });
}

function drawMario() {
  const { x, y, width, height } = mario;
  // Body
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(x + 6, y + 4, width - 12, height - 16);

  // Head
  ctx.fillStyle = "#f6d6a8";
  ctx.fillRect(x + 10, y - 4, width - 20, 20);

  // Hat
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(x + 6, y - 8, width - 12, 12);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + width / 2 - 6, y - 6, 12, 8);

  // Mustache
  ctx.fillStyle = "#4d2b1a";
  ctx.fillRect(x + 14, y + 6, width - 28, 6);

  // Overalls
  ctx.fillStyle = "#1f4788";
  ctx.fillRect(x + 12, y + 20, width - 24, height - 32);
  ctx.fillStyle = "#f1c40f";
  ctx.fillRect(x + 14, y + 26, 6, 6);
  ctx.fillRect(x + width - 20, y + 26, 6, 6);

  // Boots
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(x + 6, y + height - 12, width - 12, 12);
}

function drawScore() {
  ctx.fillStyle = "#1f1f1f";
  ctx.font = "24px 'Press Start 2P', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`Очки: ${score}`, 20, 40);
  ctx.fillText(`Рекорд: ${bestScore}`, 20, 70);

  if (gameOver) {
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(WIDTH / 2 - 160, HEIGHT / 2 - 100, 320, 200);

    ctx.fillStyle = "#fff";
    ctx.font = "20px 'Press Start 2P', monospace";
    ctx.fillText("Конец игры", WIDTH / 2, HEIGHT / 2 - 20);
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.fillText("Нажмите пробел", WIDTH / 2, HEIGHT / 2 + 20);
  }
}

function draw() {
  drawBackground();
  drawPipes();
  drawMario();
  drawScore();
}

function flap() {
  if (!running) {
    resetGame();
    requestAnimationFrame(update);
  }
  mario.velocity = JUMP_FORCE;
}

function handleInput(event) {
  if (event.code === "Space") {
    event.preventDefault();
    if (gameOver) {
      resetGame();
      requestAnimationFrame(update);
    } else {
      flap();
    }
  }
}

canvas.addEventListener("mousedown", () => {
  if (gameOver) {
    resetGame();
    requestAnimationFrame(update);
  } else {
    flap();
  }
});

document.addEventListener("keydown", handleInput);
restartBtn.addEventListener("click", () => {
  resetGame();
  requestAnimationFrame(update);
});

resetGame();
requestAnimationFrame(update);
