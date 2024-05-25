//
//  uofrGraphics.h
//
//  Created by Alex Clarke on 2013-05-02 as a modern GL replacement of some beginner friendly
//  functionality found in GLUT library. Some function names and code are borrowed from 
//  GLUT/freeglut
//
//  Ported to Javascript/WebGL from C++/OpenGL on 2016-01-11
//
//
//  Minor updates 2019-01-17
//      - Wire Sphere and Cube Added
//      - Colour Attribute enabled - no more static colour because of performance issues on some Macs
//      - Compatibility with Angel's 2017 MVnew.js fixed
//
// Minor updates 2020-01-14
//      - drawQuad performance improved
//          -  added preallocation of fixed storage location for quad data
//          -  added inline flattening of vertex data to storage
//          -  switched from subBufferData to bufferData to load quad vertices
//          -  switched to STREAM_DRAW instead of STATIC_DRAW
//
//      - added flatten4x4 to optimize flattening of 4x4 matrices
//
// WebGL2 Updates 2020-02-28
//      - added vertex array objects
//
// Minor update 2020-01-17
//      - added sin/cos precalculation to Sphere functions
//          - caused slight hit to performance, probably due to object member lookup
//          - TODO: switch to arrays
//          - TODO: performance hit from flatten - use pre-flattened arrays?

// The urgl object is declared here, but must not be constructed until there is
// a valid GL Context.
// eg. after these lines
//      gl = canvas.getContext('webgl2');
//      if (!gl) alert("WebGL 2.0 isn't available");
//
// Then you construct urgl like this:
//      urgl = new uofrGraphics(gl);
// If no argument is supplied, urgl attempts to use a global WebGL context named "gl"


// uofrGraphics Functions:
//      constructor
//      connectShader
//      setDrawColor
//      drawSolidSphere
//      drawWireSphere
//      drawSolidCube
//      drawWireCube
//      drawQuad
//
//  Other Utility Functions:
//      flatten4x4

var urgl;


