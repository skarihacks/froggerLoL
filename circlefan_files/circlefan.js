/////////////////////////////////////////////////////////////////
//    Paddle + Cars (Frogger-style)
//
//    Hjálmtýr Hafsteinsson, september 2025
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var car1 = { pos: vec2(-0.8, -0.6), speed: 0.02, color: vec3(1.0, 0.0, 0.0) };
var car2 = { pos: vec2(-0.8, -0.3), speed: 0.01, color: vec3(0.0, 0.5, 0.5) }; 
var car3 = { pos: vec2(-0.8,  0.0), speed: 0.005, color: vec3(0.0, 0.0, 1.0) }; 
var car4 = { pos: vec2(-0.8,  0.3), speed: 0.008, color: vec3(1.0, 1.0, 0.0) }; 
var car5 = { pos: vec2(-0.7,  0.6), speed: 0.010, color: vec3(1.0, 0.0, 1.0) }; 
var car6 = { pos: vec2(0.0,  0.6), speed: 0.010, color: vec3(1.0, 0.5, 0.0) }; 
var car7 = { pos: vec2(0.2,  0.0), speed: 0.005, color: vec3(0.2, 0.5, 0.2) }; 
var car8 = { pos: vec2(0.7,  0.6), speed: 0.010, color: vec3(1.0, 0.5, 0.0) }; 
var car9 = { pos: vec2(-0.0, -0.3), speed: 0.01, color: vec3(0.0, 0.5, 0.5) }; 




var cars = [car1, car2, car3, car4, car5, car6, car7, car8, car9];

var maxX = 1.0;
var boxRad = 0.05;

var paddleVertices = [ 
    vec2(-0.05, -0.95),
    vec2( 0, -0.85),
    vec2( 0.05, -0.95)
];

var bufferId, vPosition, uColor;


const MAX_VERTICES = 4;
const VERTEX_SIZE = 8; 
var paddleCenter = vec2(0.0, -0.9);
var facing = "up"; 
var score = 0;
var targetSide = "top";     
var gameOver = false;  // top-level  

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    uColor = gl.getUniformLocation(program, "uColor");

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_VERTICES * VERTEX_SIZE, gl.DYNAMIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

window.addEventListener("keydown", function(e) {
    var movedX = false; 
    var movedY = false; 
    var moveX = 0.0; 
    var moveY = 0.0; 
    let minX = 1.0, maxX = -1.0;
        let minY = 1.0, maxY = -1.0;
        const PADDLE_WIDTH = 0.1;
    const PADDLE_HALF_WIDTH = PADDLE_WIDTH / 2;

        for (let i = 0; i < paddleVertices.length; i++) {
            minX = Math.min(minX, paddleVertices[i][0]);
            maxX = Math.max(maxX, paddleVertices[i][0]);
            minY = Math.min(minY, paddleVertices[i][1]);
            maxY = Math.max(maxY, paddleVertices[i][1]);
        }


    switch (e.keyCode) {
        case 37: 
            moveX = -0.1;
            movedX = true;
            facing = "left";
            break;
        case 39: 
            moveX = 0.1;
            movedX = true;
            facing = "right";
            break;
        case 38: 
            moveY = 0.3; 
            movedY = true;
            facing = "up";
            break;
        case 40: 
            moveY = -0.3; 
            movedY = true;
            facing = "down";
            break;
    }
    if (movedX) {
        if (minX + moveX < -1.0 + PADDLE_HALF_WIDTH || maxX + moveX > 1.0 - PADDLE_HALF_WIDTH) {
      
        } else {
            paddleCenter[0] += moveX;
        }
    }

    if (movedY) {
        if (minY + moveY < -1.0 || maxY + moveY > 1.0) {
        } else {
            paddleCenter[1] += moveY;        }
    }
    


    paddleVertices = makePaddle(paddleCenter[0], paddleCenter[1], facing);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(paddleVertices));

        });

        render();
    };

function drawCar(car) {
    var c = car.pos;
    var verts = [
        vec2(c[0]-0.1, c[1]-0.05),
        vec2(c[0]-0.1, c[1]+0.05),
        vec2(c[0]+0.1, c[1]+0.05),
        vec2(c[0]+0.1, c[1]-0.05)
    ];
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(verts));
    gl.uniform3fv(uColor, car.color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); 
}

