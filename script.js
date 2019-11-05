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
}


// Classes
class Circle {
  constructor(x, y, radius) {
    this.radius = radius;
    this.x = x || Math.random() * (c.width - this.radius * 2) + this.radius;
    this.y = y || Math.random() * (c.height - this.radius * 2) + this.radius;
    this.color = 'black';
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
  constructor(x, y, radius, vx, vy) {
    super(x, y, radius);
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
    let dx = Math.abs(char.x - this.x);
    let dy = Math.abs(char.y - this.y);
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance - this.radius - char.radius <= 0 && this.timeActive > 5) {
      gameOver();
    }
  }
}


class Character extends Circle {
  constructor(x, y, radius) {
    super(x, y, radius);
    this.moveSpeed = 5;
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
      this.x, this.y, 5, vx, -vy
    ))
  }

  move() {
    if ( keydownArray[0] ) {
      // Move up
      this.y -= this.moveSpeed;
    }
    if( keydownArray[1]) {
      // Move down
      this.y += this.moveSpeed;
    }
    if ( keydownArray[2]) {
      // Move left
      this.x -= this.moveSpeed;
    }
    if ( keydownArray[3] ) {
      // Move right
      this.x += this.moveSpeed;
    }
  }

  update() {
    this.move();
    this.draw();
  }
}

function Reticle(char) {
  this.char = char;
  this.radius = 15;

  this.update = () => {
    this.draw();
  }

  this.draw = () => {
    // let dx = Math.abs(mouse.x - this.char.x);
    // let dy = Math.abs(mouse.y - this.char.y);
    // let theta = Math.PI /2 - Math.atan2(dy, dx);
    // let adj = this.radius * Math.cos(theta);
    // let opp = this.radius * Math.sin(theta);

    // drawLine(this.char.x, this.char.y, mouse.x - opp, mouse.y + adj, 'rgba(0, 0, 0, 0.5)');
    drawCircle(mouse.x, mouse.y, this.radius);
    drawLine(mouse.x - (this.radius * 3/2 ), mouse.y, mouse.x - (this.radius * 1/2), mouse.y);
    drawLine(mouse.x + (this.radius * 3/2 ), mouse.y, mouse.x + (this.radius * 1/2), mouse.y);
    drawLine(mouse.x, mouse.y - (this.radius * 3/2 ), mouse.x, mouse.y - (this.radius * 1/2));
    drawLine(mouse.x, mouse.y + (this.radius * 3/2 ), mouse.x, mouse.y + (this.radius * 1/2));
  }
}


var char = new Character(c.width / 2, c.height / 2, 30);
var ret = new Reticle(char);
var projectileArray = [];

function animate() {
  requestAnimationFrame(animate);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, c.width, c.height);
  char.update();
  ret.update();
  for (let i = 0; i < projectileArray.length; i++) {
    projectileArray[i].update();
  }
}

function init() {
  animate();
}


init();

