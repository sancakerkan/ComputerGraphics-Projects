// This variable will store the WebGL rendering context
var gl;

window.addEventListener("load", init);

function init() {
   // Set up a WebGL Rendering Context in an HTML5 Canvas
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext('webgl2');
   if (!gl) alert("WebGL 2.0 isn't available");

   //  Configure WebGL
   //  eg. - set a clear color
   //      - turn on depth testing

   //  Load shaders and initialize attribute buffers
   var program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);

   // Set up data to draw
   var positions = [
      // House base (square)
      -0.5, -0.5, 0.0,
      0.5, -0.5, 0.0,
      -0.5, 0.5, 0.0,
      0.5, 0.5, 0.0,

      // Roof (triangle)
      -0.5, 0.5, 0.0,
      0.5, 0.5, 0.0,
      0.0, 1.0, 0.0,

      // Door (rectangle)
      -0.2, -0.5, 0.0,
      0.2, -0.5, 0.0,
      -0.2, 0.0, 0.0,
      0.2, 0.0, 0.0,
   ];

   var colors = [
      // House base color (e.g., brown)
      0.5, 0.35, 0.05, 1.0,
      0.5, 0.35, 0.05, 1.0,
      0.5, 0.35, 0.05, 1.0,
      0.5, 0.35, 0.05, 1.0,

      // Roof color (e.g., red)
      0.8, 0.0, 0.0, 1.0,
      0.8, 0.0, 0.0, 1.0,
      0.8, 0.0, 0.0, 1.0,

      // Door color (e.g., blue)
      0.0, 0.0, 0.8, 1.0,
      0.0, 0.0, 0.8, 1.0,
      0.0, 0.0, 0.8, 1.0,
      0.0, 0.0, 0.8, 1.0,
   ];

   // Load the data into GPU data buffers
   var vertex_buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

   var color_buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

   // Associate shader attributes with corresponding data buffers
   var vPosition = gl.getAttribLocation(program, "vPosition");
   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
   gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vPosition);

   var vColor = gl.getAttribLocation(program, "vColor");
   gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
   gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vColor);

   // Get addresses of shader uniforms
   var pointSizeLoc = gl.getUniformLocation(program, "pointSize");
   gl.uniform1f(pointSizeLoc, 10.0); // Set point size (adjust as needed)

   // Either draw as part of initialization
   render();

   // Or draw just before the next repaint event
   // requestAnimationFrame(render);
}

function render() {
   // clear the screen
   gl.clear(gl.COLOR_BUFFER_BIT);

   // draw house base (square)
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

   // draw roof (triangle)
   gl.drawArrays(gl.TRIANGLES, 4, 3);

   // draw door (rectangle)
   gl.drawArrays(gl.TRIANGLE_STRIP, 7, 4);
}
