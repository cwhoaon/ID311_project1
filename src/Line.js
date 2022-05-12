import { LINE_SIZE, LINE_COLOR } from "./Constant";

const allConnections = [];
const allTerminals = [];

function popAllConnections(connection) {
    allConnections.splice(allConnections.indexOf(connection), 1);
}

function popAllTerminals(terminal) {
    allTerminals.splice(allTerminals.indexOf(terminal), 1);
}

class Line {
    constructor(id) {
        this.active = false;
        this.id = id;
        this.stations = [];
        this.connections = [];
        this.trains = [];
        this.start;
        this.end;
    }

    activate(station){
        this.active = true;
        this.stations.push(station);
        let t1 = new Terminal(this, this.stations[0], true);
        let t2 = new Terminal(this, this.stations[0], false);
        allTerminals.push(t1);
        allTerminals.push(t2)
        this.start = t1;
        this.end = t2;
    }

    validStation(station) {
        return !this.stations.some((s) => s.id == station.id);
    }

    deactivate(){
        this.active = false;
        this.stations = [];
        this.connections = [];
        this.trains = [];
        popAllTerminals(this.start)
        popAllTerminals(this.end)
        this.start = null;
        this.end = null;
    }

    addStation(index, station) {
        this.stations.splice(index, 0, station);
        if(this.stations.length > 1) {
            popAllConnections(this.connections[index-1]);
            this.connections.splice(index-1, 1);
            let c1 = new Connection(this, this.stations[index-1], this.stations[index]);
            let c2 = new Connection(this, this.stations[index], this.stations[index+1]);
            allConnections.push(c1);
            allConnections.push(c2);
            this.connections.splice(index-1, 0, c1, c2)
        }
    }

    addTerminalStation(isStart, station){
        if(isStart) {
            this.stations.splice(0, 0, station)
            let c = new Connection(this, this.stations[0], this.stations[1]);
            allConnections.push(c)
            this.connections.splice(0, 0, c);
            popAllTerminals(this.start)
            let t = new Terminal(this, this.stations[0], true);
            allTerminals.push(t)
            this.start = t
        }
        else {
            this.stations.splice(this.stations.length, 0, station);
            let c = new Connection(this, this.stations[this.stations.length-2], this.stations[this.stations.length-1])
            allConnections.push(c)
            this.connections.splice(this.connections.length, 0, c);
            popAllTerminals(this.end)
            let t = new Terminal(this, this.stations[this.stations.length-1], false);
            allTerminals.push(t)
            this.end = t
        }
    }

    deleteStation(index) {
        if(this.stations.length == 1) return;
        this.stations.splice(index, 1);

        if(index == 0){
            popAllConnections(this.connections[0]);
            this.connections.splice(0, 1);
            popAllTerminals(this.start)
            let t = new Terminal(this, this.stations[0], true);
            allTerminals.push(t)
            this.start = t
        }
        else if(index == this.stations.length) {
            popAllConnections(this.connections[index-1]);
            this.connections.splice(index-1, 1);
            popAllTerminals(this.end)
            let t = new Terminal(this, this.stations[this.stations.length-1], false);
            allTerminals.push(t)
            this.end = t
        }
        else {
            popAllConnections(this.connections[index-1]);
            popAllConnections(this.connections[index]);
            this.connections.splice(index-1, 2);
            let c = new Connection(this, this.stations[index-1], this.stations[index]);
            allConnections.push(c);
            this.connections.splice(index-1, 0, c);
        }
    }


    draw() {
        if(!this.active) return;
        strokeWeight(LINE_SIZE);
        const color = LINE_COLOR[this.id];
        stroke(color.r, color.g, color.b);
        fill(color.r, color.g, color.b);
        for(let connection of this.connections) {
            connection.draw();
        }
        this.start.draw();
        this.end.draw();

    }

    onMouse(){
        if(!this.active) return null;
        let interact;
        interact = this.start.onMouse()
        if(interact != null) return interact;
        interact = this.end.onMouse()
        if(interact != null) return interact;

        for(const connection of this.connections) {
            interact = connection.onMouse();
            if(interact != null) return interact;
        }
        return null;
    }
}

class Connection {
    constructor(line, s1, s2, overlap) {
        this.line = line;
        this.station1 = s1;
        this.station2 = s2;
        this.mode = 0; //0 = up, 1 = down
        this.overlap = 0;
        this.midx;
        this.midy;
        this.setMid()
    }

    setOverlap() {
        let count = 0;
        for(const connection of allConnections) {
            if(this == connection) break;
            if(connection.station1 == this.station1 && connection.station2 == this.station2)
                count++;
            if(connection.station1 == this.station2 && connection.station2 == this.station1)
                count++;
        }
        this.overlap = count;
    }

