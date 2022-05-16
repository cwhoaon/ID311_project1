import '../css/style.css';
import { sketch } from 'p5js-wrapper';

import { PASSENGER_GENERATION_RATE, STATION_GENERATION_RATE, LINE_COLOR, STATION_SIZE, LINE_SIZE } from './Constant';

import { prob } from './Static.js';

import { StationFactory } from './Station.js'
import { Clock } from './Clock.js';
import { Score } from './Score.js';
import { Line, Connection, Terminal, allConnections, allTerminals } from './Line';
import { Train } from './Train';
import { Button } from './Button';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzBwbRbE__LNX_PXdYT5wNF6wH3nU_20I",
  authDomain: "id311-project1-1dae3.firebaseapp.com",
  projectId: "id311-project1-1dae3",
  storageBucket: "id311-project1-1dae3.appspot.com",
  messagingSenderId: "145352820612",
  appId: "1:145352820612:web:86d9d73366550581773fd1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let game
function initialize() {
  game = {
    clock: new Clock(),
    score: new Score(),
    stationFactory: StationFactory.getInstance(),
    num_line: 8,
    num_train: 10,
    stations: [],
    lines: [],
    trains: [],
    lastStationTime: 0,
    trainButton: null,
  }
  for(let i=0; i<game.num_line; i++){
    game.lines.push(new Line(i));
  }
  game.stations.push(game.stationFactory.makeStation(0));
  game.stations.push(game.stationFactory.makeStation(1));
  game.stations.push(game.stationFactory.makeStation(2));
  game.trainButton = new Button(windowWidth * 0.04, windowHeight * 0.4, "/src/train.png", game.num_train)
}

let ubuntu
sketch.preload = function() {
  ubuntu = loadFont("src/Ubuntu-Bold.ttf");
}


sketch.setup = function(){
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  ellipseMode(CENTER);
  imageMode(CENTER);
  angleMode(DEGREES);
  textFont(ubuntu)
  //initializing game
  initialize();
}


//0 = before game, 1 = during game, 2 = after game
let currentPage = 0;
let loadingHeight = 0
let loadingHeightSpeed = 0
sketch.draw = function(){
  if(currentPage == 0) intro()
  if(currentPage == 0.5){
    noStroke()
    fill(240, 255, 240)
    rect(windowWidth/2, windowHeight/3, windowWidth, loadingHeight += loadingHeightSpeed**3)
    loadingHeightSpeed += 0.1
  }

  if(currentPage == 1) processGame()

  if(currentPage == 2) endPopup()
}

function intro() {
  clear()
  background(50, 150, 50)


  textAlign(LEFT, CENTER)
  textSize(windowHeight *  0.2)
  textStyle(BOLD)
  fill(255)
  noStroke()
  text("MINI", windowWidth*0.1, windowHeight/3 + windowHeight*0.3)
  text("METRO", windowWidth*0.1, windowHeight/2 + windowHeight*0.3)

  textAlign(LEFT, BOTTOM)
  textSize(windowHeight*0.05)
  text("Press 'S' to Start", windowWidth*0.11, windowHeight/3 - windowHeight*0.02)
  stroke(240, 255, 240)
  strokeWeight(LINE_SIZE*2)
  line(0, windowHeight/3, windowWidth, windowHeight/3)
  stroke(0, 70, 70)
  line(windowWidth*0.85, windowHeight/3, windowWidth*0.85, windowHeight);
  line(windowWidth*0.85, windowHeight/3, windowWidth*0.85 - windowHeight/3, 0)
  
  stroke(0)
  strokeWeight(STATION_SIZE/5*2)
  circle(windowWidth*0.85, windowHeight/3, STATION_SIZE*2)
}

function processGame() {
  clear()
  background(240, 255, 240);
  game.clock.draw()
  // game.score.draw();
  game.trainButton.draw();
  drawLineStatus()
  //draw line
  for(const line of game.lines) {
    line.draw();
  }

  //generate station
  if(prob((game.clock.time - game.lastStationTime) / STATION_GENERATION_RATE)) {
    let newStation = game.stationFactory.makeStation();
    if(newStation != null) game.stations.push(newStation);
    game.lastStationTime = game.clock.time;
  }

  
  for (const station of game.stations) {
    //generate passenger
    if(prob((game.clock.time - station.generationTime) / PASSENGER_GENERATION_RATE)){
      station.generatePassengers();
      station.generationTime = game.clock.time
    }
    //draw stations
    station.updateWaitingTime()
    if(station.checkGameOver()) currentPage = 2;
    station.draw()
  }

  for (const train of game.trains) {
    if(!train.isInteracting) {
      train.arrive(game.clock.time)
      train.move(game.clock.time);
    }
    train.draw();
  }

  game.clock.increaseTime()
}


function drawLineStatus() {
  let gap = STATION_SIZE;
  let x =   windowWidth -  windowWidth *0.03
  let y = (windowHeight / 2) - ((game.num_line+1)/2)*(gap + STATION_SIZE)
  noStroke();

  for(const line of game.lines) {
    y += STATION_SIZE + gap;
    let color = LINE_COLOR[line.id];
    fill(color.r, color.g, color.b);
    if(line.active) circle(x, y, STATION_SIZE*1.5)
    else circle(x, y, STATION_SIZE);
  }
}

function endPopup() {
  fill(255)
  stroke(150)
  strokeWeight(10)
  rect(windowWidth/2, windowHeight/2, windowWidth/2, windowHeight/2)
  fill(0)
  textAlign(CENTER, CENTER)
  noStroke()
  textSize(30)
  text(`You trasnported ${game.score.score} people!`, windowWidth/2, windowHeight/2-40)
  text("Press 'R' to restart", windowWidth/2, windowHeight/2+40)
}




sketch.keyTyped = function() {
  if(currentPage == 0 && (key == 's' || key == 'S')) {
    currentPage = 0.5
    setTimeout(() => {
      currentPage = 1
    }, 1000)
  }
  if(currentPage == 2 && (key == 'r' || key == 'R')) {
    initialize()
    currentPage = 1
  }
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

function connectionOnTrain(connection) {
  for(const train of game.trains) {
    if(train.connection == connection) return true;
  }
  return false;
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
    game.trainButton.setNum(game.num_train - game.trains.length);
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
    if(connectionOnTrain(interact)) interact = null;
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
          (
            interact.station1 == onStation &&
            !connectionOnTrain(line.connections[line.connections.indexOf(interact)-1]) &&
            validOverlap(interact.station2, line.stations[line.stations.indexOf(onStation)-1])
          ) ||
          (
            interact.station2 == onStation &&
            !connectionOnTrain(line.connections[line.connections.indexOf(interact)+1]) &&
            validOverlap(interact.station1, line.stations[line.stations.indexOf(onStation)+1])
          )
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
        interact.subscribe(game.score);
        interact.activate(onObject, game.clock.time)
      }
      else {
        interact.unsubscribeAll();
        game.trains.splice(game.trains.indexOf(interact), 1);
        game.trainButton.setNum(game.num_train - game.trains.length);
      }
      break;
  }

  clearInteraction()
}