// uofrGraphics object constructor
// I am not a javascript programmer.
// This is likely very ugly.
var uofrGraphics = function (inGL)
{
    this.shaderProgram = 0;
    this.positionAttribLoc = -1;
    this.normalAttribLoc = -1;
    this.colourAttribLoc = -1;
    this.colour = vec4(0, 0, 0, 1);
    this.lastCubeSize = 0;
    this.lastWireCubeSize = 0;
    
    this.lastSphereSlices = 0;
    this.lastSphereStacks = 0;
    this.lastSphereRadius = 0;
    this.sphereVerts = 0;
   
	 this.sphereColor = 0;
	 this.wireSphereColor = 0;
	 this.cubeColor = 0;
	 this.wireCubeColor = 0;

    this.lastWireSphereSlices = 0;
    this.lastWireSphereStacks = 0;
    this.lastWireSphereRadius = 0;
    this.wireSphereVerts = 0;
    this.quadData = new Float32Array(4*4*3);

    if (arguments.length == 0)
    {
        this.gl = gl;
    }
    else
    {
        this.gl = inGL;
    }
    
    this.primitive = this.gl.TRIANGLES;
    
    this.vao = gl.createVertexArray();
    this.external_vao = 0;

    this.cubeVerts =
    [
     vec4(0.5, 0.5, 0.5, 1), //0
     vec4(0.5, 0.5, -0.5, 1), //1
     vec4(0.5, -0.5, 0.5, 1), //2
     vec4(0.5, -0.5, -0.5, 1), //3
     vec4(-0.5, 0.5, 0.5, 1), //4
     vec4(-0.5, 0.5, -0.5, 1), //5
     vec4(-0.5, -0.5, 0.5, 1), //6
     vec4(-0.5, -0.5, -0.5, 1) //7
     ];
    
    this.cubeFullVerts = //36 vertices total
    [
     this.cubeVerts[0], this.cubeVerts[4], this.cubeVerts[6], //front
     this.cubeVerts[6], this.cubeVerts[2], this.cubeVerts[0],
     this.cubeVerts[1], this.cubeVerts[0], this.cubeVerts[2], //right
     this.cubeVerts[2], this.cubeVerts[3], this.cubeVerts[1],
     this.cubeVerts[5], this.cubeVerts[1], this.cubeVerts[3], //back
     this.cubeVerts[3], this.cubeVerts[7], this.cubeVerts[5],
     this.cubeVerts[4], this.cubeVerts[5], this.cubeVerts[7], //left
     this.cubeVerts[7], this.cubeVerts[6], this.cubeVerts[4],
     this.cubeVerts[4], this.cubeVerts[0], this.cubeVerts[1], //top
     this.cubeVerts[1], this.cubeVerts[5], this.cubeVerts[4],
     this.cubeVerts[6], this.cubeVerts[7], this.cubeVerts[3], //bottom
     this.cubeVerts[3], this.cubeVerts[2], this.cubeVerts[6]
     ];
    
    this.wireCubeFullVerts = //36 vertices total
    [
     this.cubeVerts[0], this.cubeVerts[4], this.cubeVerts[6], //front
     this.cubeVerts[2], this.cubeVerts[0], this.cubeVerts[6],
     
     this.cubeVerts[4], this.cubeVerts[5], this.cubeVerts[7], //left
     this.cubeVerts[6], this.cubeVerts[4], this.cubeVerts[7],
     
     this.cubeVerts[5], this.cubeVerts[1], this.cubeVerts[3], //back
     this.cubeVerts[7], this.cubeVerts[5], this.cubeVerts[3],
     
     this.cubeVerts[1], this.cubeVerts[0], this.cubeVerts[2], //left
     this.cubeVerts[3], this.cubeVerts[1], this.cubeVerts[2],
     
     this.cubeVerts[0], this.cubeVerts[1], this.cubeVerts[5], //top
     this.cubeVerts[4], this.cubeVerts[0], this.cubeVerts[5],
     
     this.cubeVerts[7], this.cubeVerts[3], this.cubeVerts[2], //bottom
     this.cubeVerts[6], this.cubeVerts[7], this.cubeVerts[2]
     ];
    
    this.right = vec4(1.0, 0.0, 0.0, 0.0);
    this.left = vec4(-1.0, 0.0, 0.0, 0.0);
    this.top = vec4(0.0, 1.0, 0.0, 0.0);
    this.bottom = vec4(0.0, -1.0, 0.0, 0.0);
    this.front = vec4(0.0, 0.0, 1.0, 0.0);
    this.back = vec4(0.0, 0.0, -1.0, 0.0);
    
    this.cubeNormsArray =
    [
     this.front, this.front, this.front, this.front, this.front, this.front,
     this.right, this.right, this.right, this.right, this.right, this.right,
     this.back, this.back, this.back, this.back, this.back, this.back,
     this.left, this.left, this.left, this.left, this.left, this.left,
     this.top, this.top, this.top, this.top, this.top, this.top,
     this.bottom, this.bottom, this.bottom, this.bottom, this.bottom, this.bottom
     
     ];
    
    this.wireCubeNormsArray =
    [
     this.front, this.front, this.front, this.front, this.front, this.front,
     this.left, this.left, this.left, this.left, this.left, this.left,
     this.back, this.back, this.back, this.back, this.back, this.back,
     this.right, this.right, this.right, this.right, this.right, this.right,
     this.top, this.top, this.top, this.top, this.top, this.top,
     this.bottom, this.bottom, this.bottom, this.bottom, this.bottom, this.bottom
     
     ];
    
    this.cubeBuffer = 0;
    this.cubeWireBuffer = 0;
    this.quadBuffer = 0;
    this.sphereBuffer = 0;
    this.sphereWireBuffer = 0;
    
}

//connectShader
//  Purpose: get vertex attribute entry points of a shader ("in" type variables)
//  Preconditions:
//     shaderProgram - the index number of a valid compiled shader program
//
//     positionAttribName - the name of the vertex position input as it appears
//                          in the shader's code. The input MUST be of type vec4
//                          If the name is "stub" it will be
//                          silently ignored.
//
//     normalAttribName - the name of the vertex normal input as it appears
//                        in the shader's code. The input MUST be of type vec4.
//                        If the name is "stub" it will be
//                        silently ignored.
//
//     colourAttribName - the name of the colour position input as it appears
//                        in the shader's code. The input MUST be of type vec4.
//                        If the name is "stub" it will be
//                        silently ignored.
//
// PostConditions:
//     the locations for the three attribute names will be retrieved and stored
//     in corresponding *AttribLoc index variable for use when drawing.
//     If any of the names were NULL pointers or were invalid names, the error
//     is silently ignored.
uofrGraphics.prototype.connectShader = function (shaderProgram, positionAttribName,
                                                 normalAttribName, colourAttribName)
{
    this.shaderProgram = shaderProgram;
    this.positionAttribLoc = this.normalAttribLoc = this.colourAttribLoc = -1;
    
    if (positionAttribName != "stub")
        this.positionAttribLoc = this.gl.getAttribLocation(shaderProgram, positionAttribName);
    if (normalAttribName != "stub")
        this.normalAttribLoc = this.gl.getAttribLocation(shaderProgram, normalAttribName);
    if (colourAttribName != "stub")
        this.colourAttribLoc = this.gl.getAttribLocation(shaderProgram, colourAttribName);
}


