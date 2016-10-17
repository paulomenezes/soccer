function StackFSM() {
    this.stack = new Array();

    this.update = function () {
        var currentStateFunction = this.getCurrentState();

        if (currentStateFunction) {
            currentStateFunction();
        }
    }

    this.popState = function () {
        return this.stack.pop();
    }

    this.pushState = function (state) {
        if (this.getCurrentState() != state) {
            this.stack.push(state);
        }
    }

    this.getCurrentState = function () {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
    }
}