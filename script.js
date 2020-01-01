var c = document.getElementById("myCanvas");
c.width = document.body.clientWidth;
c.height = document.body.clientHeight;
var ctx = c.getContext("2d");

// Rect
// ctx.fillRect(100, 100, 50, 100);
// ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
// ctx.fillRect(200, 75, 200, 100);

// Line
// ctx.beginPath();
// ctx.moveTo(50, 300);
// ctx.lineTo(2, 324);
// ctx.lineTo(400, 300);
// ctx.strokeStyle = "blue";
// ctx.stroke();

// Arc / Circle

// pi / 180 radians = 1 degree
// 1 radian = 180 / pi degrees
// ctx.beginPath();
// ctx.arc(300, 300, 50, 0, Math.PI * 2, false);
// ctx.arc(500, 500, 50, 0, Math.PI, false);
// ctx.arc(100, 500, 50, Math.PI * 2, Math.PI, true);
// ctx.stroke();

var mouse = {
  x: 0,
  y: 0
}

var colors = [
  '#171A21',
  '#594E36',
  '#617073',
  '#8BBEB2',
  '#3A506B'
]

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function calculateDistance(x1, y1, x2, y2) {
  let dx = Math.abs(x1 - x2);
  let dy = Math.abs(y1 - y2);
  return Math.sqrt(dx * dx + dy * dy);
}

// Drawing Functions
function drawLine(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color ? color : 'black';
  ctx.stroke();
}

function drawCircle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.stroke();
}


// Event listeners
window.addEventListener('mousemove',
  function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }
)

window.addEventListener('resize', 
  function() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }
)

window.addEventListener('click',
  function(e) {
    char.shoot();
  }
)


// Track key press
var keydownArray = []
function toggleKey(e, boolean) {
  e = e || event; // To deal with IE
  if (e.keyCode == '38' || e.keyCode == '87') {
    // Up
    keydownArray[0] = boolean;
  }
  if (e.keyCode == '40' || e.keyCode == '83') {
    // down
    keydownArray[1] = boolean;
  }
  if (e.keyCode == '37' || e.keyCode == '65') {
    // left
    keydownArray[2] = boolean;
  }
  if (e.keyCode == '39' || e.keyCode == '68') {
    // right
    keydownArray[3] = boolean;
  }
}

window.addEventListener('keydown', e => {
  toggleKey(e, true);
});

window.addEventListener('keyup', e => {
  toggleKey(e, false);
})

function gameOver() {
  enemyArray = [];
  projectileArray = [];
  char = new Character(c.width / 2, c.height / 2, 30, randomColor())
  game.reset();
}


