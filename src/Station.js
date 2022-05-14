import { MAX_WAITING_TIME, PASSENGER_SIZE, STATION_SIZE } from "./Constant.js";

import { randomType, drawShape } from "./Static.js";

class Station {
    constructor(id, x, y, type) {
        this.id = id
        this.x = x;
        this.y = y;
        this.type = type;
        this.passengers = [];
        this.maxPassenger = 6;
        this.waitingTime = 0;
        this.generationTime = 0;
    }

    addConnected(stationId) {
        this.connected.push(stationId);
    }

    generatePassengers() {
        let type;
        do {
            type = randomType();
        } while(type === this.type)
        this.passengers.push(type);
        this.passengers.sort((a, b) => b - a);
    }

    isOverMax() {
        return this.passengers.length > this.maxPassenger;
    }

    setPassengers(passengers) {
        this.passengers = passengers;
    }

    updateWaitingTime() {
        if(this.passengers.length > this.maxPassenger) this.waitingTime++;
        else this.waitingTime = this.waitingTime > 0 ? this.waitingTime-1 : 0;
    }

    checkGameOver() {
        return this.waitingTime >= MAX_WAITING_TIME;
    }


    draw() {
        fill(255, 100, 100)
        noStroke()
        arc(this.x, this.y, STATION_SIZE*2.5, STATION_SIZE*2.5, -90, (this.waitingTime/MAX_WAITING_TIME)*360-90)

        //draw station
        stroke(0)
        strokeWeight(STATION_SIZE/5);
        fill(255);
        drawShape(this.x, this.y, this.type, STATION_SIZE);

        //draw passenger
        strokeWeight(0);
        fill(0);

        let passengerX, passengerY;
        passengerX = this.x + STATION_SIZE;
        passengerY = this.y  - STATION_SIZE/2.5;
        for(let i=0; i<this.passengers.length; i++){
            if(i % this.maxPassenger === 0 && i != 0) {
                passengerX = this.x + STATION_SIZE;
                passengerY += STATION_SIZE/2;
            }
            drawShape(passengerX, passengerY, this.passengers[i], PASSENGER_SIZE);
            passengerX += 1.25 * PASSENGER_SIZE;
        }


    }

    onMouse() {
        if(
            mouseX > this.x - STATION_SIZE/2 &&
            mouseX < this.x + STATION_SIZE/2 &&
            mouseY > this.y - STATION_SIZE/2 &&
            mouseY < this.y + STATION_SIZE/2
        ) return this;
        return null;
    }

}



class StationFactory {
    constructor(numStation) {
        this.numStation = numStation;
        this.previousStation = []
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new StationFactory(0);
        }
        return this.instance;
    }

    makeStation(type = randomType()) {
        let x, y, rangeX, rangeY, isOverlap, px, py, pendingCount=0;
        rangeX = windowWidth*0.8
        rangeY = windowHeight*0.8
        do {
            isOverlap = false;
            x = windowWidth/2 + (Math.random()-0.5) * rangeX
            y = windowHeight/2 + (Math.random()-0.5) * rangeY
            for({px, py} of this.previousStation) {
                if (Math.sqrt((x-px)**2 + (y-py)**2) < STATION_SIZE*3) {
                    isOverlap = true;
                    break;
                }
            }
            if(pendingCount++ > 10) return null;
        } while (isOverlap)

        this.previousStation.push({px: x, py: y});
        return new Station(this.numStation++, x, y, type);
    }
}

export { Station, StationFactory };