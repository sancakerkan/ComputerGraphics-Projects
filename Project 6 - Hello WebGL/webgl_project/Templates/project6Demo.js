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

   // Load the data into GPU data buffers

   // Associate shader attributes with corresponding data buffers

   // Get addresses of shader uniforms

   // Either draw as part of initialization
   //render();

   // Or draw just before the next repaint event
   //requestAnimationFrame(render);
};


function render() {
   // clear the screen
   // draw
}