// Get canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get necessary elements
let score = 0;
const scoreEl = document.getElementById("score");
const finalScore = document.getElementById("finalScore");
const scoreBoard = document.querySelector(".scoreBoard");
const button = document.querySelector("button");

// Create sufficient arrays.
let projectiles = [];
let enemies = [];
let particles = [];

// Create class Player
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Create class Projectile
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
    }
}

// Create class Enemy
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
    }
}

// Create class Particle
class Particle {
    constructor(x, y, radius, color, velocity, alpha) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
        this.draw();
    }
}

// Make random enemies
function spawnEnemy() {
    // make enemy come from random place
    setInterval(() => {
        const radius = Math.random() * 24 + 6;
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

// Make player and draw it.
let player = new Player(canvas.width / 2, canvas.height / 2, 15, "white");
player.draw();

// Make a variable named 'animateId' so that animation can be removable.
let animateId;
function animate() {
    animateId = requestAnimationFrame(animate);

    // Make smooth effects on any object.
    ctx.fillStyle = `rgba(0, 0, 0, .1)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player after clearing the canvas.
    player.draw();

    // ForEach Projectiles: command
    projectiles.forEach((projectile, index) => {
        projectile.update();

        // If the projectiles are at the edges, they will be removed.
        if (
            projectile.x - projectile.radius < 0 ||
            projectile.x + projectile.radius > canvas.width ||
            projectile.y - projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            projectiles.splice(index, 1);
        }
    });

    // When particle's alpha value will be 0, they will be removed
    particles.forEach((particle, index) => {
        if (particle.alpha < 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    // ForEach Enemies: command
    enemies.forEach((enemy, index) => {
        enemy.update();

        // If distance between player and enemy becomes 0, the game is over.
        // The scoreboard will appear and give a choice to play again.
        let distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distance - player.radius - enemy.radius < 1) {
            // Cancel the animation by removing the animateId.
            cancelAnimationFrame(animateId);
            scoreBoard.classList.toggle("shown");
            finalScore.textContent = score;
        }

        // If Projectiles hit enemy, enemy and particles will be removed.
        projectiles.forEach((projectile, projectileIndex) => {
            let distance = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
            );

            // If projectile and enemy hits, command:
            if (distance - enemy.radius - projectile.radius < 1) {
                // Firework effect.
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random() * 2,
                            enemy.color,
                            {
                                x:
                                    (Math.random() * 1 - 0.5) *
                                    (Math.random() * 5),
                                y:
                                    (Math.random() * 1 - 0.5) *
                                    (Math.random() * 5)
                            }
                        )
                    );
                }

                // If the radius of enemy becomes less than 20
                if (enemy.radius - 10 > 10) {
                    score += 250;
                    scoreEl.textContent = score;

                    enemy.radius -= 10;
                    projectiles.splice(projectileIndex, 1);
                } else {
                    score += 100;
                    scoreEl.textContent = score;
                    enemies.splice(index, 1);
                    projectiles.splice(projectileIndex, 1);
                }
            }
        });
    });
}

// Create Projectiles: command
window.addEventListener("click", (e) => {
    const angle = Math.atan2(
        e.clientY - canvas.height / 2,
        e.clientX - canvas.width / 2
    );
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    };
    projectiles.push(
        new Projectile(
            canvas.width / 2,
            canvas.height / 2,
            5,
            "white",
            velocity
        )
    );
});

// To initialize the game:
function init() {
    player = new Player(canvas.width / 2, canvas.height / 2, 15, "white");
    projectiles = [];
    enemies = [];
    particles = [];
}

// If button is clicked, the game starts.
button.addEventListener("click", () => {
    init();
    score = 0;
    scoreEl.textContent = score;
    scoreBoard.classList.toggle("shown");
    animate();
    spawnEnemy();
});
