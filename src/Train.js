import { TRAIN_SIZE, TRAIN_SPEED, LINE_COLOR, TRAIN_PASSENGER_SIZE, PASSENGER_MOVING_TIME } from './Constant.js'
import { drawShape, pent } from './Static.js';
import { Subject } from './Subject.js';

const directionTable = [
    {xdir: 0, ydir: -1},
    {xdir: 1 / Math.sqrt(2), ydir: -1 / Math.sqrt(2)},
    {xdir: 1, ydir: 0},
    {xdir: 1 / Math.sqrt(2), ydir: 1 / Math.sqrt(2)},
    {xdir: 0, ydir: 1},
    {xdir: -1 / Math.sqrt(2), ydir: 1 / Math.sqrt(2)},
    {xdir: -1, ydir: 0},
    {xdir: -1 / Math.sqrt(2), ydir: -1 / Math.sqrt(2)},
]

class Train extends Subject {
    constructor(x, y) { 
        super()
        this.isInteracting = true;
        this.passengers = []
        this.maxPassenger = 6;
        this.line
        this.connection
        this.location
        this.isForward
        this.x = x
        this.y = y
        this.direction = 0;
        this.partingTime;
        this.arrivalTime;
        this.waiting = false;
    }

    deactivate() {
        this.isInteracting = true;
    }

    activate(connection, time) {
        this.isInteracting = false;

        this.connection = connection;
        this.line = this.connection.line;
        this.location = 0;
        this.isForward = true;
        this.x = this.connection.port1x;
        this.y = this.connection.port1y;
        this.direction;
        this.partingTime = time;
        this.arrivalTime = this.getDistance(this.connection.port1x, this.connection.port1y, this.connection.midx, this.connection.midy) / TRAIN_SPEED;
        this.setDirection();
        this.getIn()
    }

    arrive(time) {
        if(time - this.partingTime < this.arrivalTime) return;
        if(this.location == 0) this.changeLocation();
        else this.changeConnection();
        this.partingTime = time;
    }

    changeLocation() {
        this.location = 1;
        this.setDirection()
        this.x = this.connection.midx;
        this.y = this.connection.midy;
        let dist = this.isForward ? this.getDistance(this.connection.midx, this.connection.midy, this.connection.port2x, this.connection.port2y) : this.getDistance(this.connection.midx, this.connection.midy, this.connection.port1x, this.connection.port1y)
        this.arrivalTime = dist / TRAIN_SPEED;
    }

    changeConnection() {
        this.setConnection()
        this.getOff()
        this.getIn()
        this.location = 0;
        this.setDirection();
        if(this.isForward) {
            this.x = this.connection.port1x;
            this.y = this.connection.port1y;
        }
        else {
            this.x = this.connection.port2x;
            this.y = this.connection.port2y;
        }

        let dist = this.isForward ? this.getDistance(this.connection.midx, this.connection.midy, this.connection.port1x, this.connection.port1y) : this.getDistance(this.connection.midx, this.connection.midy, this.connection.port2x, this.connection.port2y)
        this.arrivalTime = dist / TRAIN_SPEED;
    }

    setConnection() {
        let connections = this.connection.line.connections;
        if(connections.indexOf(this.connection) == 0 && !this.isForward) {
            this.isForward = true;
        }
        else if(connections.indexOf(this.connection) == connections.length-1 && this.isForward){
            this.isForward = false;
        }
        else if(!this.isForward) {
            this.connection = connections[connections.indexOf(this.connection) - 1];
        }
        else if(this.isForward) {
            this.connection = connections[connections.indexOf(this.connection) + 1];
        }
    }

    choosePassenger() {
        let stationTypes = this.line.stations.map((s) => s.type);
        let nextStation
        if(this.isForward) {
            nextStation = this.connection.station2
            stationTypes.splice(0, this.line.stations.indexOf(nextStation))
        }
        else {
            nextStation = this.connection.station1
            stationTypes.splice(this.line.stations.indexOf(nextStation)+1, stationTypes.length-1-this.line.stations.indexOf(nextStation))
        }
        let tempSet = new Set(stationTypes);
        return [...tempSet];
    }