//setDrawColour
//  Purpose: set a colour with which to draw primitives
//  Preconditions:
//     The incoming colour should be a vec4
//     The value of each channel should be normalized, ie. lie between 0 and 1
//     with 0 being the darkest and 1 being the brightest.
//
// Postconditions:
//     Local variable colour, a vec 4, is set to the incoming colour.
//     It will be used as the constant colour for subsequent draw operations.
uofrGraphics.prototype.setDrawColour = function (colour)
{
    this.colour = colour;
}



//drawSolidSphere
//  Purpose: draw a sphere with solid filled polygons.
//           loosely based on code from freeglut project.
//
//  Preconditions:
//     radius: should be a positive value indicating the desired radius of the
//             sphere
//     slices: should be a positive value indicating how many "slices" you see
//             if you view the sphere from the top.
//     stacks: should be a positive value indicating how many layers there are
//             between the top and bottom of the sphere.
//
//  Postconditions:
//     the vertices for the sphere are drawn in GL_TRIANGLES mode with the
//     desired number of stacks and slices. The sphere has radius "radius" and
//     is centered at (0,0,0).
//     The vertices are stored in WebGL buffers that are managed by this function.
//     The sphere's buffers are connected to the shader program.
//     The shader program's colour is set to a constant value.
//
uofrGraphics.prototype.drawSolidSphere = function (radius, slices, stacks) {
    this.external_vao = gl.getParameter(gl.VERTEX_ARRAY_BINDING);
    gl.bindVertexArray(this.vao);

    //Generate a new sphere ONLY if necessary - not the same dimesions as last time
    if (this.sphereColor != this.colour || this.lastSphereSlices != slices || this.lastSphereStacks != stacks || this.lastSphereRadius != radius)
     {
       	this.sphereColor = this.colour; 
		 this.lastSphereSlices = slices;
        this.lastSphereStacks = stacks;
        this.lastSphereRadius = radius;
        var phiStep = 360.0 / slices;
        var rhoStep = 180.0 / stacks;
        
        //allocate new memory
        var vertsArray = [];
        var normsArray = [];
        var colsArray = [];
        
        var i = 0;
        //Calculate sin/cos slices for one stack
        var sliceVals = [];
        for (var s = 0; s <= slices; s++) {
            var t = 0;
            //Triangle:
            // v1 * (v3)
            //    |
            //    |
            // v2 *--* v4
            
            //v1
            sliceVals[s] = {sin: Math.sin(radians(phiStep * s)), cos: Math.cos(radians(phiStep * s))};
        }        

        var nextStack = {sin: 0, cos: 1};
        var thisStack;
        thisStack = nextStack;
        nextStack = {sin: Math.sin(radians(rhoStep * (t + 1))), cos: Math.cos(radians(rhoStep * (t + 1)))}
    
        //Top (Special because v2 and v3 are always both 0,0)
        for (var s = 0; s < slices; s++) {
            var t = 0;
            //Triangle:
            // v1 * (v3)
            //    |\
            //    | \
            // v2 *--* v4
            
            //v1
            normsArray.push(sliceVals[s].cos * thisStack.sin);
            normsArray.push(sliceVals[s].sin * thisStack.sin);
            normsArray.push(thisStack.cos);
            normsArray.push(0.0);
            
            //v2
            normsArray.push(sliceVals[s].cos * nextStack.sin);
            normsArray.push(sliceVals[s].sin * nextStack.sin);
            normsArray.push(nextStack.cos);
            normsArray.push(0.0);
            
            //v4
            normsArray.push(sliceVals[s+1].cos * nextStack.sin);
            normsArray.push(sliceVals[s+1].sin * nextStack.sin);
            normsArray.push(nextStack.cos);
            normsArray.push(0.0);
        }
        
        //Body of sphere
        for (var t = 1; t < stacks - 1; t++) {

            thisStack = nextStack;
            nextStack = {sin: Math.sin(radians(rhoStep * (t + 1))), cos: Math.cos(radians(rhoStep * (t + 1)))}

            for (var s = 0; s < slices; s++) {
                //Triangle 1:
                // v1 *  * v3
                //    |\
                //    | \
                // v2 *__* v4
                
                
                //v1
                normsArray.push(sliceVals[s].cos * thisStack.sin);
                normsArray.push(sliceVals[s].sin * thisStack.sin);
                normsArray.push(thisStack.cos);
                normsArray.push(0.0);
                
                //v2
                normsArray.push(sliceVals[s].cos * nextStack.sin);
                normsArray.push(sliceVals[s].sin * nextStack.sin);
                normsArray.push(nextStack.cos);
                normsArray.push(0.0);
                
                //v4
                normsArray.push(sliceVals[s+1].cos * nextStack.sin);
                normsArray.push(sliceVals[s+1].sin * nextStack.sin);
                normsArray.push(nextStack.cos);
                normsArray.push(0.0);
                
                
                //Triangle 2:
                // v1 *--* v3
                //     \ |
                //      \|
                // v2 *  * v4
                
                
                //v4
                normsArray.push(sliceVals[s+1].cos * nextStack.sin);
                normsArray.push(sliceVals[s+1].sin * nextStack.sin);
                normsArray.push(nextStack.cos);
                normsArray.push(0.0);
                
                
                //v3
                normsArray.push(sliceVals[s+1].cos * thisStack.sin);
                normsArray.push(sliceVals[s+1].sin * thisStack.sin);
                normsArray.push(thisStack.cos);
                normsArray.push(0.0);
                
                //v1
                normsArray.push(sliceVals[s].cos * thisStack.sin);
                normsArray.push(sliceVals[s].sin * thisStack.sin);
                normsArray.push(thisStack.cos);
                normsArray.push(0.0);
                
            }
        }
        
        
        //Bottom (Special because v2 and v4 are always both 180,180)
        thisStack = nextStack;
        nextStack = {sin: Math.sin(radians(rhoStep * (t + 1))), cos: Math.cos(radians(rhoStep * (t + 1)))}

        for (var s = 0; s < slices; s++) {
            var t = stacks - 1;
            //Triangle:
            // v1 *--* v3
            //    | /
            //    |/
            // v2 *  * v4

            
            //v1
            normsArray.push(sliceVals[s].cos * thisStack.sin);
            normsArray.push(sliceVals[s].sin * thisStack.sin);
            normsArray.push(thisStack.cos);
            normsArray.push(0.0);
            
            //v2
            normsArray.push(sliceVals[s].cos * nextStack.sin);
            normsArray.push(sliceVals[s].sin * nextStack.sin);
            normsArray.push(nextStack.cos);
            normsArray.push(0.0);
            
            //v3
            normsArray.push(sliceVals[s+1].cos * thisStack.sin);
            normsArray.push(sliceVals[s+1].sin * thisStack.sin);
            normsArray.push(thisStack.cos);
            normsArray.push(0.0);
        }
        for (var s = 0; s < normsArray.length; s++) {
            vertsArray[s] = normsArray[s] * radius;
            if (s % 4 == 3)
            {
                vertsArray[s] = 1.0;
                colsArray.push(this.colour);
            }
        }
        
        this.sphereVerts = vertsArray.length / 4;
        
        if (this.sphereBuffer != 0) {
            this.gl.deleteBuffer(this.sphereBuffer);
        }
        this.sphereBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sphereBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.sphereVerts * 4 * 4 * 3, this.gl.STATIC_DRAW);
        
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatten(vertsArray));
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, this.sphereVerts * 4 * 4, flatten(normsArray));
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, this.sphereVerts * 4 * 4 * 2, flatten(colsArray));
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sphereBuffer);
    //connect position and normal arrays to shader
    if (this.positionAttribLoc != -1) {
        this.gl.enableVertexAttribArray(this.positionAttribLoc);
        this.gl.vertexAttribPointer(this.positionAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, 0);
    }
    
    if (this.normalAttribLoc != -1) {
        this.gl.enableVertexAttribArray(this.normalAttribLoc);
        this.gl.vertexAttribPointer(this.normalAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, this.sphereVerts * 4 * 4 );
    }
    
    if (this.colourAttribLoc != -1) {
        //set a constant colour
        this.gl.enableVertexAttribArray(this.colourAttribLoc);
        this.gl.vertexAttribPointer(this.colourAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, this.sphereVerts * 4 * 4 * 2 );
    }
    
    this.gl.drawArrays(this.primitive, 0, this.sphereVerts);


    gl.bindVertexArray(this.external_vao);
}


