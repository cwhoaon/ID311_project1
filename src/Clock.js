import { CLOCK_SPEED } from "./Constant";

class Clock {
    constructor() {
        this.time = 0;
        this.speed = CLOCK_SPEED;
    }

    increaseTime() {
        this.time += this.speed;
    }
}

export { Clock }