    getIn() {
        let target = this.choosePassenger(), stationPassengers, passengerIndexes = []
        if(this.isForward) stationPassengers = this.connection.station1.passengers;
        else stationPassengers = this.connection.station2.passengers;
        for(let i = 0; i < stationPassengers.length; i++) {
            if(this.passengers.length + passengerIndexes.length >= this.maxPassenger) break;
            if(target.includes(stationPassengers[i])) passengerIndexes.push(i);
        }
        let count = 0;
        for(let i of passengerIndexes){
            this.passengers.push(stationPassengers[i-count]);
            stationPassengers.splice(i - count, 1);
            this.passengers.sort((a, b) => b - a);
            count++;
            if(this.isForward) this.connection.station1.setPassengers(stationPassengers);
            else this.connection.station2.setPassengers(stationPassengers);
        }
    }

    getOff() {
        let count, tempPassenger, stationType;

        if(this.isForward) stationType = this.connection.station1.type;
        else stationType = this.connection.station2.type;

        tempPassenger = this.passengers.filter((p) => p != stationType);
        count = this.passengers.length - tempPassenger.length;
        this.notifySubscribers("train", count);
        this.passengers = tempPassenger;
    }

    setDirection() {
        let x1, y1, x2, y2;
        if(this.location == 0 && this.isForward) {
            x1 = this.connection.port1x;
            y1 = this.connection.port1y;
            x2 = this.connection.midx;
            y2 = this.connection.midy;
        }
        else if(this.location == 1 && this.isForward) {
            x1 = this.connection.midx;
            y1 = this.connection.midy;
            x2 = this.connection.port2x;
            y2 = this.connection.port2y;
        }
        else if(this.location == 0 && !this.isForward) {
            x1 = this.connection.port2x;
            y1 = this.connection.port2y;
            x2 = this.connection.midx;
            y2 = this.connection.midy;
        }
        else if(this.location == 1 && !this.isForward) {
            x1 = this.connection.midx;
            y1 = this.connection.midy;
            x2 = this.connection.port1x;
            y2 = this.connection.port1y;
        }

        let dir;
        if(x1 == x2 && y1 > y2) dir = 0;
        else if(x1 < x2 && y1 > y2) dir = 1;
        else if(x1 < x2 && y1 == y2) dir = 2;
        else if(x1 < x2 && y1 < y2) dir = 3;
        else if(x1 == x2 && y1 < y2) dir = 4;
        else if(x1 > x2 && y1 < y2) dir = 5;
        else if(x1 > x2 && y1 == y2) dir = 6;
        else if(x1 > x2 && y1 > y2) dir = 7;
        this.direction = dir;
    }

    getDistance(x1, y1, x2, y2) {
        let dx = Math.abs(x1 - x2), dy = Math.abs(y1-y2);
        if(dx < 0.1) return dy;
        if(dy < 0.1) return dx;
        return dx * Math.sqrt(2);
    }

    move() {
        this.x += directionTable[this.direction].xdir * TRAIN_SPEED;
        this.y += directionTable[this.direction].ydir * TRAIN_SPEED;
    }

    onMouse() {
        let x  = mouseX - this.x, y = mouseY - this.y;
        let xt = x*Math.cos(-this.direction*45 * Math.PI / 180) - y*Math.sin(-this.direction*45 * Math.PI / 180);
        let yt = x*Math.sin(-this.direction*45 * Math.PI / 180) + y*Math.cos(-this.direction*45 * Math.PI / 180);
        if(
            xt > -TRAIN_SIZE/2 &&
            xt < TRAIN_SIZE/2 &&
            yt > -1.25 * TRAIN_SIZE &&
            yt < 1.25 * TRAIN_SIZE
        ) return this;
        return null;
    }

    draw() {
        let pyMargin = 2 * TRAIN_SIZE - TRAIN_PASSENGER_SIZE * parseInt(this.maxPassenger / 2), pyInterval = pyMargin / (parseInt(this.maxPassenger / 2) + 1);
        let color, px= -0.55*TRAIN_PASSENGER_SIZE, py=-TRAIN_SIZE + pyInterval + 0.5 *TRAIN_PASSENGER_SIZE, pxInterval = 1.1 * TRAIN_PASSENGER_SIZE; 
        if (this.isInteracting) color = {r: 100, g: 100, b: 100};
        else color = LINE_COLOR[this.line.id];
        noStroke();
        fill(color.r, color.g, color.b);
        push()
        translate(this.x, this.y)
        rotate(45 * this.direction);
        pent(0, 0, TRAIN_SIZE)
        fill(255)
        if(!this.isInteracting){
            this.passengers.forEach((p, i) => {
                drawShape(px + pxInterval * (i % 2), py + (pyInterval + TRAIN_PASSENGER_SIZE) * parseInt(i / 2) , p, TRAIN_PASSENGER_SIZE)
            })
        }
        pop()
    }

}

export { Train }