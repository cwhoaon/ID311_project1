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

export { prob, randomType };