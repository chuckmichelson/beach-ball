const { FRAME_RATE } = require('./constants');
const { CANVAS_WIDTH } = require('./constants');
const { CANVAS_HEIGHT } = require('./constants');
const { BALL_WIDTH } = require('./constants');
const { BALL_HEIGHT } = require('./constants');
const { MAX_PLAYERS_PER_ROOM } = require('./constants');
const { AVATAR_RADIUS } = require('./constants');
const { BEACH_BALL_MASS } = require('./constants');
const { BEACH_BALL_DIAMETER } = require('./constants');
const { DRAG_COEFFICIENT } = require('./constants');
const { BOUNCE_VELOCITY } = require('./constants');

const BEACH_BALL_ACCELERATION = DRAG_COEFFICIENT / BEACH_BALL_MASS;
const PIXELS_PER_METER = BALL_WIDTH / BEACH_BALL_DIAMETER;

const { makeid } = require('./utils');
// const { ouijaGoToLetter } = require('./utils');
// const { ouijaGetLetter } = require('./utils');
const { makeArray } = require('./utils');
const { shuffleArray } = require('./utils');
// const { getNextBounce } = require('./utils');
var randomWords = require('random-words');


module.exports = {
  initGame,
  addPlayer,
  gameLoop,
  recordKeyPress,
  recordButtonPress,
  recordJoystick,
}

function initGame() {
  // console.log("*****made it to initGame()")
  state = createGameState();
  start = 0;
  return state;
}

function createGameState() {
  return {
    numActivePlayers: 0,
    activePlayers: [],
    bounce_count: 0,
    last_bounce_start: Date.now(),
    x: Array(100).fill(0),
    y: Array(100).fill(0),
    pressed: Array(255).fill(false),
    planchette: {
      pos: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      },
      last_bounce: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      },
      vel_unit: {
        x: 0,
        y: 0,
      }
    },
  };
}


function addPlayer(state, clientid, playerInitials) {
  posx = state.planchette.pos.x;
  posy = state.planchette.pos.y;
  freespace = false;
  while (freespace == false) {
    // console.log("freespace: " + freespace)
    randx = Math.floor(Math.random() * CANVAS_WIDTH - 4 * AVATAR_RADIUS) + 2 * AVATAR_RADIUS;
    randy = Math.floor(Math.random() * CANVAS_HEIGHT - 4 * AVATAR_RADIUS) + 2 * AVATAR_RADIUS;
    distance = Math.sqrt(Math.pow(randx - posx, 2) + Math.pow(randy - posy, 2));
    if ( distance > BALL_WIDTH / 2 + AVATAR_RADIUS ) {
      freespace = true;
    }
  }
  let newPlayer = {
    clientid: clientid,
    initials: playerInitials,
    button: false,
    afterimage: 0,
    joyx: 0,
    joyy: 0,
    posx: randx,
    posy: randy,
    velx: 0,
    vely: 0,
  };
  state.numActivePlayers += 1;
  return newPlayer;
}

function gameLoop(state) {

  // console.log("made it to gameLoop")
  if (!state) {
    return;
  }


  // update player positions
  state = updateVelocityAndPosition(state);



  // // decision rule
  // for (let i = 0; i < MAX_PLAYERS_PER_ROOM; i++) {
  //   // console.log("index: " + i)
  //   if (state.x[i] === 1 ) {
  //     // console.log("RIGHT")
  //     state.planchette.pos.x += 3;
  //   }
  //   if (state.x[i] === -1 ) {
  //     // console.log("LEFT")
  //     state.planchette.pos.x += -3;
  //   }
  //   if (state.y[i] === 1 ) {
  //     // console.log("DOWN")
  //     state.planchette.pos.y += 3;
  //   }
  //   if (state.y[i] === -1 ) {
  //     // console.log("UP")
  //     state.planchette.pos.y += -3;
  //   }

  //   // once we read the velocity, zero it out
  //   state.x[i] = 0;
  //   state.y[i] = 0;

  // }

  // keep the planchette on the board
  lost_ball = false;
  if (state.planchette.pos.x < 0 - BALL_WIDTH / 2 + 6) {
    lost_ball = true;
  }
  if (state.planchette.pos.x > CANVAS_WIDTH + BALL_WIDTH / 2 - 6) {
    lost_ball = true;
  }
  if (state.planchette.pos.y < 0 - BALL_WIDTH / 2 + 6) {
    lost_ball = true;
  }
  if (state.planchette.pos.y > CANVAS_HEIGHT + BALL_WIDTH / 2 - 6) {
    lost_ball = true;
  }
  if (lost_ball === true) {
    state.planchette.pos.x = CANVAS_WIDTH / 2;
    state.planchette.pos.y = CANVAS_HEIGHT / 2;
    state.bounce_count = 0;
    state.planchette.last_bounce.x = state.planchette.pos.x;
    state.planchette.last_bounce.y = state.planchette.pos.y;
    state.planchette.vel_unit.x = 0;
    state.planchette.vel_unit.y = 0;
  }

  // reset all player velocities to 0 so the user must hold down the arrow keys
  state.x = Array(5).fill(0);
  state.y = Array(5).fill(0);

  // return with no exit code
  return false;
}


