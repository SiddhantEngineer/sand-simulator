//params
// var vheight = window.innerHeight;
// var vwidth = window.innerWidth;
var vheight = 500;
var vwidth = 800;
var step = 1;
const checksContainer = document.getElementById("checks");
const fpsContainer = document.getElementById("fps");
const bodiesContainer = document.getElementById("bodies");

var yCount = vheight / step - 1;
var xCount = vwidth / step - 1;

var canvas = createCanvas(vwidth, vheight);
var ctx = canvas.getContext("webgl");
let pixels = new Uint8ClampedArray(canvas.width * canvas.height * 4);

let vertexShaderCode = `
    attribute vec2 position;
    vec2 world = vec2(${vwidth}, ${vheight});
    void main() {
        vec2 tempPos = (position)/world * 2.0 - 1.0;
        gl_Position = vec4(vec2(1.0, -1.0)*tempPos, 0.0, 1.0);
        gl_PointSize = 1.0; // Set point size to 1 pixel
    }
`;

let fragmentShaderCode = `
    void main() {
        gl_FragColor = vec4(vec3(255, 255, 150)/255.0, 1.0); // Set pixel color to white
    }
`;

let vertexShader = ctx.createShader(ctx.VERTEX_SHADER);
ctx.shaderSource(vertexShader, vertexShaderCode);
ctx.compileShader(vertexShader);

if (!ctx.getShaderParameter(vertexShader, ctx.COMPILE_STATUS)) {
  console.warn(
    `An error occurred compiling the shaders: ${ctx.getShaderInfoLog(
      vertexShader
    )}`
  );
}

let fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER);
ctx.shaderSource(fragmentShader, fragmentShaderCode);
ctx.compileShader(fragmentShader);

if (!ctx.getShaderParameter(fragmentShader, ctx.COMPILE_STATUS)) {
  console.warn(
    `An error occurred compiling the shaders: ${ctx.getShaderInfoLog(
      fragmentShader
    )}`
  );
}

let shaderProgram = ctx.createProgram();
ctx.attachShader(shaderProgram, vertexShader);
ctx.attachShader(shaderProgram, fragmentShader);
ctx.linkProgram(shaderProgram);
ctx.useProgram(shaderProgram);

let pos = [];

ctx.viewport(0, 0, canvas.width, canvas.height);

var grid = []; //stores presence of particle
var particles = []; //stores actual particles
var newParticles = []; //stores new particles to be added in the next cycle(cant add while the calculation in going on)

var id = -1; //static ids.
var flag = true; //for changing right to left
var added = false;
var checks = 0;
var fps = 0;
var currentFps = 0;

class Particle {
  static count = 0;
  constructor(x, y, type) {
    Particle.count++;
    this.x = x;
    this.y = y;
    this.id = ++id;
    this.vx = 1;
    this.vy = 1;
    this.lastx = x;
    this.lasty = y;
    this.xBool = -200;
    this.yBool = -200;
    this.type = type;
  }
}

//initialsing grid
for (let i = 0; i < vwidth / step; i++) {
  grid.push([]);
  for (let j = 0; j < vheight / step; j++) {
    grid[i].push(-1);
  }
}

animate();
checkTime();

async function animate() {
  if (added) {
    particles.push(...newParticles);
    newParticles = [];
    added = false;
  }

  resetGrid();

  updatePos();

  let positions = new Float32Array(pos);
  let positionBuffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
  ctx.bufferData(ctx.ARRAY_BUFFER, positions, ctx.STATIC_DRAW);
  // Get the position attribute location
  let positionAttributeLocation = ctx.getAttribLocation(
    shaderProgram,
    "position"
  );
  ctx.enableVertexAttribArray(positionAttributeLocation);

  // Specify how to pull the data out of the position buffer
  let size = 2; // 2 components per iteration
  let type = ctx.FLOAT; // the data is 32bit floats
  let normalize = false; // don't normalize the data
  let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  let offset = 0; // start at the beginning of the buffer
  ctx.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );
  ctx.clearColor(173 / 255, 216 / 255, 230 / 255, 1.0); // black background
  ctx.clear(ctx.COLOR_BUFFER_BIT);
  // Draw the points
  ctx.drawArrays(ctx.POINTS, 0, positions.length / size);
  // await Sleep(100);
  fps += 1;
  bodiesContainer.innerHTML = "Bodies: " + Particle.count;
  requestAnimationFrame(animate);
}

async function checkTime() {
  while (true) {
    await Sleep(1000);
    currentFps = fps;
    fpsContainer.innerHTML = "FPS: " + fps;
    fps = 0;
  }
}

async function updatePos() {
  checks = 0;
  for (let j = yCount; j >= 0; j--) {
    for (let i = 0; i < vwidth / step; i++) {
      if (grid[i][j] != -1) {
        var element = particles[grid[i][j]];
        if (element.id == 3) {
          // console.log("X: " + element.x + " Y: " + element.y);
        }
        if (element.lastx == element.x) {
          element.xBool += 1;
          if (element.xBool >= 1) {
            continue;
          }
        }
        if (element.lasty == element.y) {
          element.yBool += 1;
          if (element.yBool >= 1) {
            continue;
          }
        }
        grid[i][j] = -1;
        element.lastx = element.x;
        element.lasty = element.y;
        checks += 1;
        if (element.type == 0) {
          moveElement1(i, j, element);
        } else {
          moveElement(i, j, element);
        }
        grid[element.x][element.y] = element.id;
      }
    }
  }
  // ctx.strokeText("CHECK: " + checks, 20, 50);
  checksContainer.innerHTML = "CHECK: " + checks;
}

