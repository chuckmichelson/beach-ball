const FRAME_RATE = 20;
const CANVAS_WIDTH = 838;
const CANVAS_HEIGHT = 554;
const PLANCHETTE_WIDTH = 120;
const PLANCHETTE_HEIGHT = 120;
const MAX_PLAYERS_PER_ROOM = 100;
const AGREE_DURATION = 3000;

const OUIJA_CODES = {
    0 : {letter : '+', x : 204, y : 87 }, // i.e., YES
    1 : {letter : '-', x : 645, y : 87 }, // i.e., NO
    2 : {letter : 'A', x : 111, y : 276 },
    3 : {letter : 'B', x : 162, y : 246 },
    4 : {letter : 'C', x : 220, y : 226 },
    5 : {letter : 'D', x : 265, y : 208 },
    6 : {letter : 'E', x : 316, y : 199 },
    7 : {letter : 'F', x : 364, y : 193 },
    8 : {letter : 'G', x : 418, y : 190 },
    9 : {letter : 'H', x : 472, y : 190 },
    10 : {letter : 'I', x : 523, y : 199 },
    11 : {letter : 'J', x : 562, y : 205 },
    12 : {letter : 'K', x : 613, y : 220 },
    13 : {letter : 'L', x : 662, y : 238 },
    14 : {letter : 'M', x : 721, y : 262 },
    15 : {letter : 'N', x : 115, y : 370 },
    16 : {letter : 'O', x : 163, y : 343 },
    17 : {letter : 'P', x : 205, y : 319 },
    18 : {letter : 'Q', x : 259, y : 298 },
    19 : {letter : 'R', x : 307, y : 283 },
    20 : {letter : 'S', x : 361, y : 274 },
    21 : {letter : 'T', x : 412, y : 268 },
    22 : {letter : 'U', x : 463, y : 268 },
    23 : {letter : 'V', x : 517, y : 274 },
    24 : {letter : 'W', x : 577, y : 289 },
    25 : {letter : 'X', x : 631, y : 316 },
    26 : {letter : 'Y', x : 679, y : 340 },
    27 : {letter : 'Z', x : 724, y : 373 },
    28 : {letter : '1', x : 199, y : 418 },
    29 : {letter : '2', x : 238, y : 418 },
    30 : {letter : '3', x : 283, y : 418 },
    31 : {letter : '4', x : 337, y : 418 },
    32 : {letter : '5', x : 388, y : 418 },
    33 : {letter : '6', x : 439, y : 418 },
    34 : {letter : '7', x : 487, y : 418 },
    35 : {letter : '8', x : 535, y : 418 },
    36 : {letter : '9', x : 583, y : 418 },
    37 : {letter : '0', x : 635, y : 418 },
}



module.exports = {
  FRAME_RATE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLANCHETTE_WIDTH,
  PLANCHETTE_HEIGHT,
  MAX_PLAYERS_PER_ROOM,
  OUIJA_CODES,
  AGREE_DURATION,
}
