'use strict';

let t_max = 1;
let alpha_max = 720;
let count_vertical = 0;
let count_horisontal = 0;
let count_vertical_steps = 0;
let count_horisontal_steps = 0;

let r = 0.25;
let c = 1;
let d = 0.5;

let x_max = 1;
let x_min = -1;
let y_max = 1;
let y_min = -1;
let y_steps = 30;
let x_steps = 30;
let { PI, tan } = Math

let gamma_zero = deg2rad(60);

let conv = 50, eyes = 1, fov = 45, near = 1;

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let spaceball;                  // A SimpleRotator object that lets the user rotate the view by mouse.
let cam;
let webcam, webcamTexture, webcamModel;

function deg2rad(angle) {
  return angle * Math.PI / 180;
}

// Constructor
function Model(name) {
  this.name = name;
  this.iVertexBuffer = gl.createBuffer();
  this.iVertexTextureBuffer = gl.createBuffer();
  this.count = 0;

  this.BufferData = function(vertices) {

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

    this.count = vertices.length / 3;
  }
  this.TextureBufferData = function(vertices) {

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

  }
  this.Draw = function() {

    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shProgram.iAttribVertex);

    gl.drawArrays(gl.TRIANGLES, 0, this.count);
  }
  this.DrawLines = function() {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shProgram.iAttribVertex);

    let n = this.count / count_horisontal_steps
    for (let i = 0; i < count_horisontal_steps; i++) {
      gl.drawArrays(gl.LINE_STRIP, n * i, n);
    }
  }
  this.DrawTextured = function() {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
    gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shProgram.iAttribVertex);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexTextureBuffer);
    gl.vertexAttribPointer(shProgram.iAttribVertexTexture, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shProgram.iAttribVertexTexture);

    gl.drawArrays(gl.TRIANGLES, 0, this.count);
  }
}


// Constructor
function ShaderProgram(name, program) {

  this.name = name;
  this.prog = program;

  // Location of the attribute variable in the shader program.
  this.iAttribVertex = -1;
  // Location of the uniform specifying a color for the primitive.
  this.iColor = -1;
  // Location of the uniform matrix representing the combined transformation.
  this.iModelViewProjectionMatrix = -1;

  this.Use = function() {
    gl.useProgram(this.prog);
  }
}


/* Draws a colored cube, along with a set of coordinate axes.
 * (Note that the use of the above drawPrimitive function is not an efficient
 * way to draw with WebGL.  Here, the geometry is so simple that it doesn't matter.)
 */


function draw(animate = false) {
  gyroToMat()




  let message = document.getElementById('message')
  message.innerText = deltaRotationMatrix
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /* Set the values of the projection transformation */
  let projection = m4.perspective(Math.PI / 8, 1, 8, 12);

  /* Get the view matrix from the SimpleRotator object.*/
  let modelView = spaceball.getViewMatrix();

  let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
  let translateToPointZero = m4.translation(0, 0, -5);

  let matAccum0 = m4.multiply(rotateToPointZero, modelView);
  let matAccum1 = m4.multiply(translateToPointZero, matAccum0);
  gl.uniform1f(shProgram.iT, true);
  gl.bindTexture(gl.TEXTURE_2D, webcamTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    webcam
  );
  gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, m4.identity());
  webcamModel.DrawTextured()
  gl.clear(gl.DEPTH_BUFFER_BIT)
  gl.uniform1f(shProgram.iT, false);

  /* Multiply the projection matrix times the modelview matrix to give the
     combined transformation matrix, and send that to the shader program. */
  // let matAccX = m4.axisRotation([0.0, 1.0, 0.0], -Math.PI / 2.0 * sensor.x / 10.0);
  // let matAccY = m4.axisRotation([1.0, 0.0, 0.0], Math.PI / 2.0 * sensor.y / 10.0);
  let modelViewProjection = m4.multiply(projection, matAccum1);
  cam.ApplyLeftFrustum()
  // gyroToMat()
  if (started) {
    modelViewProjection = m4.multiply(cam.projection, m4.multiply(cam.modelView, m4.multiply(matAccum1, deltaRotationMatrix)));
  }
  // modelViewProjection = m4.multiply(cam.projection, m4.multiply(cam.modelView, matAccum1));
  // modelViewProjection = m4.multiply(cam.projection, m4.multiply(cam.modelView, m4.multiply(matAccum1, m4.multiply(matAccX, matAccY))));
  gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);
  gl.colorMask(true, false, false, false);
  gl.uniform4fv(shProgram.iColor, [1, 1, 0, 1]);
  surface.DrawTextured();
  gl.uniform4fv(shProgram.iColor, [0, 0, 1, 1]);
  surface.DrawLines();

  gl.clear(gl.DEPTH_BUFFER_BIT)

  cam.ApplyRightFrustum()
  // modelViewProjection = m4.multiply(cam.projection, m4.multiply(cam.modelView, m4.multiply(matAccum1, m4.multiply(matAccX, matAccY))));
  // modelViewProjection = m4.multiply(cam.projection, m4.multiply(cam.modelView, m4.multiply(matAccum1, deltaRotationMatrix)));
  gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);
  gl.colorMask(false, true, true, false);
  gl.uniform4fv(shProgram.iColor, [1, 1, 0, 1]);
  surface.DrawTextured();
  gl.uniform4fv(shProgram.iColor, [0, 0, 1, 1]);
  surface.DrawLines();

  gl.colorMask(true, true, true, true);
  if (animate) {
    window.requestAnimationFrame(() => draw(true));
  }
}

