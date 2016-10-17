function Boid(x, y) {
    this.position = Vec2D.ObjectVector(x, y);
    this.radius = 10;

    this.velocity = Vec2D.ObjectVector(0, 0);
    this.acceleration = Vec2D.ObjectVector(0, 0);

    this.max_velocity = 1;
    this.max_force = 0.1;
    
    this.last_target = null;

    this.behind = null;

    this.update = function () {
        this.velocity.add(this.acceleration);
        this.velocity.mulS(this.max_velocity);

        this.position = this.position.add(this.velocity);

        this.acceleration.mulS(0);
    }

    this.applyForce = function (force) {
        this.acceleration.add(force);
    }

    this.seek = function (target) {
        var desired = target.subtract(this.position);
        desired.normalize();
        desired.mulS(this.max_velocity);

        var steer = desired.subtract(this.velocity);

        this.applyForce(steer);
    }

    this.flee = function (target) {
        var desired = target.subtract(this.position);
        desired.normalize();
        desired.mulS(this.max_velocity);
        desired.mulS(-1);

        var steer = desired.subtract(this.velocity);

        this.applyForce(steer);
    }

    this.arrive = function (target) {
        var desired = target.subtract(this.position);

        var d = desired.length();
        desired.normalize();

        if (d < 100) {
            var m = this.map(d, 0, 100, 0, this.max_velocity);
            desired.mulS(m);
        } else {
            desired.mulS(this.max_velocity);
        }

        var steer = desired.subtract(this.velocity);
        steer.mulS(this.max_force);

        this.applyForce(steer);
    }

    this.wander = function () {
        if (!this.last_target || this.last_target.distance(this.position) < 100) {
            var x = Math.random() * width;
            var y = Math.random() * height;

            this.last_target = Vec2D.ObjectVector(x, y);

            this.seek(this.last_target.clone());
        }
    }

    this.pursuit = function (boid) {
        var T = 1.5; // boid.position.clone().subtract(this.position.clone());
        var futurePosition = boid.position.clone().add(boid.velocity.clone()).mulS(T);

        this.seek(futurePosition);
    }

    this.followLeader = function (leader) {
        var tv = leader.velocity.clone();
        var force = Vec2D.ObjectVector(0, 0);

        tv.mulS(-1);
        tv.normalize();
        tv.mulS(5);

        this.behind = leader.position.clone().add(tv);

        this.arrive(this.behind);
    }

    this.separation = function (maxDistance) {
        var force = Vec2D.ObjectVector(0, 0);
        var neighborCount = 0;

        for (var i = 0; i < athletes.length; i++) {
            var b = athletes[i].boid;

            if (b != this && b.position.clone().distance(this.position.clone()) <= 1000) {
                force.setX(force.getX() + b.position.clone().getX() - this.position.clone().getX());
                force.setY(force.getY() + b.position.clone().getY() - this.position.clone().getY());

                neighborCount++;
            }
        }

        if (neighborCount != 0) {
            force.setX(force.getX() / neighborCount);
            force.setY(force.getY() / neighborCount);

            force.mulS(-1);
        }

        force.normalize();
        force.mulS(maxDistance ? maxDistance : 10);

        this.applyForce(force.clone());
    }

    this.map = function(value, istart, istop, ostart, ostop) {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    }
}