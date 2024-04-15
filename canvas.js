function createCanvas(x, y) {
  var canvas = document.createElement("canvas");
  canvas.width = x;
  canvas.height = y;
  // canvas.style.border = "0.1rem solid black";
  document.body.appendChild(canvas);
  return canvas;
}

/*
Canvas Context2D Implementation
*/
// function drawLine(x1, y1, x2, y2) {
//   ctx.beginPath();
//   ctx.moveTo(x1, y1);
//   ctx.lineTo(x2, y2);
//   ctx.stroke();
// }

// function drawCircle(x1, y1, r) {
//   ctx.beginPath();
//   ctx.arc(x1, y1, r, 0, 2 * Math.PI);
//   ctx.stroke();
// }

// function drawGrid() {
//   ctx.fillStyle = "red";
//   for (x = 0; x < grid.length; x++) {
//     for (y = 0; y < grid[x].length; y++) {
//       if (grid[x][y] != -1) {
//         if (particles[grid[x][y]].type == 0) {
//           ctx.fillStyle = "brown";
//         } else {
//           ctx.fillStyle = "yellowgreen";
//         }
//         ctx.fillRect(x * step, y * step, step, step);
//         continue;
//       }
//     }
//   }
//   ctx.fillStyle = "white";
// }
