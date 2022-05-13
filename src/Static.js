import { WEIGHT } from "./Constant.js";

function prob(x) {
    return Math.random() < x;
}

function randomType() {
    let x = Math.random(), cumulativeProb = 0;
    for(let i = 0; i<WEIGHT.length; i++) {
        cumulativeProb += WEIGHT[i]
        if(x < cumulativeProb) return i;
    }
    return WEIGHT.length-1;
}

function drawShape(x, y, type, size) {
    switch(type) {
        case 0:
            circle(x, y, size);
            break;
        case 1:
            triangle(
                x, y - size * (Math.sqrt(3)/3), 
                x - size/2, y + size * (Math.sqrt(3)/6),
                x + size/2, y + size * (Math.sqrt(3)/6)
            )
            break;
        case 2:
            square(x, y, size);
            break;
    }
}

export { prob, randomType, drawShape };