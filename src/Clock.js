import { CLOCK_SPEED, ONE_DAY, CLOCK_SIZE } from "./Constant";

const weekday = ['MON', 'TUE', "WED", 'THR', "FRI", "SAT", 'SUN'];

class Clock {
    constructor() {
        this.weekday = 0;
        this.time = 0;
        this.speed = CLOCK_SPEED;
    }

    increaseTime() {
        this.time += this.speed;
        this.setWeekday()
    }

    setWeekday() {
        this.weekday = parseInt((this.time % (ONE_DAY*7)) / ONE_DAY)
    }

    draw() {
        let x = windowWidth - 0.8 * CLOCK_SIZE, y = 0.8 * CLOCK_SIZE;
        fill(255)
        stroke(0)
        strokeWeight(CLOCK_SIZE * 0.07)
        circle(x, y, CLOCK_SIZE);
        stroke(100)
        push()
        translate(x, y);
        rotate(360 * (this.time / ONE_DAY))
        line(0, 0, 0, -CLOCK_SIZE*0.4);
        pop();
        textAlign(CENTER, TOP)
        textSize(20)
        noStroke()
        fill(0)
        text(weekday[this.weekday], x, y + CLOCK_SIZE * 0.7);
    }
}

export { Clock }