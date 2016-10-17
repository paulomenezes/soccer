var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var puck;

var mouseX;
var mouseY;
var mouse = false;

function start () {
    puck = new Puck();

	athletes.push(new Athlete('red', 100, height / 3));
	athletes.push(new Athlete('red', 100, (height / 3) * 2));
	athletes.push(new Athlete('red', 200, height / 3));
	athletes.push(new Athlete('red', 200, (height / 3) * 2));
	athletes.push(new Athlete('red', 300, height / 2));

	athletes.push(new Athlete('blue', 700, height / 3));
	athletes.push(new Athlete('blue', 700, (height / 3) * 2));
	athletes.push(new Athlete('blue', 600, height / 3));
	athletes.push(new Athlete('blue', 600, (height / 3) * 2));
	athletes.push(new Athlete('blue', 450, height / 2));

    document.onmousemove = function(e) {
        mouse = true;

        mouseX = e.pageX;
        mouseY = e.pageY;
    }

    document.onmousedown = function(e) {
        puck.goFromStickHit(Vec2D.ObjectVector(e.pageX, e.pageY), 5);
    }
}

function update () {
    if (mouse) {
        athletes.forEach(function(athlete) {
            athlete.update(Vec2D.ObjectVector(mouseX, mouseY), puck);
        }, this);
    }

    athletes.forEach(function(athlete) {
        if (athlete.boid.position.distance(puck.position) <= athlete.boid.radius + puck.radius) {
            puck.setOwner(athlete);
        }
    }, this);

    puck.update();
}

function draw () {
    context.clearRect(0, 0, width, height);

    drawField();
    
    athletes.forEach(function(athlete) {
	    athlete.draw(context);
    }, this);

    puck.draw(context);
}

function drawField() {
    context.strokeStyle = 'black';

    context.beginPath();
    context.moveTo(width / 2, 0);
    context.lineTo(width / 2, height);
    context.stroke();
    context.closePath();

    context.beginPath();
    context.arc(width / 2, height / 2, 100, 0, 2 * Math.PI, false);
    context.stroke();
    context.closePath();
}

start();

setInterval(function () {
	update();
	draw();
}, 10);