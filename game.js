"use strict";

// Shader code

const vertexShaderSource = `
attribute vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

const fragmentShaderSource = `
precision mediump float;

void main() {
  gl_FragColor = vec4(1,0,0,1); 
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function main() {

    // === Initialisation ===

    // get the canvas element & gl rendering 
    const canvas = document.getElementById("c");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }
    
    // create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program =  createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
	
	const positions = [
        0, 0, 
		1, 0, 
		0, 1,
        0, 0,
		0, 1,
		-1, 0,
    ];
	
    // Initialise the array buffer to contain the points of the triangle
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Set up the position attribute
    // Note: This has to happen /after/ the array buffer is bound
    const positionAttribute = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    const rotationUniform = gl.getUniformLocation(program, "u_rotation");

    // === Per Frame operations ===
	
	let currentAngle = 0;
	
    let update = function(deltaTime) {
		currentAngle += deltaTime;
		console.log(currentAngle);
    };
	
    let render = function() {
        // clear the screen
        gl.viewport(0, 0, canvas.width, canvas.height);        
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // draw a triangle
        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    };

    render();
	
	let pSeconds = 0;
	let animate = function(milliseconds) {
		window.requestAnimationFrame(animate);
		
		console.assert(milliseconds >= 0); //possibly unnecessary
		
		const seconds = milliseconds / 1000;
		const deltaTime = seconds - pSeconds;
		
		update(deltaTime);
		seconds = pSeconds;
		
		update();
		render();
		requestAnimationFrame(animate);
	}
	
	animate(0);
}    

