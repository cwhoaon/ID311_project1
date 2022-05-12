import { BUTTON_SIZE } from './Constant.js';

class Button {
    constructor(num, x, y) {
        this.num = num;
        this.x = x;
        this.y = y;
    }

    onMouse() {
        if((mouseX - this.x)**2 + (mouseY - this.y)**2 <= (BUTTON_SIZE/2)**2) return this;
        return null;
    }


    draw() {
        fill(150);
        circle(this.x, this.y, BUTTON_SIZE);
        fill(0);
        text(this.num, this.x, this.y)
    }
}

export { Button }