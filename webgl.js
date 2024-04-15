// Define vertex shader code
let vertexShaderCode = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        gl_PointSize = 1.0; // Set point size to 1 pixel
    }
`;

// Define fragment shader code
let fragmentShaderCode = `
    uniform sampler2D uPreviousFrame;
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Set pixel color to white
    }
`;

// Create vertex shader
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderCode);
gl.compileShader(vertexShader);

// Create fragment shader
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderCode);
gl.compileShader(fragmentShader);

// Create shader program
let shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// Define the positions of the points
const pos = [];
// for (let i = -canvas.width; i < canvas.width; i++) {
//   for (let j = -canvas.height; j < canvas.height; j++) {
//     pos.push(i / canvas.width, j / canvas.height);
//   }
// }
let positions = new Float32Array(pos);

// Create a buffer and bind it
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

// Get the position attribute location
let positionAttributeLocation = gl.getAttribLocation(shaderProgram, "position");
gl.enableVertexAttribArray(positionAttributeLocation);

// Specify how to pull the data out of the position buffer
let size = 2; // 2 components per iteration
let type = gl.FLOAT; // the data is 32bit floats
let normalize = false; // don't normalize the data
let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
let offset = 0; // start at the beginning of the buffer
gl.vertexAttribPointer(
  positionAttributeLocation,
  size,
  type,
  normalize,
  stride,
  offset
);

gl.viewport(0, 0, canvas.width, canvas.height);
animate();
// Clear the canvas
function animate() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // black background
  gl.clear(gl.COLOR_BUFFER_BIT);
  // Draw the points
  gl.drawArrays(gl.POINTS, 0, positions.length / size);
  requestAnimationFrame(animate);
}
