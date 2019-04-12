"use strict";

// Shader code

const vertexShaderSource = `
attribute vec4 a_position;
uniform float u_rotation; //radians
uniform vec2 u_translation; 
uniform vec2 u_scale;
uniform float u_aspect;

void main() {
	//scale
	float x0 = a_position.x * u_scale.x;
	float y0 = a_position.y * u_scale.y;
	
	//rotate
	float x = x0 * cos(u_rotation) - y0 * sin(u_rotation);
	float y = x0 * sin(u_rotation) + y0 * cos(u_rotation);
	
	//translate
	x = (x + u_translation.x) / u_aspect;
	y = y + u_translation.y;
	
	gl_Position = vec4(x,y,0,1);
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
	
	let downKeyPressed = false;
	
	document.addEventListener("keydown", function(event) {
		switch (event.key) {
			case "ArrowDown":
				downKeyPressed = true;
				break;
		}
	});
	
	document.addEventListener("keyup", function(event) {
		switch (event.key) {
			case "ArrowDown":
				downKeyPressed = false;
				break;
		}
	});
	
	
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
	
	const translationUniform = gl.getUniformLocation(program, "u_translation");
	
	const scaleUniform = gl.getUniformLocation(program, "u_scale");
	const aspectUniform = gl.getUniformLocation(program, "u_aspect");

    // === Per Frame operations ===
	
	let angle = 0;
	const turnSpeed = 1;
	let dx = 0;
	let dy = 0;
	const speed = 0.5;
	
    let update = function(deltaTime) {
		angle += turnSpeed * deltaTime;
		if (downKeyPressed) {
			dy -= speed * deltaTime;
		}
    };

	let resizeCanvas = function() {
		const resolution = window.devicePixelRatio || 1.0;
		const displayWidth = Math.floor(canvas.clientWidth * resolution);
		const displayHeight = Math.floor(canvas.clientHeight * resolution);
		
		if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
			return true;
		} else {
			return false;
		}
	}
		
    let render = function() {
        // clear the screen
        gl.viewport(0, 0, canvas.width, canvas.height);        
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
		
		gl.uniform1f(rotationUniform, angle);
		
		gl.uniform2f(translationUniform, dx, dy);
		
		const aspect = canvas.width / canvas.height;
		
		//console.log(canvas.width);
		//console.log(canvas.height);
		//console.log(sx);
		//console.log(sy);
		
		gl.uniform2f(scaleUniform, 1.0, 1.0);
		gl.uniform1f(aspectUniform, aspect);
		
        // draw a triangle
        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    };

    render();
	
	let pSeconds = 0;
	let animate = function(milliseconds) {
				
		console.assert(milliseconds >= 0);
		//console.log(pSeconds);
		const seconds = milliseconds / 1000;
		const deltaTime = seconds - pSeconds;
		pSeconds = seconds;
		
		resizeCanvas();
		update(deltaTime);
		render();
		window.requestAnimationFrame(animate);
	}
	
	animate(0);
}    