function recordKeyPress(keyCode) {
  // console.log("made it to recordKeyPress()")
  switch (keyCode) {
    case 32: { // space bar
      // console.log("SPACE BAR")
      return { x: 0, y: 0 };
    }
    case 37: { // left
      // console.log("LEFT")
      return { x: -1, y: 0 };
    }
    case 38: { // down
      // console.log("UP")
      return { x: 0, y: -1 };
    }
    case 39: { // right
      // console.log("RIGHT")
      return { x: 1, y: 0 };
    }
    case 40: { // up
      // console.log("DOWN")
      return { x: 0, y: 1 };
    }
  }
}

function recordButtonPress(clientid) {
   for ( var i = state.activePlayers.length - 1; i >= 0; i-- ) {

      match = state.activePlayers[i].clientid === clientid;
      // console.log("match: " + match)
      if (match === true) {
         state.activePlayers[i].button = true;
         state.activePlayers[i].afterimage = 15;
         console.log("Recorded the button press")
      }
   }

   return state;
}

function recordJoystick(state, clientid, joy) {
   for ( var i = state.activePlayers.length - 1; i >= 0; i-- ) {
      // console.log("RECORD JOYSTICK: joy.x: " + joy.x)
      match = state.activePlayers[i].clientid === clientid;
      // console.log("match: " + match)
      if (match === true) {
         state.activePlayers[i].joyx = joy.x;
         state.activePlayers[i].joyy = joy.y;
         // console.log("Recorded the button press")
         // console.log("state.activePlayers[i].joyx: " + state.activePlayers[i].joyx)
      }
   }

   return state;
}

function updateVelocityAndPosition(state) {

  // players
  for ( var i = state.activePlayers.length - 1; i >= 0; i-- ) {
    // console.log("state.activePlayers[i].joyx: " + state.activePlayers[i].joyx)
    state.activePlayers[i].velx = state.activePlayers[i].joyx / 40;
    state.activePlayers[i].vely = -state.activePlayers[i].joyy / 40;
    state.activePlayers[i].posx += state.activePlayers[i].velx;
    state.activePlayers[i].posy += state.activePlayers[i].vely;
    if (state.activePlayers[i].posx < 0 + AVATAR_RADIUS) {
      state.activePlayers[i].posx = 0 + AVATAR_RADIUS;
    }
    if (state.activePlayers[i].posx > CANVAS_WIDTH - AVATAR_RADIUS) {
      state.activePlayers[i].posx = CANVAS_WIDTH - AVATAR_RADIUS;
    }
    if (state.activePlayers[i].posy < 0 + AVATAR_RADIUS) {
      state.activePlayers[i].posy = 0 + AVATAR_RADIUS;
    }
    if (state.activePlayers[i].posy > CANVAS_HEIGHT - AVATAR_RADIUS) {
      state.activePlayers[i].posy = CANVAS_HEIGHT - AVATAR_RADIUS;
    }

    // distance
    px = state.activePlayers[i].posx; // + Math.random() / 100;
    py = state.activePlayers[i].posy; // + Math.random() / 100;
    bx = state.planchette.pos.x; // + Math.random() / 100;
    by = state.planchette.pos.y; // + Math.random() / 100;
    // console.log("px: " + px + ", py: " + py + ", bx: " + bx + ", by: " + by)
    distance = Math.sqrt(Math.pow(px - bx, 2) + Math.pow(py - by, 2));
    // console.log(distance)

    // ball
    time_since_bounce = Date.now() - state.last_bounce_start;
    // console.log("time_since_bounce: " + time_since_bounce)
    if (distance <= BALL_WIDTH / 2 + AVATAR_RADIUS) {   // bounce
      console.log("bounce")
      console.log(randomWords(5));
      state.last_bounce_start = Date.now();
      state.planchette.vel_unit.x = (bx - px) / distance; // normalized unit vector
      state.planchette.vel_unit.y = (by - py) / distance; // normalized unit vector
      state.bounce_count += 1;
      state.planchette.pos.x += (BALL_WIDTH / 2 + AVATAR_RADIUS + 5 - distance) * state.planchette.vel_unit.x;
      state.planchette.pos.y += (BALL_WIDTH / 2 + AVATAR_RADIUS + 5 - distance) * state.planchette.vel_unit.y;
      state.planchette.last_bounce.x = state.planchette.pos.x;
      state.planchette.last_bounce.y = state.planchette.pos.y;
    }
  }
  x = state.planchette.last_bounce.x;
  y = state.planchette.last_bounce.y;
  velunitx = state.planchette.vel_unit.x;
  velunity = state.planchette.vel_unit.y;


  state.planchette.pos.x = x + BOUNCE_VELOCITY * velunitx * (Date.now() - state.last_bounce_start) / 1000 + 1 / 2 * velunitx * BEACH_BALL_ACCELERATION * Math.pow((Date.now() - state.last_bounce_start) / 1000, 2);
  state.planchette.pos.y = y + BOUNCE_VELOCITY * velunity * (Date.now() - state.last_bounce_start) / 1000 + 1 / 2 * velunity * BEACH_BALL_ACCELERATION * Math.pow((Date.now() - state.last_bounce_start) / 1000, 2);

  return state;
}
