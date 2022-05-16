import { BUTTON_SIZE } from './Constant.js';

class Button {
    constructor(x, y, img, num) {
        this.x = x;
        this.y = y;
        this.img = loadImage(img, img => {
            this.width = BUTTON_SIZE * 0.5;
            this.height = img.height * (this.width / img.width);
        });
        this.num = num
    }

    onMouse() {
        if(
            mouseX > this.x - BUTTON_SIZE/2 &&
            mouseX < this.x + BUTTON_SIZE/2 &&
            mouseY > this.y - BUTTON_SIZE/2 &&
            mouseY < this.y + (BUTTON_SIZE/2 + BUTTON_SIZE/3 * (this.num-1))
        ) return this;
        return null;
    }

    setNum(num) {
        this.num = num;
    }


    draw() {
        fill(0);

        let gap = BUTTON_SIZE / 3;
        let color = 50 + 30 * this.num;

        text(this.num, this.x + gap*2, this.y - gap*2);

        for(let i=this.num; i>0; i--){
            if(color > 170) fill(170)
            else fill(color);
            circle(this.x, this.y + i*gap, BUTTON_SIZE);
            image(this.img, this.x, this.y + i*gap, this.width, this.height);
            color -= 30;
        }

    }
}

export { Button }