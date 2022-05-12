import '../css/style.css';
import { sketch } from 'p5js-wrapper';

import { PASSENGER_GENERATION_RATE, STATION_GENERATION_RATE } from './Constant';

import { prob } from './Probability.js';

import { StationFactory } from './Station.js'
import { Clock } from './Clock.js'
import { Line, Connection, Terminal, allConnections, allTerminals } from './Line';
import { Train } from './Train';
import { Button } from './Button';

const game = {
  clock: new Clock(),
  stationFactory: StationFactory.getInstance(),
  num_line: 8,
  num_train: 8,
  stations: [],
  lines: [],
  trains: [],
  lastStationTime: 0,
  trainButton: null,
}

function initialize() {
  for(let i=0; i<game.num_line; i++){
    game.lines.push(new Line(i));
  }
  game.stations.push(game.stationFactory.makeStation(0));
  game.stations.push(game.stationFactory.makeStation(1));
  game.stations.push(game.stationFactory.makeStation(2));
  game.trainButton = new Button(game.num_train, windowWidth/20, windowHeight/2)
}

sketch.setup = function(){
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  ellipseMode(CENTER);
  angleMode(DEGREES);
  //initializing game
  initialize();
}



sketch.draw = function(){
  clear()
  background(200);
  game.trainButton.draw();

  //draw line
  for(const line of game.lines) {
    line.draw();
  }

  //generate station
  if(prob((game.clock.time - game.lastStationTime) / STATION_GENERATION_RATE)) {
    game.stations.push(game.stationFactory.makeStation());
    game.lastStationTime = game.clock.time;
    console.log("New Station")
  }

  
  for (const station of game.stations) {
    //generate passenger
    if(prob((game.clock.time - station.generationTime) / PASSENGER_GENERATION_RATE)){
      station.generatePassengers();
      station.generationTime = game.clock.time
    }
    //draw station
    station.draw()
  }

  for (const train of game.trains) {
    if(!train.isInteracting){
      train.arrive(game.clock.time);
      train.move();
    }
    train.draw();
  }

  game.clock.increaseTime()
  //console.log(clock.time)
}










//none = 0, connection = 1, terminal = 2, train = 3
let interactClass = 0;
let interact = null;
let pOnStation = null;

function onLine() {
  let search;
  for(const line of game.lines) {
    search = line.onMouse();
    if(search != null) return search;
  }
  return null;
}

function searchOnStation() {
  for(const station of game.stations)
    if(station.onMouse() != null) return station;
  return null;
}

function onStation() {
  let search = searchOnStation();
  if(search != null) {
    for(const line of game.lines){
      if(!line.active) {
        line.activate(search);
        return line.end;
      }
    }
  }
  return null;
}

function onTrainButton() {
  if(game.trains.length >= game.num_train) return;
  if(game.trainButton.onMouse() != null) {
    let train = new Train(mouseX, mouseY);
    game.trains.push(train);
    return train;
  };
  return null;
}

function onTrain() {
  for(const train of game.trains)
    if(train.onMouse() != null) {
      train.deactivate();
      return train
    };
  return null
}

function getClass(interact) {
  if(interact instanceof Connection) return 1;
  if(interact instanceof Terminal) return 2;
  if(interact instanceof Train) return 3;
  return 0;
}



sketch.mousePressed = function(){
  interact = onTrainButton();
  if(interact == null){
    interact = onTrain();
  }
  if(interact == null){
    interact = onStation();
  }
  if(interact == null){
    interact = onLine();
  }

  interactClass = getClass(interact);
  console.log(interact)
}



function deleteStation(line, station) {
  let stationIndex = line.stations.indexOf(station);
  line.deleteStation(stationIndex);
  if(stationIndex == 0)
    return line.start;
  else if(stationIndex == line.stations.length)
    return line.end;
  else
    return line.connections[stationIndex-1];
}

function addStation(line, station, index) {
  line.addStation(index, station);
  return line.connections[index-1];
}

function deleteTerminal(line, station) {
  let index = line.stations.indexOf(station);
  line.deleteStation(index);
  if(index == 0)
    return line.start;
  else
    return line.end;
}

function addTerminal(line, station, isStart) {
  line.addTerminalStation(isStart, station);
  if(isStart)
    return line.start;
  return line.end;
}

function validOverlap(s1, s2) {
  let count = 0;
  for(const connection of allConnections) {
      if(this == connection) break;
      if(connection.station1 == s1 && connection.station2 == s2)
          count++;
      if(connection.station1 == s2 && connection.station2 == s1)
          count++;
  }
  return count < 3;
}

function updateConnectionOverlap() {
  for(const connection of allConnections)
    connection.setOverlap();
}

function updateTerminalOverlap() {
  for(const terminal of allTerminals){
    terminal.setOverlap()
    terminal.setPoint()
  }

}

sketch.mouseDragged = function() {
  let onStation;
  interactClass = getClass(interact);

  if(interactClass == 3) {      
    interact.x = mouseX;
    interact.y = mouseY;
  }
  else if(interactClass == 1 || interactClass == 2) {
    if(interactClass == 1){
      interact.midx = mouseX;
      interact.midy = mouseY;
    }
    else {
      interact.x = mouseX;
      interact.y = mouseY;
    }

    onStation = searchOnStation();
    if(onStation != null && onStation != pOnStation) {
      let line = interact.line;

      if(interactClass == 1){
        //deleteStation
        if(
          (interact.station1 == onStation && validOverlap(interact.station2, line.stations[line.stations.indexOf(onStation)-1])) ||
          (interact.station2 == onStation && validOverlap(interact.station1, line.stations[line.stations.indexOf(onStation)+1]))
        ) {
          interact = deleteStation(line, onStation);
        }
        //addStation
        else if(
          line.validStation(onStation) && 
          (validOverlap(interact.station1, onStation) && validOverlap(interact.station2, onStation))
        ) {
          interact = addStation(line, onStation, line.connections.indexOf(interact)+1);
        }
      }
      else {
        //deleteStation
        if(interact.station == onStation && line.stations.length != 1) {
          interact = deleteTerminal(line, onStation);
        }
        //addStation
        else if(line.validStation(onStation) && validOverlap(interact.station, onStation)) {
          interact = addTerminal(line, onStation, interact.isStart)
        }
        
      }
      updateConnectionOverlap();
      updateTerminalOverlap();
    }
    pOnStation = onStation;
  }
}


function clearInteraction() {
  interact = null;
  interactClass = 0;
  pOnStation = null;
}

sketch.mouseReleased = function() {
  switch(interactClass) {
    case 1:
      if(2*mouseY < interact.station1.y+interact.station2.y) interact.mode = 0;
      else interact.mode = 1;
      interact.setMid();
      break;
    case 2:
      interact.setPoint();
      if(interact.line.stations.length <= 1)
        interact.line.deactivate()
      break;
    case 3:
      let onObject = onLine();
      if(getClass(onObject) == 1) {
        interact.activate(onObject, game.clock.time)
      }
      else game.trains.splice(game.trains.indexOf(interact), 1);
      break;
  }

  clearInteraction()
}