//drawSolidCube
//  Purpose: draw a cube in filled polygon style.
//  Preconditions:
//     size: should be a positive value indicating the dimension of one edge of
//           the cube
//
//  Postconditions:
//     The vertices for the cube are drawn in GL_TRIANGLES mode.
//     The cube has sides that measure size units and it centered at (0,0,0).
//     Data for 36 vertices and normals is stored in OpenGL buffers.
//     The cube's buffers are connected to the shader program.
//     The vertex program's colour is set to a constant value.
uofrGraphics.prototype.drawSolidCube = function (size) {
    this.external_vao = gl.getParameter(gl.VERTEX_ARRAY_BINDING);
    gl.bindVertexArray(this.vao);

    //Generate a new cube ONLY if necessary - not the same dimesions as last time
    if (this.cubeColor != this.colour || this.lastCubeSize != size)
    {
		  this.cubeColor = this.colour;
        this.lastCubeSize = size;
        var vertsArray = [];
        var colsArray = [];
        for (var i = 0; i < 36; i++)
        {
            
            vertsArray.push(vec4(this.cubeFullVerts[i][0]*size,this.cubeFullVerts[i][1]*size,this.cubeFullVerts[i][2]*size,1.0));
            colsArray.push(this.colour);
        }
        
        if (this.cubeBuffer != 0)
        {
            this.gl.deleteBuffer(this.cubeBuffer);
        }
        this.cubeBuffer = this.gl.createBuffer();
        flatVerts = new Float32Array(flatten(vertsArray));
        flatNorms = new Float32Array(flatten(this.cubeNormsArray));
        flatCols = new Float32Array(flatten(colsArray));
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatVerts.byteLength + flatNorms.byteLength + flatCols.byteLength, this.gl.STATIC_DRAW);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatVerts);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, flatVerts.byteLength, flatNorms);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, flatVerts.byteLength+flatNorms.byteLength, flatCols);
    }
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeBuffer);
    
    //connect position and normal arrays to shader
    if (this.positionAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.positionAttribLoc);
        this.gl.vertexAttribPointer(this.positionAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, 0);
    }
    
    if (this.normalAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.normalAttribLoc);
        this.gl.vertexAttribPointer(this.normalAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, flatVerts.byteLength);
    }
    
    if (this.colourAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.colourAttribLoc);
        this.gl.vertexAttribPointer(this.colourAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, flatVerts.byteLength+flatNorms.byteLength);
    }
    
    this.gl.drawArrays(this.primitive, 0, 36);

    gl.bindVertexArray(this.external_vao);
}



