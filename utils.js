const ALPHA = " abcdefghijklmnopqrstuvwxyz";

function getAlphaIndex(char) {
  let idx = ALPHA.indexOf(char.toLowerCase());
  return idx === -1 ? 0 : idx;
}

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scratchTanh(x) {
  return Math.tanh(x);
}

const toDeg = (rad) => rad * (180 / Math.PI);
const toRad = (deg) => deg * (Math.PI / 180);

function scratchAtan(val) {
  return toDeg(Math.atan(val));
}

function scratchSin(deg) {
  return Math.sin(toRad(deg));
}
