const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;

let paddle1 = { x: 0, y: (canvas.height - paddleHeight) / 2, dy: 0 };
let paddle2 = { x: canvas.width - paddleWidth, y: (canvas.height - paddleHeight) / 2, dy: 0 };
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 4,
    dy: 4,
    speed: 4
};

let player1Score = 0;
let player2Score = 0;
let isTwoPlayer = false;

const singlePlayerBtn = document.getElementById("singlePlayerBtn");
const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const menu = document.getElementById("menu");
const gameContainer = document.getElementById("game-container");

singlePlayerBtn.addEventListener("click", () => {
    isTwoPlayer = false;
    startGame();
});

twoPlayerBtn.addEventListener("click", () => {
    isTwoPlayer = true;
    startGame();
});

function startGame() {
    menu.style.display = "none";
    gameContainer.style.display = "flex";
    setInterval(gameLoop, 1000 / 60);
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 15) {
        drawRect(canvas.width / 2 - 1, i, 2, 10, "white");
    }
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "50px Arial";
    ctx.fillText(text, x, y);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1;
    ball.speed = 4;
}

function update() {
    // Move paddles
    paddle1.y += paddle1.dy;
    paddle2.y += paddle2.dy;

    // Prevent paddles from going out of bounds
    paddle1.y = Math.max(Math.min(paddle1.y, canvas.height - paddleHeight), 0);
    paddle2.y = Math.max(Math.min(paddle2.y, canvas.height - paddleHeight), 0);

    // Move the ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom wall
    if (ball.y + ballRadius > canvas.height || ball.y - ballRadius < 0) {
        ball.dy *= -1;
    }

    // Ball collision with paddles
    let paddle = (ball.x < canvas.width / 2) ? paddle1 : paddle2;

    if (
        ball.x + ballRadius > paddle.x &&
        ball.x - ballRadius < paddle.x + paddleWidth &&
        ball.y + ballRadius > paddle.y &&
        ball.y - ballRadius < paddle.y + paddleHeight
    ) {
        let collidePoint = ball.y - (paddle.y + paddleHeight / 2);
        collidePoint = collidePoint / (paddleHeight / 2);

        let angleRad = collidePoint * (Math.PI / 4);
        ball.dx = ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);

        ball.dx *= (ball.x < canvas.width / 2) ? 1 : -1;
        ball.speed += 0.5;
    }

    // Update scores
    if (ball.x - ballRadius < 0) {
        player2Score++;
        resetBall();
    } else if (ball.x + ballRadius > canvas.width) {
        player1Score++;
        resetBall();
    }

    // CPU Movement (if single player mode)
    if (!isTwoPlayer) {
        paddle2.y += (ball.y - (paddle2.y + paddleHeight / 2)) * 0.1;
    }
}

function render() {
    drawRect(0, 0, canvas.width, canvas.height, "black");
    drawNet();
    drawText(player1Score, canvas.width / 4, canvas.height / 5, "white");
    drawText(player2Score, 3 * canvas.width / 4, canvas.height / 5, "white");
    renderTimer(); // Adiciona o cronômetro no topo
    drawRect(paddle1.x, paddle1.y, paddleWidth, paddleHeight, "white");
    drawRect(paddle2.x, paddle2.y, paddleWidth, paddleHeight, "white");
    drawCircle(ball.x, ball.y, ballRadius, "white");
}


function gameLoop() {
    update();
    render();
}

// Controls for Player 1 (W and S keys)
document.addEventListener("keydown", function (event) {
    switch (event.key) {
        case "w":
            paddle1.dy = -8;
            break;
        case "s":
            paddle1.dy = 8;
            break;
    }
});

document.addEventListener("keyup", function (event) {
    switch (event.key) {
        case "w":
        case "s":
            paddle1.dy = 0;
            break;
    }
});

// Controls for Player 2 (Arrow Up and Arrow Down keys)
document.addEventListener("keydown", function (event) {
    if (isTwoPlayer) {
        switch (event.key) {
            case "ArrowUp":
                paddle2.dy = -8;
                break;
            case "ArrowDown":
                paddle2.dy = 8;
                break;
        }
    }
});

document.addEventListener("keyup", function (event) {
    if (isTwoPlayer) {
        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
                paddle2.dy = 0;
                break;
        }
    }
});


let timeLeft = 180; // 3 minutos em segundos
let timerInterval;

function startGame() {
    menu.style.display = "none";
    gameContainer.style.display = "flex";
    timeLeft = 180; // Reinicia o tempo a cada jogo
    timerInterval = setInterval(updateTimer, 1000); // Atualiza o cronômetro a cada segundo
    setInterval(gameLoop, 1000 / 60);
}

function updateTimer() {
    timeLeft--;
    if (timeLeft <= 0) {
        clearInterval(timerInterval); // Para o cronômetro
        endGame(); // Termina o jogo
    }
    renderTimer(); // Atualiza a exibição do cronômetro
}

function renderTimer() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(`Time: ${Math.floor(timeLeft / 60)}:${timeLeft % 60 < 10 ? '0' : ''}${timeLeft % 60}`, canvas.width / 2 - 50, 30);
}

function endGame() {
    // Exibe o vencedor com base na pontuação
    let winner = player1Score > player2Score ? "Player 1 Wins!" :
                 player1Score < player2Score ? "Player 2 Wins!" : "It's a Tie!";
    alert(winner);

    // Reinicia o jogo
    menu.style.display = "block";
    gameContainer.style.display = "none";
    player1Score = 0;
    player2Score = 0;
    ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 4, dy: 4, speed: 4 };
}