    setMid() {
        let x1 = this.station1.x, y1 = this.station1.y, x2 = this.station2.x, y2 = this.station2.y;
        let dx = Math.abs(x1 - x2), dy = Math.abs(y1 - y2);
        if(x1 > x2) [x1, y1, x2, y2] = [x2, y2, x1, y1];

        if (x1 == x2) {
            this.midx = x1;
            this.midy = (y1 + y2) / 2;
        }
        else if (y1 == y2) {
            this.midx = (x1 + x2) / 2;
            this.midy = y1;
        }
        else if (dx == dy) {
            this.midx = (x1 + x2) / 2;
            this.midy = (y1 + y2) / 2;
        }
        else if (y1 < y2) {
            if(dx > dy) {
                switch(this.mode) {
                    case 0:
                        this.midx = x2 - dy;
                        this.midy = y1;
                        break;
                    case 1:
                        this.midx = x1 + dy;
                        this.midy = y2;
                        break;
                }
            }
            else if(dx < dy) {
                switch(this.mode) {
                    case 0:
                        this.midx = x2;
                        this.midy = y1 + dx;
                        break;
                    case 1:
                        this.midx = x1;
                        this.midy = y2 - dx;
                        break;
                }
            }
        }
        else if (y1 > y2) {
            if(dx > dy) {
                switch(this.mode) {
                    case 0:
                        this.midx = x1 + dy;
                        this.midy = y2;
                        break;
                    case 1:
                        this.midx = x2 - dy;
                        this.midy = y1;
                        break;
                }
            }
            else if(dx < dy) {
                switch(this.mode) {
                    case 0:
                        this.midx = x1;
                        this.midy = y2 + dx;
                        break;
                    case 1:
                        this.midx = x2;
                        this.midy = y1 - dx;
                        break;
                }
            }
        }
    }

    draw() {
        let x1 = this.station1.x, y1 = this.station1.y, x2 = this.station2.x, y2 = this.station2.y, midx = this.midx, midy = this.midy;
        if(this.overlap == 1){
            y1 -= LINE_SIZE
            midy -= LINE_SIZE
            y2 -= LINE_SIZE
        }
        if(this.overlap == 2) {
            y1 += LINE_SIZE
            midy += LINE_SIZE
            y2 += LINE_SIZE
        }
        line(x1, y1, midx, midy);
        line(midx, midy, x2, y2);
    }

    onMouse() {
        let dist1, dist2;
        if(this.overlap == 0){
            dist1 = this.computeDist(this.station1.x, this.station1.y, this.midx, this.midy);
            dist2 = this.computeDist(this.station2.x, this.station2.y, this.midx, this.midy);
        }
        if(this.overlap == 1) {
            dist1 = this.computeDist(this.station1.x, this.station1.y-LINE_SIZE, this.midx, this.midy-LINE_SIZE);
            dist2 = this.computeDist(this.station2.x, this.station2.y-LINE_SIZE, this.midx, this.midy-LINE_SIZE);
        }
        if(this.overlap == 2) {
            dist1 = this.computeDist(this.station1.x, this.station1.y+LINE_SIZE, this.midx, this.midy+LINE_SIZE);
            dist2 = this.computeDist(this.station2.x, this.station2.y+LINE_SIZE, this.midx, this.midy+LINE_SIZE);
        }

        if((dist1 != null && dist1 < LINE_SIZE) || (dist2 != null && dist2 < LINE_SIZE)) return this;
        return null;
    }

    computeDist(x1, y1, x2, y2) {
        let a = y1-y2, b = -(x1-x2), c = -x1*(y1-y2) + y1*(x1-x2);
        if(
            mouseX > Math.min(x1, x2) - LINE_SIZE &&
            mouseX < Math.max(x1, x2) + LINE_SIZE &&
            mouseY > Math.min(y1, y2) - LINE_SIZE &&
            mouseY < Math.max(y1, y2) + LINE_SIZE
        ) return Math.abs(a*mouseX + b*mouseY + c)/ Math.sqrt(a**2 + b**2);
        return null
    }

}

class Terminal {
    constructor(line, station, isStart) {
        this.line = line;
        this.station = station;
        this.isStart = isStart;
        this.overlap;
        this.setOverlap();
        this.setPoint();
    }

    setOverlap() {
        let count = 0;
        for(const terminal of allTerminals) {
            if(this == terminal) break;
            if(terminal.station == this.station) count++;
        }
        this.overlap = count;
    }

    setPoint() {
        let theta = (this.overlap) * 45 * Math.PI / 180;
        let xoffset =  20*Math.cos(theta)  + 20*Math.sin(theta);
        let yoffset = 20*Math.sin(theta) - 20*Math.cos(theta);
        this.x = this.station.x + xoffset
        this.y = this.station.y + yoffset
    }

    draw() {
        line(this.station.x, this.station.y, this.x, this.y);
        circle(this.x, this.y, LINE_SIZE);
    }

    onMouse() {
        if(
            mouseX > this.x - LINE_SIZE/2 &&
            mouseX < this.x + LINE_SIZE/2 &&
            mouseY > this.y - LINE_SIZE/2 &&
            mouseY < this.y + LINE_SIZE/2
        ) return this;
        return null;
    }
}

export { Line, Connection, Terminal, allConnections, allTerminals };