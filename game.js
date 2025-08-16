// === Canvas Setup ===
const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const hitSound = document.getElementById("hitsound");
const scoreSound = document.getElementById("scoreSound");

// === Game Constants ===
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 10;
const PLAYER_X = 20;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
const PADDLE_SPEED = 6; // AI speed

// === Game State ===
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 4;
let ballSpeedY = 4;
let playerScore = 0;
let aiScore = 0;

let start = false;
let paused = false;
let gameLoop;

// === Button Events ===
document.getElementById("startButton").addEventListener("click", () => {
    if (!start) {
        start = true;
        paused = false;
        startGame();
    }
});

document.getElementById("pauseButton").addEventListener("click", () => {
    if (start) {
        paused = !paused;
        if (paused) {
            clearInterval(gameLoop);
        } else {
            startGame();
        }
    }
});

document.getElementById("resetButton").addEventListener("click", () => {
    resetGame();
    clearInterval(gameLoop);
    start = false;
    paused = false;
    draw(); // show reset state
});

// === Start the Game Loop ===
function startGame() {
    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, 1000 / 60); // ~60 FPS
}

// === Update Game Logic ===
function updateGame() {
    if (!paused && start) {
        moveBall();
        moveAI();
        draw();
    }
}

// === Move Ball ===
function moveBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top/Bottom wall collision
    if (ballY - BALL_RADIUS < 0 || ballY + BALL_RADIUS > canvas.height) {
        ballSpeedY = -ballSpeedY;
        scoreSound.play(); // Play sound on wall hit  
    }

    // Player paddle collision
    if (ballX - BALL_RADIUS < PLAYER_X + PADDLE_WIDTH &&
        ballY > playerY && ballY < playerY + PADDLE_HEIGHT) {
        ballSpeedX = -ballSpeedX;
        hitSound.play(); // Play sound on paddle hit  
    }

    // AI paddle collision
    if (ballX + BALL_RADIUS > AI_X &&
        ballY > aiY && ballY < aiY + PADDLE_HEIGHT) {
        ballSpeedX = -ballSpeedX;
        hitSound.play(); // Play sound on paddle hit
    }

    // Score update
    if (ballX - BALL_RADIUS < 0) {
        aiScore++;
        resetBall();
    }
    if (ballX + BALL_RADIUS > canvas.width) {
        playerScore++;
        resetBall();
    }
}

// === Move AI Paddle ===
function moveAI() {
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ballY - 35) aiY += PADDLE_SPEED;
    else if (aiCenter > ballY + 35) aiY -= PADDLE_SPEED;
}

// === Draw Everything ===
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.setLineDash([5, 15]); /* Dashed line */
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]); /* Reset line to solid */

    // Draw ball
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw paddles
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw scores
    ctx.font = "20px Arial";
    ctx.fillText(playerScore, canvas.width / 4, 30);
    ctx.fillText(aiScore, (3 * canvas.width) / 4, 30);
}

// === Reset Ball Position ===
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 4;
    ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * 4;
}

// === Reset Entire Game ===
function resetGame() {
    playerScore = 0;
    aiScore = 0;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 4;
    ballSpeedY = 4;
    playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
    aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
}

// === Player Control with Mouse ===
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    playerY = e.clientY - rect.top - PADDLE_HEIGHT / 2;

    // Clamp player paddle inside canvas
    if (playerY < 0) playerY = 0;
    if (playerY + PADDLE_HEIGHT > canvas.height) playerY = canvas.height - PADDLE_HEIGHT;
});

// === Draw initial state before game starts ===
draw();
