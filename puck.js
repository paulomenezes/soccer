function Puck () {
    this.velocity = Vec2D.ObjectVector(0, 0);
    this.owner = null;

    this.initialPosition = Vec2D.ObjectVector((width / 2) - this.radius / 2, (height / 2) - this.radius / 2); 

    this.radius = 5;
    this.position = Vec2D.ObjectVector((width / 2) - this.radius / 2, (height / 2) - this.radius / 2);

    this.setOwner = function (athlete) {
        if (this.owner != athlete) {
            this.owner = athlete;
            this.velocity = null;
        }
    }

    this.update = function (mouse) {
        if (this.owner) {
            this.placeAheadOfOwner();
        } else {
            this.position = this.position.add(this.velocity);
        }

        if (this.velocity) {
            if (this.position.getX() <= 0 || this.position.getX() >= width) {
                //this.position = this.initialPosition.clone();
                //this.velocity.setX(this.velocity.getX() * -0.9);
            } else if (this.position.getY() <= 0 || this.position.getY() >= height) {
                //this.position = this.initialPosition.clone();
                //this.velocity.setY(this.velocity.getY() * -0.9);
            }
        }
    }

    this.placeAheadOfOwner = function () {
        var ahead = this.owner.boid.velocity.clone();

        ahead = ahead.normalize().mulS(20);

        this.position = this.owner.boid.position.clone().add(ahead);
    }

    this.goFromStickHit = function (destination, speed) {
        if (this.owner) {
            this.placeAheadOfOwner();
            this.setOwner(null);

            var new_velocity = destination.subtract(this.position);
            this.velocity = new_velocity.normalize().mulS(speed);
        }
    }

    this.draw = function (context) {
        context.beginPath();
        context.arc(this.position.getX(), this.position.getY(), this.radius, 0, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle = '#0F0';
        context.fill();
    }
}