//drawQuad
//  Purpose: draw a quadrilateral in filled polygon style.
//  Preconditions:
//     v1, v2, v3, v4: are vertices that are arranged in "counter clockwise"
//                     order. The quadrilateral is assumed to be flat.
//
//  Postconditions:
//     The vertices for the quadrilateral are drawn in GL_TRIANGLES mode.
//     One normal is calculated from three of the vertices.
//     Data for 6 vertices are stored in WebGL buffers.
//     The quad's vertex buffer is bound to the shader program
//     The vertex program's normal and colour entry points are
//     set to a constant value.
uofrGraphics.prototype.drawQuad = function (v1, v2, v3, v4)
{
    this.external_vao = gl.getParameter(gl.VERTEX_ARRAY_BINDING);
    gl.bindVertexArray(this.vao);
    
    //update quad's data every time. People rarely draw the same quad repeatedly
    //(Lab 1 is an exception... we draw and translate a square... lol!)
    
    if (this.quadBuffer == 0)
    {
        this.quadBuffer = this.gl.createBuffer();
    }
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadBuffer);
    var n = vec4(normalize(cross(subtract(v3, v2), subtract(v1, v2))),0);
    var c = this.colour;
    var v = [v4,v1,v3,v2,n,n,n,n,c,c,c,c];

    //Skip expensive flatten call
    for(var i = 0; i<v.length; i++) {
        for(var j=0; j<v[0].length; j++) {
            this.quadData[i*v[0].length+j] = v[i][j];
        }
    }
      this.gl.bufferData(this.gl.ARRAY_BUFFER, this.quadData, this.gl.STATIC_DRAW);
    
    //connect position and normal arrays to shader
    if (this.positionAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.positionAttribLoc);
        this.gl.vertexAttribPointer(this.positionAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, 0);
    }
    
    if (this.normalAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.normalAttribLoc);
        this.gl.vertexAttribPointer(this.normalAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, 4*4*4);
    }
    
    if (this.colourAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.colourAttribLoc);
        this.gl.vertexAttribPointer(this.colourAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, 4*4*4*2);
    }
    
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    gl.bindVertexArray(this.external_vao);

}

