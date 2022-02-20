
// ***** CODE THAT WORKS FOR LOCALHOST *********************
// Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const PORT = 3000;

//Create HTTP server and listen on port 3000 for requests
const server = http.createServer((req, res) => {

  //Set the response HTTP header with HTTP status and Content type
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

const io = require('socket.io')();

//listen for request on port 3000, and as a callback function have the port listened on logged
io.listen(process.env.PORT || 3000);
server.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});
// *********************************************************


// ***** LITERALLY THE ONLY CODE IN THE SNAKES EXAMPLE *****
// const io = require('socket.io')();
// io.listen(process.env.PORT || 3000);
// *********************************************************


const { FRAME_RATE } = require('./constants');
const { CANVAS_WIDTH } = require('./constants');
const { CANVAS_HEIGHT } = require('./constants');
const { PLANCHETTE_WIDTH } = require('./constants');
const { PLANCHETTE_HEIGHT } = require('./constants');
const { initGame, addPlayer, gameLoop, recordKeyPress, recordButtonPress, recordJoystick } = require('./game');
const { makeid } = require('./utils');
const { trimActivePlayerList, decrementAfterImage, sleep, callSleep } = require('./utils');

let start = Date.now();
let now = Date.now();
let timePassed = (now - start);

const state = {};
const clientRooms = {};


io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('buttondown', handleButtonDown);
  client.on('joydown', handleJoyDown);
  client.on('newGame', handleNewGame);
  client.on('joinRoom', handleJoinRoom);
  client.on('joinGame', handleJoinGame);


  function handleJoinRoom(roomName) {
    // console.log("made it to handleJoinRoom")
    // const room = io.sockets.adapter.rooms[roomName];
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }
    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }
    // emitScore(room, numClients);

    if (numClients === 0 || state[roomName].current_game_active === false) {
      handleNewGame()
      // return;
    }

    clientRooms[client.id] = roomName;
    client.join(roomName);
    state[roomName].numSpirits = numClients + 1;
    client.number = numClients + 1;
    client.emit('init', client.id);
    console.log("Client " + client.id + " entered the room")
  }

  function handleJoinGame(playerInitials) {
    roomName = "AAAAA";

    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }
    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }
    // emitScore(room, numClients);

    if (numClients === 0 || state[roomName].current_game_active === false) {
      handleNewGame()
      return;
    }

    // console.log("made it to handleJoinGame")
    console.log("Client " + client.id + " (" + playerInitials + ") joined the game")
    newPlayer = addPlayer(state[roomName], client.id, playerInitials);
    state[roomName].activePlayers.push(newPlayer);
    state[roomName].numActivePlayers = state[roomName].activePlayers.length;

  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', client.id);
    state[roomName].numSpirits = 1;

    startGameInterval(roomName);
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      console.log("No room name")
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = recordKeyPress(keyCode);

    if (vel) {
      state[roomName].x[client.number - 1] = vel.x;
      state[roomName].y[client.number - 1] = vel.y;
    }
  }

  function handleButtonDown() {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      console.log("No room name")
      return;
    }
    console.log("##### Button Pressed by Client " + client.id)
    state[roomName].pressed[client.number - 1] = true;
    state[roomName] = recordButtonPress(client.id);
  }

  function handleJoyDown(joy) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      console.log("No room name")
      return;
    }
    joy = JSON.parse(joy);
    // console.log("joy.x: " + joy.x)

    // state[roomName].activePlayers.joyx = joy.x;
    // state[roomName].activePlayers.joyy = joy.y;
    state[roomName] = recordJoystick(state[roomName], client.id, joy);

    // console.log("##### Joystick Value from Client " + client.id)
    // console.log("joy.x: " + joy.x + ", joy.y: " + joy.y)
    // console.log("joy.x: " + joy.x)
    // state[roomName].pressed[client.number - 1] = true;
    // state[roomName] = recordButtonPress(client.id);
  }

});

function startGameInterval(roomName) {

  start = Date.now();

  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    now = Date.now();
    timePassed = now - start;
    // console.log("timePassed: " + timePassed)
    if ( timePassed < 1000 / FRAME_RATE ) {
      // console.log("less than 1000 / FRAME_RATE")
      // callSleep(1000 / FRAME_RATE - timePassed);
      // callSleep(2000);
    }
    start = Date.now();
    // callSleep(2000);
    if (!winner) {

      const room = io.sockets.adapter.rooms[roomName];
      let allUsers;
      if (room) {
        allUsers = room.sockets;
      }
      if (allUsers) {
        state[roomName] = trimActivePlayerList(state[roomName], Object.keys(allUsers));
      }
      state[roomName].numActivePlayers = state[roomName].activePlayers.length;
      // console.log("state[roomName].numActivePlayers: " + state[roomName].numActivePlayers)
      state[roomName] = decrementAfterImage(state[roomName]);
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, state[roomName]);
      // state[roomName] = null;
      state[roomName].current_game_active = false;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  // console.log("made it to emitGameState")
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify(gameState));
}

function emitScore(room, score) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameScore', JSON.stringify(score));
}