// Classes
class Circle {
  constructor(x, y, radius, color) {
    this.radius = radius;
    this.x = x || Math.random() * (c.width - this.radius * 2) + this.radius;
    this.y = y || Math.random() * (c.height - this.radius * 2) + this.radius;
    this.color = color || 'black';
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

class Projectile extends Circle {
  constructor(id, x, y, radius, vx, vy) {
    super(x, y, radius);
    this.id = id;
    this.vx = vx * 0.5;
    this.vy = vy * 0.5;
    this.timeActive = 0;
  }

  update() {
    if ( this.y + this.vy - this.radius < 0 || this.y + this.vy + this.radius > c.height) {
      this.vy = -this.vy;
    }
    if ( this.x + this.vx- this.radius < 0 || this.x + this.vx + this.radius > c.width) {
      this.vx = -this.vx;
    }
    this.x += this.vx;
    this.y += this.vy;

    this.timeActive ++;
    this.detectCollision();
    this.draw();
  }

  detectCollision() {
    const that = this;
    let charDistance = calculateDistance(char.x, char.y, this.x, this.y);

    if (charDistance - this.radius - char.radius <= 0 && this.timeActive > 5) {
      gameOver();
    }
    for (let i = 0; i < enemyArray.length; i++) {
      let enemy = enemyArray[i];
      let enDistance = calculateDistance(enemy.x, enemy.y, this.x, this.y);

      if (enDistance - this.radius - enemy.radius <= 0) {
        enemyArray.splice(i, 1);
        projectileArray = projectileArray.filter(function(obj) {
          return obj.id !== that.id;
      });
      }
    }
  }
}

function calculateXYDisplacement(theta, hyp) {
  let dx = hyp * Math.cos(theta);
  let dy = hyp * Math.sin(theta);
  return {dx: dx, dy: dy};
}


class Character extends Circle {
  constructor(x, y, radius, color) {
    super(x, y, radius, color);
    this.moveSpeed = 5;
    this.diagonalDisplacement = calculateXYDisplacement(this.moveSpeed * Math.PI / 4, this.moveSpeed).dx;

    this.projectileIDTracker = 0;
  }

  shoot() {
    let dx = Math.abs(mouse.x - this.x);
    let dy = Math.abs(mouse.y - this.y);
    let theta = Math.atan2(dy, dx);
    let vx = this.radius * Math.cos(theta);
    let vy = this.radius * Math.sin(theta);

    if (mouse.x < this.x) {
      vx = -vx;
    }

    if (mouse.y > this.y) {
      vy = -vy;
    }

    projectileArray.push(new Projectile(
      this.projectileIDTracker, this.x, this.y, 5, vx, -vy
    ))
    this.projectileIDTracker ++;
  }

  moveVerticle(speed) {
    if (speed < 0 && this.y - this.radius > 0 || speed > 0 && this.y + this.radius < c.height) {
      this.y += speed;
    }
  }

  moveHorizontal(speed) {
    if (speed > 0 && this.x + this.radius < c.width || speed < 0 && this.x - this.radius > 0) {
      this.x += speed;
    }
  }

  move() {
    const up = keydownArray[0];
    const down = keydownArray[1];
    const left = keydownArray[2];
    const right = keydownArray[3];

    // Diagonal Movement
    if ( up && right ) {
      this.moveVerticle(this.diagonalDisplacement);
      this.moveHorizontal(-this.diagonalDisplacement);
    } else if ( up && left ) {
      this.moveVerticle(this.diagonalDisplacement);
      this.moveHorizontal(this.diagonalDisplacement);
    } else if (down && right) {
      this.moveVerticle(-this.diagonalDisplacement);
      this.moveHorizontal(-this.diagonalDisplacement);
    } else if ( down && left ) {
      this.moveVerticle(-this.diagonalDisplacement);
      this.moveHorizontal(this.diagonalDisplacement)
    } 
    
    else {
      // Vertical Movement
      if ( up ) {
        this.moveVerticle(-this.moveSpeed);
      }
      if( down ) {
        this.moveVerticle(this.moveSpeed);
      }
      // Horizontal Movement
      if ( left ) {
        this.moveHorizontal(-this.moveSpeed);
      }
      if ( right ) {
        this.moveHorizontal(this.moveSpeed);
      }
    }
    
  }

  update() {
    this.move();
    this.draw();
  }
}

class Enemy extends Circle {
  constructor(x, y, radius, color, moveSpeed) {
    super(x, y, radius, color);
    this.moveSpeed = moveSpeed || 3;
  }

  moveVerticle(speed) {
    this.y += speed;
  }

  moveHorizontal(speed) {
    this.x += speed;
  }

  move() {
    let dx = char.x - this.x;
    let dy = char.y - this.y;
    let theta = Math.atan2(dy, dx);
    this.moveVerticle(calculateXYDisplacement(theta, this.moveSpeed).dy);
    this.moveHorizontal(calculateXYDisplacement(theta, this.moveSpeed).dx);
  }

  detectCollision() {
    let distance = calculateDistance(char.x, char.y, this.x, this.y);
    if (distance - this.radius - char.radius <= 0) {
      gameOver();
    }
  }

  update() {
    this.move();
    this.detectCollision();
    this.draw();
  }
}

function Reticle() {
  this.radius = 15;

  this.update = () => {
    this.draw();
  }

  this.draw = () => {
    drawCircle(mouse.x, mouse.y, this.radius);
    drawLine(mouse.x - (this.radius * 3/2 ), mouse.y, mouse.x - (this.radius * 1/2), mouse.y);
    drawLine(mouse.x + (this.radius * 3/2 ), mouse.y, mouse.x + (this.radius * 1/2), mouse.y);
    drawLine(mouse.x, mouse.y - (this.radius * 3/2 ), mouse.x, mouse.y - (this.radius * 1/2));
    drawLine(mouse.x, mouse.y + (this.radius * 3/2 ), mouse.x, mouse.y + (this.radius * 1/2));
  }
}

class Game {
  constructor(highscore) {
    this.highscore = highscore || 0,
    this.score = 0,
    this.level = 1,
    this.enemySpawnRate = 1500,
    this.enemySpawn = setInterval(spawnEnemy, this.enemySpawnRate)
  }

  reset() {
    if (this.score > this.highscore) {
      this.highscore = this.score;
    }
    this.score = 0,
    this.level = 1,
    clearInterval(this.enemySpawn),
    this.enemySpawnRate = 1500,
    this.enemySpawn = setInterval(spawnEnemy, this.enemySpawnRate)
  }

  drawScoreBoard() {
    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.fillText("Highscore: " + this.highscore, 50, 25);
    ctx.fillText("Score: " + this.score, 50, 50);
  }

  drawLevel() {
    ctx.fillStyle = "#f0f0f0";
    ctx.font = "48px Arial";
    ctx.fillText("Level " + this.level, c.width / 2 - 75, c.height / 2);
  }

  updateLevel() {
    this.level ++;
    if (this.enemySpawnRate > 100) {
      this.enemySpawnRate -= 100;
      clearInterval(this.enemySpawn);
      this.enemySpawn = setInterval(spawnEnemy, this.enemySpawnRate);
    }
  }

  updateScore() {
    this.score ++;
    if (this.score - this.level * 500 === 0) {
      this.updateLevel();
    }
  }

  update() {
    this.drawScoreBoard();
    this.drawLevel();
    this.updateScore();
  }
}

var game = new Game();
var char = new Character(c.width / 2, c.height / 2, 30, randomColor());

var reticle = new Reticle(char);
var projectileArray = [];
var enemyArray = [];

var enemyRadius = 20;

function generateSpawnPoint() {
  var side = Math.floor(Math.random() * 4);
  if (side === 0) {
    // left side
    return {
      x: -enemyRadius,
      y: Math.random() * c.height
    }
  } else if (side === 1) {
    // right side
    return {
      x: c.width + enemyRadius,
      y: Math.random() * c.height
    }
  } else if (side === 2) {
    // up side
    return {
      x: Math.random() * c.width,
      y: -enemyRadius
    }
  } else if (side === 3) {
    // down side
    return {
      x: Math.random() * c.width,
      y: c.height + enemyRadius
    }
  }
}

function spawnEnemy() {
  let spawnLocation = generateSpawnPoint();
  enemyArray.push(new Enemy(
    spawnLocation.x,
    spawnLocation.y,
    enemyRadius,
    'red'
  ));
}

function animate() {
  requestAnimationFrame(animate);

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, c.width, c.height);

  game.update();
  char.update();
  for (let i = 0; i < projectileArray.length; i++) {
    projectileArray[i].update();
  };
  for (let i=0; i< enemyArray.length; i++) {
    enemyArray[i].update();
  }
  reticle.update();
}


function init() {
  animate();
}


init();