function CreateSurfaceData(x_max, x_min, y_max, y_min, x_steps, y_steps) {
  count_vertical = 0;
  count_horisontal = 0;


  let vertexList = [];

  let shoe = function(a, b) {
    return (a * a * a) / 3 - (b * b) / 2;
  }

  for (let j = x_min; j < x_max + (x_max - x_min) / x_steps; j += (x_max - x_min) / x_steps) {
    count_horisontal_steps = 0;
    for (let i = y_min; i < y_max + (y_max - y_min) / y_steps; i += (y_max - y_min) / y_steps) {
      vertexList.push(i
        , j
        , shoe(i, j)
      );
      vertexList.push(i + (y_max - y_min) / y_steps
        , j
        , shoe(i + (y_max - y_min) / y_steps, j)
      );
      vertexList.push(i
        , j + (x_max - x_min) / x_steps
        , shoe(i, j + (x_max - x_min) / x_steps)
      );
      vertexList.push(i
        , j + (x_max - x_min) / x_steps
        , shoe(i, j + (x_max - x_min) / x_steps)
      );
      vertexList.push(i + (y_max - y_min) / y_steps
        , j
        , shoe(i + (y_max - y_min) / y_steps, j)
      );
      vertexList.push(i + (y_max - y_min) / y_steps
        , j + (x_max - x_min) / x_steps
        , shoe(i + (y_max - y_min) / y_steps, j + (x_max - x_min) / x_steps)
      );
      count_horisontal_steps++;
      count_horisontal++;
    }
    // console.log(vertexList.length / 3)
  }
  // console.log(count_horisontal_steps)
  return vertexList;
}

/* Initialize the WebGL context. Called from init() */
function initGL() {
  let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  shProgram = new ShaderProgram('Basic', prog);
  shProgram.Use();

  shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
  shProgram.iAttribVertexTexture = gl.getAttribLocation(prog, "textureCoord");
  shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
  shProgram.iColor = gl.getUniformLocation(prog, "color");
  shProgram.iT = gl.getUniformLocation(prog, "textured");

  surface = new Model('Surface');
  surface.BufferData(CreateSurfaceData(x_max, x_min, y_max, y_min, x_steps, y_steps),);
  surface.TextureBufferData(CreateSurfaceData(x_max, x_min, y_max, y_min, x_steps, y_steps),);
  webcamModel = new Model('Webcam');
  webcamModel.BufferData([-1, -1, 0, 1, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0])
  webcamModel.TextureBufferData([1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0])
  gl.enable(gl.DEPTH_TEST);
}


/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type Error is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 * The second and third parameters are strings that contain the
 * source code for the vertex shader and for the fragment shader.
 */
function createProgram(gl, vShader, fShader) {
  let vsh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsh, vShader);
  gl.compileShader(vsh);
  if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
    throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
  }
  let fsh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fsh, fShader);
  gl.compileShader(fsh);
  if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
    throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
  }
  let prog = gl.createProgram();
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
  }
  return prog;
}


/**
 * initialization function that will be called when the page has loaded
 */
function init() {
  // readAccelerometer()
  // readGyroscope()
  webcam = webCam();
  let canvas;
  document.getElementById('conv').addEventListener("change", () => {
    conv = parseFloat(document.getElementById('conv').value)
    cam.mConvergence = conv
    draw()
  })
  document.getElementById('eyes').addEventListener("change", () => {
    eyes = parseFloat(document.getElementById('eyes').value)
    cam.mEyeSeparation = eyes
    draw()
  })
  document.getElementById('fov').addEventListener("change", () => {
    fov = deg2rad(parseFloat(document.getElementById('fov').value))
    cam.mFOV = fov
    draw()
  })
  document.getElementById('near').addEventListener("change", () => {
    near = parseFloat(document.getElementById('near').value)
    cam.mNearClippingDistance = near
    draw()
  })
  try {
    canvas = document.getElementById("webglcanvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
      throw "Browser does not support WebGL";
    }
  }
  catch (e) {
    document.getElementById("canvas-holder").innerHTML =
      "<p>Sorry, could not get a WebGL graphics context.</p>";
    return;
  }
  try {
    // Set up the stereo camera system
    cam = new StereoCamera(
      conv,     // Convergence
      eyes,       // Eye Separation
      1,     // Aspect Ratio
      fov,       // FOV along Y in degrees
      near,       // Near Clipping Distance
      20.0);   // Far Clipping Distance
    initGL();  // initialize the WebGL graphics context
  }
  catch (e) {
    document.getElementById("canvas-holder").innerHTML =
      "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
    return;
  }
  webcamTexture = webCamTexture()
  spaceball = new TrackballRotator(canvas, draw, 0);
  
  if (window.DeviceOrientationEvent) {
    window.addEventListener(
      "deviceorientation",
      (event) => {
        const rotateDegrees = event.alpha; // alpha: rotation around z-axis
        const leftToRight = event.gamma; // gamma: left to right
        const frontToBack = event.beta; // beta: front back motion
        handleOrientationEvent(frontToBack, leftToRight, rotateDegrees);
        console.log('deviceorientation')
      },
      true,
    );
    // console.log('if')
    document.getElementById('message').innerText = "if"
  } else {
    // console.log('else')

  }

  const handleOrientationEvent = (frontToBack, leftToRight, rotateDegrees) => {
    console.log('handleOrientationEvent')
    document.getElementById('message').innerText = `${frontToBack}, ${leftToRight}, ${rotateDegrees}`
  };
}
