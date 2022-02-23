const { FRAME_RATE } = require('./constants');
const { OUIJA_CODES } = require('./constants');
const { CANVAS_WIDTH } = require('./constants');
const { CANVAS_HEIGHT } = require('./constants');
const { PEOPLE_RADIUS } = require('./constants');



module.exports = {
  makeid,
  makeArray,
  shuffleArray,
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
  console.log("made it to callSleep");
  const result = await sleep(ms);
  // expected output: "resolved"
}