function render() {
    if (gameOver) return;

    gl.clear(gl.COLOR_BUFFER_BIT);
    drawRect(-1.0, -0.75, 1.0, 0.75, [0.1, 0.1, 0.1]);
    drawDashedLine(-0.45, 0.1, 0.1, [1.0, 1.0, 1.0]);
    drawDashedLine(-0.15, 0.1, 0.1, [1.0, 1.0, 1.0]);
    drawDashedLine( 0.15, 0.1, 0.1, [1.0, 1.0, 1.0]);
    drawDashedLine( 0.45, 0.1, 0.1, [1.0, 1.0, 1.0]);






    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(paddleVertices));
    gl.uniform3fv(uColor, [0, 1, 0]);
    gl.drawArrays(gl.TRIANGLES, 0, paddleVertices.length); 



    cars.forEach(car => {
        car.pos[0] += car.speed;
        if (car.pos[0] > maxX + boxRad) {
            car.pos[0] = -maxX - boxRad;
        }
        drawCar(car);
    });
    let frog = getFrogBounds();

for (let car of cars) {
    let c = getCarBounds(car);
    if (isColliding(frog.minX, frog.minY, frog.maxX, frog.maxY,
                    c.minX, c.minY, c.maxX, c.maxY)) {
        console.log("COLLISION!");
        score = 0;
        targetSide = "top";
        facing = "up";
        paddleCenter = vec2(0.0, -0.9);
        paddleVertices = makePaddle(paddleCenter[0], paddleCenter[1], facing);
    }
}
    const TOP_GOAL_Y = 0.8; 
    const BOTTOM_GOAL_Y = -0.8; 

    if (paddleCenter[1] >= TOP_GOAL_Y && targetSide === "top") {
        score++;
        targetSide = "bottom"; 
        console.log("Score:", score); 
    } else if (paddleCenter[1] <= BOTTOM_GOAL_Y && targetSide === "bottom") {
        score++;
        targetSide = "top"; 
        console.log("Score:", score); 
    }


    drawScore();



    if (score >= 10) {
        gameOver = true;
        alert("YOU WIN!");
    }
    window.requestAnimFrame(render);
    
    
}
function makePaddle(centerX, centerY, facing) {
    const w = 0.05; 
    const h = 0.1;  
    switch (facing) {
        case "up":
            return [
                vec2(centerX - w, centerY - h/2),
                vec2(centerX,     centerY + h/2),
                vec2(centerX + w, centerY - h/2)
            ];
        case "down":
            return [
                vec2(centerX - w, centerY + h/2),
                vec2(centerX,     centerY - h/2),
                vec2(centerX + w, centerY + h/2)
            ];
        case "left":
            return [
                vec2(centerX + h/2, centerY - w),
                vec2(centerX - h/2, centerY),
                vec2(centerX + h/2, centerY + w)
            ];
        case "right":
            return [
                vec2(centerX - h/2, centerY - w),
                vec2(centerX + h/2, centerY),
                vec2(centerX - h/2, centerY + w)
            ];
    }
}
function drawRect(x1, y1, x2, y2, color) {
    var verts = [
        vec2(x1, y1),
        vec2(x1, y2),
        vec2(x2, y2),
        vec2(x2, y1)
    ];
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(verts));
    gl.uniform3fv(uColor, color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function drawDashedLine(y, dashLength, gapLength, color) {
    let x = -1.0;
    while (x < 1.0) {
        let x2 = x + dashLength;
        drawRect(x, y - 0.01, x2, y + 0.01, color); 
        x += dashLength + gapLength;
    }
}
function isColliding(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    return (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1);
}
function getFrogBounds() {
    let minX = 1.0, maxX = -1.0, minY = 1.0, maxY = -1.0;
    for (let i = 0; i < paddleVertices.length; i++) {
        minX = Math.min(minX, paddleVertices[i][0]);
        maxX = Math.max(maxX, paddleVertices[i][0]);
        minY = Math.min(minY, paddleVertices[i][1]);
        maxY = Math.max(maxY, paddleVertices[i][1]);
    }
    return { minX, maxX, minY, maxY };
}

function getCarBounds(car) {
    return {
        minX: car.pos[0] - 0.1,
        maxX: car.pos[0] + 0.1,
        minY: car.pos[1] - 0.05,
        maxY: car.pos[1] + 0.05
    };
}
function drawScore() {
    for (let i = 0; i < score; i++) {
        let x1 = 0.8 + i * 0.02;  
        let x2 = x1 + 0.01;
        let y1 = 0.80, y2 = 0.95;    
        drawRect(x1, y1, x2, y2, [1.0, 1.0, 1.0]);
    }
}

