var gl;

window.addEventListener("load", init);

function init() {
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext('webgl2');
   if (!gl) alert("WebGL 2.0 isn't available");

   var program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);


   //----------------------------------
   // Vertices for positions and colors
   //----------------------------------

   var positions = [
      // Background (covering the entire canvas)
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0,
      -1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,

      // Ground (covering the bottom part)
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0,
      -1.0, -0.5, 0.0,
      1.0, -0.5, 0.0,

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

      // First window (top left)
      -0.4, 0.2, 0.0,
      -0.2, 0.2, 0.0,
      -0.4, 0.4, 0.0,
      -0.2, 0.4, 0.0,

      // Second window (top right)
      0.2, 0.2, 0.0,
      0.4, 0.2, 0.0,
      0.2, 0.4, 0.0,
      0.4, 0.4, 0.0,

      // Sun
      -0.9, 0.9, 0.0, 

      // Flowerpot (four points forming a square)
      -0.7, -0.7, 0.0,
      -0.7, -0.6, 0.0,
      -0.6, -0.7, 0.0,
      -0.6, -0.6, 0.0,
   ];

   var colors = [
      // Background color (e.g., light blue for sky)
      0.529, 0.808, 0.922, 1.0,
      0.529, 0.808, 0.922, 1.0,
      0.529, 0.808, 0.922, 1.0,
      0.529, 0.808, 0.922, 1.0,

      // Ground color (e.g., green for grass)
      0.196, 0.804, 0.196, 1.0,
      0.196, 0.804, 0.196, 1.0,
      0.196, 0.804, 0.196, 1.0,
      0.196, 0.804, 0.196, 1.0,

      // House base color (e.g., peach)
      1.0, 0.855, 0.725, 1.0,
      1.0, 0.855, 0.725, 1.0,
      1.0, 0.855, 0.725, 1.0,
      1.0, 0.855, 0.725, 1.0,

      // Roof color (e.g., deep pink)
      1.0, 0.412, 0.706, 1.0,
      1.0, 0.412, 0.706, 1.0,
      1.0, 0.412, 0.706, 1.0,

      // Door color (lavender)
      0.678, 0.498, 0.659, 1.0,
      0.678, 0.498, 0.659, 1.0,
      0.678, 0.498, 0.659, 1.0,
      0.678, 0.498, 0.659, 1.0,

      // Window color (e.g., gold)
      1.0, 0.843, 0.0, 1.0,
      1.0, 0.843, 0.0, 1.0,
      1.0, 0.843, 0.0, 1.0,
      1.0, 0.843, 0.0, 1.0,

      // Window color (e.g., gold)
      1.0, 0.843, 0.0, 1.0,
      1.0, 0.843, 0.0, 1.0,
      1.0, 0.843, 0.0, 1.0,
      1.0, 0.843, 0.0, 1.0,
      //sun
      // Flowerpot color
      1.0, 0.0, 0.0, 1.0,
      1.0, 0.0, 0.0, 1.0,
      1.0, 0.0, 0.0, 1.0,
      1.0, 0.0, 0.0, 1.0,
   ];

	   // Add vertices for the circle
	   var center = vec2(-0.9, 0.9);
	   var radius = 0.2;

	   for (let i = 0; i <= 100; i++) {
		  positions.push(center[0] + radius * Math.cos(i * 2 * Math.PI / 100));
		  positions.push(center[1] + radius * Math.sin(i * 2 * Math.PI / 100));
		  positions.push(0.0);

		  colors.push(1.0, 1.0, 0.0, 1.0);
	   }



     //----------------------------------
     //buffers
     //----------------------------------



   var vertexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

   var colorBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

   var vPosition = gl.getAttribLocation(program, "vPosition");
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vPosition);

   var vColor = gl.getAttribLocation(program, "vColor");
   gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
   gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vColor);

   // Draw the background (sky)
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

   // Draw the ground (green for grass)
   gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4);

   // Draw the house, tree, flower, and circle
   render();
}


    //----------------------------------
    //draw objects
    //----------------------------------



function render() {
   // House
   gl.drawArrays(gl.TRIANGLE_STRIP, 8, 4);

   // Roof
   gl.drawArrays(gl.TRIANGLES, 12, 3);

   // Door
   gl.drawArrays(gl.TRIANGLE_STRIP, 15, 4);

   // Window1
   gl.drawArrays(gl.TRIANGLE_STRIP, 19, 4);

   // Window2
   gl.drawArrays(gl.TRIANGLE_STRIP, 23, 4);

   // Sun
   gl.drawArrays(gl.TRIANGLE_FAN, 27, 102);

   // Flowerpot
   gl.drawArrays(gl.POINTS, 28, 4);
    }