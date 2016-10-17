function Athlete (team, x, y) {
    this.initialPosition = Vec2D.ObjectVector(x, y);

    this.team = team;
    this.boid = new Boid(width / 2, 0);
    this.brain = new StackFSM();

    this.puck = null;

    this.standStill = false;

    this.brain.pushState(this.prepareForMatch.bind(this));

    this.update = function (mouse, puck) {
        this.boid.update();
        this.brain.update();

        this.puck = puck;
    }

    this.draw = function (context) {
        context.strokeStyle = this.team;

        context.beginPath();
        context.arc(this.boid.position.getX(), this.boid.position.getY(), this.boid.radius, 0, 2 * Math.PI, false);
        context.closePath();
        context.stroke();

        context.beginPath();
        context.moveTo(this.boid.position.getX(), this.boid.position.getY());
        context.lineTo(this.boid.position.getX() + this.boid.velocity.length() * this.boid.velocity.getX() * this.boid.radius, 
                       this.boid.position.getY() + this.boid.velocity.length() * this.boid.velocity.getY() * this.boid.radius);
        context.closePath();
        context.stroke();

        if (this.boid.last_target) {
            context.beginPath();
            context.arc(this.boid.last_target.getX(), this.boid.last_target.getY(), 2, 0, 2 * Math.PI, false);
            context.closePath();
            context.fill();
        }

        context.fillStyle = 'black';
        context.font = '10px Arial';
        context.fillText(this.brain.getCurrentState().name.substr(6), this.boid.position.getX(), this.boid.position.getY() - 10);
    }
}

Athlete.prototype.idle = function idle () {
    if (this.puck) {
        this.stopAndLookAt(this.puck.position.clone());

        if (this.standStill) return;

        if (this.puck.owner) {
            this.brain.popState();

            if (this.myTeamHaveThePuck()) {
                this.brain.pushState(this.attack.bind(this));
            } else {
                this.brain.pushState(this.stealPuck.bind(this));
            }
        } else if (this.boid.position.distance(this.puck.position) < 150) {
            this.brain.popState();
            this.brain.pushState(this.pursuePuck.bind(this));
        }
    }
}

Athlete.prototype.stopAndLookAt = function (point) {
    this.boid.velocity = point.subtract(this.boid.position);
    this.boid.velocity = this.boid.velocity.normalize().mulS(0.01);
}

Athlete.prototype.prepareForMatch = function prepareForMatch () {
    this.boid.arrive(this.initialPosition.clone());
    
    if (this.boid.position.distance(this.initialPosition) <= 5) {
        this.brain.popState();
        this.brain.pushState(this.idle.bind(this));
    }
}

Athlete.prototype.attack = function attack () {
    if (this.puck) {
        var puckOwner = this.puck.owner;

        if (puckOwner) {
            if (this.myTeamHaveThePuck()) {
                if (puckOwner === this) {
                    this.boid.seek(this.getOpponentGoalPosition());
                } else {
                    if (this.isAheadOfMe(puckOwner.boid)) {
                        this.boid.followLeader(puckOwner.boid);
                    } else {
                        // this.boid.separation();
                    }
                }
            } else {
                this.brain.popState();
                this.brain.pushState(this.stealPuck.bind(this));
            }
        } else {
            this.brain.popState();
            this.brain.pushState(this.pursuePuck.bind(this));
        }
    }
}

Athlete.prototype.getOpponentGoalPosition = function () {
    if (this.team === 'red') {
        return Vec2D.ObjectVector(width, height / 2);
    } else {
        return Vec2D.ObjectVector(0, height / 2)
    }
}

Athlete.prototype.isAheadOfMe = function (boid) {
    var targetDistance = this.getOpponentGoalPosition().distance(boid.position);
    var myDistance = this.getOpponentGoalPosition().distance(this.boid.position);

    return targetDistance <= myDistance;
}

Athlete.prototype.stealPuck = function stealPuck () { 
    if (this.puck) {
        var puckOwner = this.puck.owner;

        if (puckOwner) {
            if (this.myTeamHaveThePuck()) {
                this.brain.popState();
                this.brain.pushState(this.attack.bind(this));
            } else {
                this.boid.pursuit(puckOwner.boid);
                this.boid.separation(50);
            }
        } else {
            this.brain.popState();
            this.brain.pushState(this.pursuePuck.bind(this));
        }
    }
}

Athlete.prototype.pursuePuck = function pursuePuck () {
    if (this.puck) {
        if (this.boid.position.distance(this.puck.position) > 150) {
            this.brain.popState();
            this.brain.pushState(this.idle.bind(this));
        } else {
            if (!this.puck.owner) {
                this.boid.seek(this.puck.position.clone());
            } else {
                this.brain.popState();
                this.brain.pushState(this.myTeamHaveThePuck() ? this.attack.bind(this) : this.stealPuck.bind(this));
            }
        }
    }
 }

 Athlete.prototype.myTeamHaveThePuck = function () {
     return this.puck.owner.team === this.team;
 }