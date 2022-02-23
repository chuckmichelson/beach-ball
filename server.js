
// ***** CODE THAT WORKS FOR LOCALHOST *********************
// // Load HTTP module
// const http = require("http");
// const hostname = '127.0.0.1';
// const PORT = 3000;

// //Create HTTP server and listen on port 3000 for requests
// const server = http.createServer((req, res) => {

//   //Set the response HTTP header with HTTP status and Content type
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World\n');
// });

// const io = require('socket.io')();

// //listen for request on port 3000, and as a callback function have the port listened on logged
// io.listen(process.env.PORT || 3000);
// server.listen(PORT, hostname, () => {
//   console.log(`Server running at http://${hostname}:${PORT}/`);
// });
// *********************************************************


// ***** LITERALLY THE ONLY CODE IN THE SNAKES EXAMPLE *****
const io = require('socket.io')();
io.listen(process.env.PORT || 3000);
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


  client.on('joinRoom', handleJoinRoom);
  client.on('joinGame', handleJoinGame);
  client.on('keydown', handleKeydown);
  client.on('buttondown', handleButtonDown);
  client.on('joydown', handleJoyDown);


  function handleJoinRoom(roomName) {
    // console.log("made it to handleJoinRoom")


    clientRooms[client.id] = roomName;
    client.join(roomName);
    const room = io.sockets.adapter.rooms[roomName];
    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }
    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }
    client.emit('initclient', client.id);
    console.log("Client " + client.id + " entered the room")

    if (!state[roomName] || numClients === 1) {
      createNewGame(roomName);
      return;
    }
  }


  function handleJoinGame(playerInitials) {
    // startGameInterval('AAAAA');

    // startGameInterval('AAAAA');
    roomName = "AAAAA";
    // console.log(roomName)
    // console.log("*made it to handleJoinGame*")
    const room = io.sockets.adapter.rooms[roomName];

    // console.log("roomName: " + roomName)
    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }
    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }
    // emitScore(room, numClients);
    // console.log("handleJoinGame numClients: " + numClients)
    console.log("Client " + client.id + " (" + playerInitials + ") joined the game")
    newPlayer = addPlayer(state[roomName], client.id, playerInitials);
    // console.log("newPlayer.initials: " + newPlayer.initials)
    state[roomName].activePlayers.push(newPlayer);
    // console.log("pushed the new player")
    state[roomName].numActivePlayers = state[roomName].activePlayers.length;
    // console.log("state[roomName].numActivePlayers: " + state[roomName].numActivePlayers)

  }


  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    // setInterval(gameInterval, 1000);
    // console.log("made it to handleKeydown")
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

  // console.log("made it to startGameInterval")
  start = Date.now();
  // console.log("start: " + start)

  // if (state[roomName]) {
  //   console.log("state[roomName].planchette.pos.x: " + state[roomName].planchette.pos.x)
  // }

  const intervalId = setInterval(() => {

    // console.log("made it to setInterval")

    const winner = gameLoop(state[roomName]);

    // console.log("winner: " + winner)

    now = Date.now();
    timePassed = now - start;
    start = Date.now();
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
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}


function createNewGame(roomName) {
  // console.log("made it to createNewGame")
  // let roomName = makeid(5);
  // clientRooms[client.id] = roomName;
  state[roomName] = initGame();
  startGameInterval(roomName);
}


// function startGameInterval(roomName) {

//   console.log("made it to startGameInterval")
//   start = Date.now();
//   console.log("start: " + start)
//   if (state[roomName]) {
//     console.log("state[roomName].planchette.pos.x: " + state[roomName].planchette.pos.x)
//   }
//   setInterval(gameInterval, 1000);
//   console.log("should have set interval by now")
// }


function testInterval() {
  console.log("Time stamp: " + Date.now())
}




    // console.log("made it to setInterval")

    // const winner = gameLoop(state[roomName]);

    // console.log("winner: " + winner)

    // now = Date.now();
    // timePassed = now - start;
    // start = Date.now();
    // if (!winner) {

    //   const room = io.sockets.adapter.rooms[roomName];
    //   let allUsers;
    //   if (room) {
    //     allUsers = room.sockets;
    //   }
    //   if (allUsers) {
    //     state[roomName] = trimActivePlayerList(state[roomName], Object.keys(allUsers));
    //   }
    //   state[roomName].numActivePlayers = state[roomName].activePlayers.length;
    //   console.log("state[roomName].numActivePlayers: " + state[roomName].numActivePlayers)
    //   state[roomName] = decrementAfterImage(state[roomName]);
    //   emitGameState(roomName, state[roomName]);
    // } else {
    //   emitGameOver(roomName, state[roomName]);
    //   clearInterval(intervalId);
    // }


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


