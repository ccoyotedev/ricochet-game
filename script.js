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
  char.color = 'red';
  enemyArray = [];
  projectileArray = [];
  char = new Character(c.width / 2, c.height / 2, 30, randomColor())
  if (score > highscore) {
    highscore = score;
  }
  score = 0;
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


class Character extends Circle {
  constructor(x, y, radius, color) {
    super(x, y, radius, color);
    this.moveSpeed = 5;
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

  move() {
    if ( keydownArray[0] ) {
      // Move up
      if (this.y - this.radius > 0) {
        this.y -= this.moveSpeed;
      }
    }
    if( keydownArray[1]) {
      // Move down
      if (this.y + this.radius < c.height) {
        this.y += this.moveSpeed;
      }
    }
    if ( keydownArray[2]) {
      // Move left
      if (this.x - this.radius > 0) {
        this.x -= this.moveSpeed;
      } 
    }
    if ( keydownArray[3] ) {
      // Move right
      if (this.x + this.radius < c.width) {
        this.x += this.moveSpeed;
      }
    }
  }

  update() {
    this.move();
    this.draw();
  }
}

class Enemy extends Circle {
  constructor(x, y, radius, color, vx, vy) {
    super(x, y, radius, color);
    this.vx = 3;
    this.vy = 3;
  }

  move() {
    if (char.x > this.x) {
      this.x += this.vx;
    } else if (char.x < this.x) {
      this.x -= this.vx;
    }

    if (char.y > this.y) {
      this.y += this.vy;
    } else if (char.y < this.y) {
      this.y -= this.vy;
    }
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


var char = new Character(c.width / 2, c.height / 2, 30, randomColor());

var reticle = new Reticle(char);
var projectileArray = [];
var enemyArray = [];
var score = 0;
var highscore = 0;

var enemySpawn = setInterval(spawnEnemy, 3000);
function spawnEnemy() {
  enemyArray.push(new Enemy(
    Math.random() * c.width,
    Math.random() * c.height,
    20,
    'red'
  ));
}

function animate() {
  requestAnimationFrame(animate);
  score ++;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "black";
  ctx.font = "18px Arial";
  ctx.fillText("Highscore: " + highscore, 50, 25);
  ctx.fillText("Score: " + score, 50, 50);
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