//drawWireSphere
//  Purpose: draw a sphere with wire polygons.
//           loosely based on code from freeglut project
//
//  Preconditions:
//     radius: should be a positive value indicating the desired radius of the
//             sphere
//     slices: should be a positive value indicating how many "slices" you see
//             if you view the sphere from the top.
//     stacks: should be a positive value indicating how many layers there are
//             between the top and bottom of the sphere.
//
//  Postconditions:
//     the vertices for the sphere are drawn in GL_LINES mode with the
//     desired number of stacks and slices. The sphere has radius "radius" and
//     is centered at (0,0,0).
//     The vertices are stored in WebGL buffers that are managed by this function.
//     The sphere's buffers are connected to the shader program.
//     The shader program's colour is set to a constant value.
//
uofrGraphics.prototype.drawWireSphere = function (radius, slices, stacks)
{
    this.external_vao = gl.getParameter(gl.VERTEX_ARRAY_BINDING);
    gl.bindVertexArray(this.vao);

    //Generate a new sphere ONLY if necessary - not the same dimesions as last time
   if (this.wireSphereColor != this.colour || this.lastWireSphereSlices != slices ||
        this.lastWireSphereStacks != stacks ||
        this.lastWireSphereRadius != radius)
    {
		  this.wireSphereColor = this.colour;
        this.lastWireSphereSlices = slices;
        this.lastWireSphereStacks = stacks;
        this.lastWireSphereRadius = radius;
        var phiStep = 360.0 / slices;
        var rhoStep = 180.0 / stacks;
        
        //allocate new memory
        var vertsArray = [];
        var normsArray = [];
        var colsArray = [];
        
        var i = 0;

        //Calculate sin/cos slices for one stack
        var sliceVals = [];
        for (var s = 0; s <=     slices; s++) {
            var t = 0;
            //Triangle:
            // v1 * (v3)
            //    |
            //    |
            // v2 *--* v4
            
            //v1
            sliceVals[s] = {sin: Math.sin(radians(phiStep * s)), cos: Math.cos(radians(phiStep * s))};
        }        

        //Top (Special because v1 and v3 are always both 0,0)
        //Missing side handled by neighboring triangle
        var nextStack = {sin: 0, cos: 1};
        var thisStack;
        thisStack = nextStack;
        nextStack = {sin: Math.sin(radians(rhoStep * (t + 1))), cos: Math.cos(radians(rhoStep * (t + 1)))}
    for (var s = 0; s < slices; s++) {
            var t = 0;
            //Triangle:
            // v1 * (v3)
            //    |
            //    |
            // v2 *--* v4
            

            //v1
            normsArray.push(sliceVals[s].sin * thisStack.sin);
            normsArray.push(sliceVals[s].cos * thisStack.sin);
            normsArray.push(thisStack.cos);
            normsArray.push(0.0);
            
            //v2
            normsArray.push(sliceVals[s].sin * nextStack.sin);
            normsArray.push(sliceVals[s].cos * nextStack.sin);
            normsArray.push(nextStack.cos);
            normsArray.push(0.0);
            
            //v2
            normsArray.push(sliceVals[s].sin * nextStack.sin);
            normsArray.push(sliceVals[s].cos * nextStack.sin);
            normsArray.push(nextStack.cos);
            normsArray.push(0.0);
            
            //v4
            normsArray.push(sliceVals[s+1].sin * nextStack.sin);
            normsArray.push(sliceVals[s+1].cos * nextStack.sin);
            normsArray.push(nextStack.cos);
            normsArray.push(0.0);
            
        }
        
        //Body of sphere
        for (var t = 1; t < stacks - 1; t++)
        {
            thisStack = nextStack;
            nextStack = {sin: Math.sin(radians(rhoStep * (t + 1))), cos: Math.cos(radians(rhoStep * (t + 1)))}

            for (var s = 0; s < slices; s++)
            {
                //Four lines to draw the two triangles - missing side handled by next pass through loop:
                //Almost LINE_STRIP ready...
                // v1 *--* v3
                //    |\
                //    | \
                // v2 *--* v4
                
                
                //v1
                normsArray.push(sliceVals[s].sin * thisStack.sin);
                normsArray.push(sliceVals[s].cos * thisStack.sin);
                normsArray.push(thisStack.cos);
                normsArray.push(0.0);
                    
                //v2
                normsArray.push(sliceVals[s].sin * nextStack.sin);
                normsArray.push(sliceVals[s].cos * nextStack.sin);
                normsArray.push(nextStack.cos);
                normsArray.push(0.0);
                    
                //v2
                normsArray.push(sliceVals[s].sin * nextStack.sin);
                normsArray.push(sliceVals[s].cos * nextStack.sin);
                normsArray.push(nextStack.cos);
                normsArray.push(0.0);
                    
                //v4
                normsArray.push(sliceVals[s+1].sin * nextStack.sin);
                normsArray.push(sliceVals[s+1].cos * nextStack.sin);
                normsArray.push(nextStack.cos);
                normsArray.push(0.0);
                    
                //v4
                normsArray.push(sliceVals[s+1].sin * nextStack.sin);
                normsArray.push(sliceVals[s+1].cos * nextStack.sin);
                normsArray.push(nextStack.cos);
                normsArray.push(0.0);
                    
                //v1
                normsArray.push(sliceVals[s].sin * thisStack.sin);
                normsArray.push(sliceVals[s].cos * thisStack.sin);
                normsArray.push(thisStack.cos);
                normsArray.push(0.0);
                
                //v1
                normsArray.push(sliceVals[s].sin * thisStack.sin);
                normsArray.push(sliceVals[s].cos * thisStack.sin);
                normsArray.push(thisStack.cos);
                normsArray.push(0.0);
                
                //v3
                normsArray.push(sliceVals[s+1].sin * thisStack.sin);
                normsArray.push(sliceVals[s+1].cos * thisStack.sin);
                normsArray.push(thisStack.cos);
                normsArray.push(0.0);
                
            }
        }
        
        
        //Bottom (Special because v2 and v4 are always both 180,180)
        thisStack = nextStack;
        nextStack = {sin: Math.sin(radians(rhoStep * (t + 1))), cos: Math.cos(radians(rhoStep * (t + 1)))}

        for (var s = 0; s < slices; s++)
        {
            var t = stacks - 1;
            //Triangle:
            // v1 *--* v3
            //    | /
            //    |/
            // v2 *  * v4
            
            //v1
            normsArray.push(sliceVals[s].sin * thisStack.sin);
            normsArray.push(sliceVals[s].cos * thisStack.sin);
            normsArray.push(thisStack.cos);
            normsArray.push(0.0);
            
            //v2
            normsArray.push(sliceVals[s].sin * nextStack.sin);
            normsArray.push(sliceVals[s].cos * nextStack.sin);
            normsArray.push(nextStack.cos);
            normsArray.push(0.0);
            
            //v2
            normsArray.push(sliceVals[s].sin * nextStack.sin);
            normsArray.push(sliceVals[s].cos * nextStack.sin);
            normsArray.push(nextStack.cos);
            normsArray.push(0.0);
            
            //v3
            normsArray.push(sliceVals[s+1].sin * thisStack.sin);
            normsArray.push(sliceVals[s+1].cos * thisStack.sin);
            normsArray.push(thisStack.cos);
            normsArray.push(0.0);
        }
        for (var s = 0; s < normsArray.length; s++)
        {
            vertsArray[s] = normsArray[s] * radius;
            if (s % 4 == 3)
            {
                vertsArray[s] = 1.0;
                colsArray.push(this.colour);
            }
        }
        
        this.wireSphereVerts = vertsArray.length / 4;
        
        if (this.sphereWireBuffer != 0)
        {
            this.gl.deleteBuffer(this.sphereWireBuffer);
        }
        this.sphereWireBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sphereWireBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.wireSphereVerts * 4 * 4 * 3, this.gl.STATIC_DRAW);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatten(vertsArray));
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, this.wireSphereVerts * 4 * 4, flatten(normsArray));
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, this.wireSphereVerts * 4 * 4 * 2, flatten(colsArray));

        
    }
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sphereWireBuffer);
    //connect position and normal arrays to shader
    if (this.positionAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.positionAttribLoc);
        this.gl.vertexAttribPointer(this.positionAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, 0);
    }
    
    if (this.normalAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.normalAttribLoc);
        this.gl.vertexAttribPointer(this.normalAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, this.wireSphereVerts * 4 * 4);
    }
    
    if (this.colourAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.colourAttribLoc);
        this.gl.vertexAttribPointer(this.colourAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, this.wireSphereVerts * 4 * 4 * 2);
    }
    
    this.gl.drawArrays(this.gl.LINE_LOOP, 0, this.wireSphereVerts);
    gl.bindVertexArray(this.external_vao);
}





