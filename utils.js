const { FRAME_RATE } = require('./constants');
const { OUIJA_CODES } = require('./constants');
const { CANVAS_WIDTH } = require('./constants');
const { CANVAS_HEIGHT } = require('./constants');
const { PEOPLE_RADIUS } = require('./constants');



module.exports = {
  makeid,
  // ouijaGoToLetter,
  // ouijaGetLetter,
  makeArray,
  shuffleArray,
  // getNextBounce,
  trimActivePlayerList,
  decrementAfterImage,
  sleep,
  callSleep,
}

function makeid(length) {
   var result           = '';
   // var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var characters       = 'A';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

// function ouijaGoToLetter(state, letter) {
//    // console.log("made it to ouijaGoToLetter")
//    // xstart = state.planchette.pos.x;
//    // xend = OUIJA_CODES[letter].x;
//    // ystart = state.planchette.pos.y;
//    // yend = OUIJA_CODES[letter].y;
//    // for ( var i = 0; i < 100; i++ ) {

//    // }
//    ouijaAlphabetLength = Object.keys(OUIJA_CODES).length;
//    for ( var i = 0; i < ouijaAlphabetLength - 1; i++ ) {
//       if (OUIJA_CODES[i].letter === letter) {
//          state.planchette.pos.x = OUIJA_CODES[i].x
//          state.planchette.pos.y = OUIJA_CODES[i].y
//       }
//    }
//   return state;
// }

// function ouijaGetLetter(state) {
//    letter = '_';

//    // ouijaAlphabetLength = Object.keys(OUIJA_CODES).length;
//    ouijaAlphabetLength = state.numSpirits;
//    // console.log(ouijaAlphabetLength);
//    // console.log("ouijaAlphabetLength: " + ouijaAlphabetLength);
//    // console.log("state.planchette.pos.x: " + state.planchette.pos.x);
//    posx = state.planchette.pos.x;
//    posy = state.planchette.pos.y;

//    delta_theta = 360 / ouijaAlphabetLength;
//    for ( var i = 0; i < ouijaAlphabetLength; i++ ) {
//       // console.log(i)
//       theta = i * delta_theta;
//       // console.log(theta)
//       codx = CANVAS_WIDTH / 2 + Math.round(PEOPLE_RADIUS * Math.cos(theta  * (Math.PI / 180)));
//       cody = CANVAS_HEIGHT / 2 + Math.round(PEOPLE_RADIUS * Math.sin(theta  * (Math.PI / 180)));
//       distance = Math.sqrt(Math.pow(codx - posx, 2) + Math.pow(cody - posy, 2));
//       // console.log(distance)
//       if (distance <= 15) {
//          letter = '+';
//          // console.log('bounce');
//       }
//    }
//    if (posy >= 494 && posx >= 280 && posx <= 562) {
//       letter = '.'; // i.e., GOODBYE
//    }
//    return letter;
// }


// function getNextBounce(state) {
//    const current_bounce = state.nextBouncePlayerNum;
//    console.log("current_bounce: " + current_bounce)
//    test_array = makeArray(state.numActivePlayers - 1);
//    console.log("test_array: " + test_array)
//    bounce_array = shuffleArray(makeArray(state.numActivePlayers))[0];
//    next_bounce = bounce_array[0];
//    if (next_bounce === current_bounce) {
//       next_bounce = bounce_array[1];
//    }
//    return next_bounce;
// }


function makeArray(N) {
   var foo = [];
   for (var i = 0; i <= N; i++) {
      foo.push(i);
   }
   return foo;
}


function shuffleArray(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


function trimActivePlayerList(state, allUsers) {

   // console.log("allUsers.length: " + allUsers.length + ", state.activePlayers.length: " + state.activePlayers.length)

   for ( var i = state.activePlayers.length - 1; i >= 0; i-- ) {
      // console.log("state.activePlayers[i].clientid: " + state.activePlayers[i].clientid)
      // console.log("i: " + i)
      thisClientID = state.activePlayers[i].clientid;
      thisInitials = state.activePlayers[i].initials;
      // console.log("thisClientID: " + thisClientID)
      match = false;
      for ( var j = 0; j < allUsers.length; j++ ) {
         // console.log("j out of allUsers.length: " + j + " / " + allUsers.length)
         if ( thisClientID === allUsers[j] ) {
            match = true;
         }
         // console.log("thisClientID: " + thisClientID + ", allUsers[j]: " + allUsers[j] + ", match: " + match)
      }
      // console.log("match: " + match)
      if (match === false) {
         console.log("Player " + thisClientID + " (" + thisInitials + ")" + " left the room")
         state.activePlayers.splice(i, 1);
      }
   }

   return state;
}


function decrementAfterImage(state) {

    for ( var j = state.activePlayers.length - 1; j >= 0; j-- ) {
      state.activePlayers[j].button = false;
      state.activePlayers[j].afterimage += -1;
      if (state.activePlayers[j].afterimage <= 0) {
        state.activePlayers[j].afterimage  = 0;
      }
    }
   return state;
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      // resolve('resolved');
    }, ms);
  });
}

async function callSleep(ms) {
  // console.log('calling');
  const result = await sleep(ms);
  console.log("made it to callSleep");
  // expected output: "resolved"
}
