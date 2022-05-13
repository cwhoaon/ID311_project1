class Score {
    constructor() {
        this.score = 0;
    }

    increaseScore(n) {
        this.score += n;
    }

    update(source, ...others){
        if(source == "train") this.increaseScore(others[0]);
    }
}

export { Score }