//for water type
//currently experimental
function moveElement1(i, j, element) {
  var movementX = false;
  for (let m = 0; m < element.vx; m++) {
    for (let k = 0; k < element.vy; k++) {
      element.y += 1;
      if (element.y > yCount) {
        element.y = yCount;
        return;
      } else {
        if (grid[element.x][element.y] != -1) {
          if (flag) {
            flag = false;
            if (
              element.x < xCount &&
              grid[element.x + 1][element.y - 1] == -1 &&
              grid[element.x + 1][element.y] == -1
            ) {
              element.x += 1;
              movementX = true;
            } else if (
              element.x > 0 &&
              grid[element.x - 1][element.y - 1] == -1 &&
              grid[element.x - 1][element.y] == -1
            ) {
              element.x -= 1;
              movementX = false;
            } else {
              element.y -= 1;
              return;
            }
          } else {
            flag = true;
            if (
              element.x > 0 &&
              grid[element.x - 1][element.y - 1] == -1 &&
              grid[element.x - 1][element.y] == -1
            ) {
              element.x -= 1;
              movementX = false;
            } else if (
              element.x < xCount &&
              grid[element.x + 1][element.y - 1] == -1 &&
              grid[element.x + 1][element.y] == -1
            ) {
              element.x += 1;
              movementX = true;
            } else {
              element.y -= 1;
              return;
            }
          }
        }
      }
    }
    element.vy += 1;
    if (element.vy >= 10) {
      element.vy -= 1;
    }
  }
  if (movementX) {
    element.vx += 1;
    if (element.vx >= 10) {
      element.vx = 10;
    }
  }
}

//for sand type
function moveElement(i, j, element) {
  var movementX = false;
  for (let m = 0; m < element.vx; m++) {
    for (let k = 0; k < element.vy; k++) {
      element.y += 1;
      if (element.y > yCount) {
        element.y -= 1;
        if (flag) {
          if (element.x + 1 < xCount && grid[element.x + 1][element.y] == -1) {
            element.x += 1;
            movementX = true;
          }
        } else {
          if (element.x - 1 > 0 && grid[element.x - 1][element.y] == -1) {
            element.x -= 1;
            movementX = true;
          }
        }
      }
      if (grid[element.x][element.y] != -1) {
        element.y -= 1;
        if (flag) {
          flag = false;
          if (grid[element.x + 1][element.y] == -1 && element.x + 1 < xCount) {
            element.x += 1;
            movementX = true;
          } else if (
            grid[element.x - 1][element.y] == -1 &&
            element.x - 1 > 0
          ) {
            element.x -= 1;
            movementX = true;
          }
        } else {
          flag = true;
          if (grid[element.x - 1][element.y] == -1 && element.x - 1 > 0) {
            element.x -= 1;
            movementX = true;
          } else if (
            grid[element.x + 1][element.y] == -1 &&
            element.x + 1 < xCount
          ) {
            element.x += 1;
            movementX = true;
          }
        }
      }
    }
    element.vy += 1;
    if (element.vy >= 10) {
      element.vy -= 1;
    }
  }
  if (movementX) {
    element.vx += 1;
    if (element.vx >= 50) {
      element.vx = 50;
    }
  }
}

function resetGrid() {
  //clearing the grid
  for (let i = 0; i < vwidth / step; i++) {
    for (let j = 0; j < vheight / step; j++) {
      grid[i][j] = -1;
    }
  }
  pos = [];
  //filling up the grid
  particles.forEach((element) => {
    grid[element.x][element.y] = element.id;
    pos.push(element.x, element.y);
  });
}

function Sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

canvas.onmousemove = function (event) {
  var mx = event.offsetX;
  var size = 20;
  var my = event.offsetY;
  if (event.offsetX + size * step * 2 > canvas.width) {
    return;
  }
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      newParticles.push(
        new Particle(
          Math.round(mx / step) + i * step,
          Math.round(my / step) + j * step,
          1
        )
      );
    }
  }
  added = true;
  // L(Math.round(mx / step), Math.round(my / step));
};

canvas.onmousedown = function (event) {
  var mx = event.offsetX;
  var my = event.offsetY;
  added = true;
  L(Math.round(mx / step), Math.round(my / step));
};

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  var mx = e.touches[0].clientX;
  var size = 20;
  var my = e.touches[0].clientY;
  if (e.touches[0].clientX + size * step * 2 > canvas.width) {
    return;
  }
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      newParticles.push(
        new Particle(
          Math.round(mx / step) + i * step,
          Math.round(my / step) + j * step,
          1
        )
      );
    }
  }
  added = true;
});

//tetris L Shape
function L(x, y) {
  for (let i = 0; i < yCount / 10; i++) {
    for (let j = 0; j < 50; j++) {
      if (i < yCount / 10 - 15 && j > 25) {
        continue;
      }
      newParticles.push(new Particle(x + j, y + i, 0));
    }
  }
}