//drawWireCube
//  Purpose: draw a cube in filled polygon style.
//  Preconditions:
//     size: should be a positive value indicating the dimension of one edge of
//           the cube
//
//  Postconditions:
//     The vertices for the cube are drawn in GL_LINES mode.
//     The cube has sides that measure size units and is centered at (0,0,0).
//     Data for 30 vertices and normals is stored in OpenGL buffers.
//     The cube's buffers are connected to the shader program.
//     The vertex program's colour is set to a constant value.
uofrGraphics.prototype.drawWireCube = function (size)
{
    this.external_vao = gl.getParameter(gl.VERTEX_ARRAY_BINDING);
    gl.bindVertexArray(this.vao);

    //Generate a new cube ONLY if necessary - not the same dimesions as last time
    if (this.wireCubeColor != this.colour || this.lastWireCubeSize != size)
    {
   	this.wireCubeColor = this.colour; 
		 this.lastWireCubeSize = size;
        var vertsArray = [];
        var colsArray = [];
        for (var i = 0; i < 36; i++)
        {
            
            vertsArray.push(vec4(this.wireCubeFullVerts[i][0] * size, this.wireCubeFullVerts[i][1] * size, this.wireCubeFullVerts[i][2] * size, 1.0));
            colsArray.push(this.colour);
        }
        
        if (this.cubeWireBuffer != 0)
        {
            this.gl.deleteBuffer(this.cubeWireBuffer);
        }
        this.cubeWireBuffer = this.gl.createBuffer();
        flatVerts = new Float32Array(flatten(vertsArray));
        flatNorms = new Float32Array(flatten(this.wireCubeNormsArray));
        flatCols = new Float32Array(flatten(colsArray));
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeWireBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatVerts.byteLength + flatNorms.byteLength + flatCols.byteLength, this.gl.STATIC_DRAW);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatVerts);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, flatVerts.byteLength , flatNorms);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, flatVerts.byteLength + flatNorms.byteLength, flatCols);
    }
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeWireBuffer);
    
    //connect position and normal arrays to shader
    if (this.positionAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.positionAttribLoc);
        this.gl.vertexAttribPointer(this.positionAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, 0);
    }
    
    if (this.normalAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.normalAttribLoc);
        this.gl.vertexAttribPointer(this.normalAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, 36 * 4 * 4);
    }
    
    if (this.colourAttribLoc != -1)
    {
        this.gl.enableVertexAttribArray(this.colourAttribLoc);
        this.gl.vertexAttribPointer(this.colourAttribLoc, 4, this.gl.FLOAT, this.gl.FALSE, 0, 36 * 4 * 4 * 2);
    }
    
    this.gl.drawArrays(this.gl.LINE_LOOP, 0, 36);

    gl.bindVertexArray(this.external_vao);

}

// TODO: finish porting these functions
//    void drawSolidTorus( GLfloat innerRadius, GLfloat outerRadius, GLint nSides, GLint nRings);
//    void drawWireTorus( GLfloat innerRadius, GLfloat outerRadius, GLint nSides, GLint nRings);


// flatten4x4
//  Purpose: quickly flatten a 4x4 matrix
//  Preconditions:
//      m should be a 4x4 matrix. No type checking is performed.
//  Postconditions:
//      global variable matFloats is loaded with the flattened matrix
//      a copy of matFloats is returned - do not save a reference to the return
var matFloats = new Float32Array(4*4);
function flatten4x4(m)
{
  for(var i = 0; i < 4; i++)
  {
    for (var j = 0; j < 4; j++)
    {
      matFloats[i*4+j] = m[i][j];
    }
  }
  return matFloats;
}
