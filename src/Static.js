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

function pent(x,y,len){
    let penV1x=-len/2
    let penV1y=len
    let penV2x=-len/2
    let penV2y=-len
    let penV3x=0
    let penV3y= -len*1.5
    let penV4x= len/2
    let penV4y= -len
    let penV5x= len/2
    let penV5y= len
    beginShape()
    vertex(penV1x,penV1y)
    vertex(penV2x,penV2y)
    vertex(penV3x,penV3y)
    vertex(penV4x,penV4y)
    vertex(penV5x, penV5y)
    vertex(penV1x,penV1y)
    endShape()
    }

export { prob, randomType, drawShape, pent };