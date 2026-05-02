// layer sizes
const L1 = 104; // input (4 letters * 26)
const L2 = 110; // hidden 1
const L3 = 110; // hidden 2
const L4 = 1600; // output (40x40)

// network data
let input_layer = new Array(L1).fill(0);
let hidden_layer = new Array(L2).fill(0);
let output_layer = new Array(L3).fill(0);
let last_layer = new Array(L4).fill(0);

let w1 = [],
  w2 = [],
  w3 = [];
let b1 = [],
  b2 = [],
  b3 = [];

async function fetchWeights() {
  try {
    const response = await fetch("/weights.txt");
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    const rawData = await response.text();

    return rawData;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

async function init() {
  initNetwork();
  let weightData = localStorage.getItem("texa-ai-weights");

  if (!weightData) {
    weightData = await fetchWeights();

    if (weightData) {
      console.log("Weights downloaded.");
      saveToStorage(weightData);
    }
  } else {
    console.log("Found weights in LocalStorage.");
  }

  if (weightData) {
    parseWeightString(weightData);
    one_hot("cat ");
    fe();
    draw();
  } else {
    console.warn("Please load weights manually.");
  }
}

function initNetwork(importWeights = false) {
  input_layer = Array.from({ length: L1 }, () => randint(1, 99) / 100);
  hidden_layer = Array.from({ length: L2 }, () => randint(1, 99) / 100);
  output_layer = Array.from({ length: L3 }, () => randint(1, 99) / 100);
  last_layer = Array.from({ length: L4 }, () => randint(1, 99) / 100);

  if (!importWeights) {
    b1 = Array.from({ length: L2 }, () => randint(1, 99) / 1000);
    w1 = Array.from({ length: L1 * L2 }, () => randint(1, 99) / 10000);
    b2 = Array.from({ length: L3 }, () => randint(1, 99) / 1000);
    w2 = Array.from({ length: L2 * L3 }, () => randint(-99, 1) / 10000);
    b3 = Array.from({ length: L4 }, () => randint(1, 99) / 1000);
    w3 = Array.from({ length: L3 * L4 }, () => randint(-99, 1) / 10000);
  }
}

function handleLoadWeights() {
  const rawData = prompt("What's your name?");
  parseWeightString(rawData);
  saveToStorage(rawData);
  fe();
  draw();
}

function parseWeightString(rawData) {
  if (!rawData) return;

  let data = rawData.split(",").map(Number);
  let ptr = 0;

  const getChunk = (size) => {
    let chunk = data.slice(ptr, ptr + size);
    ptr += size;
    return chunk;
  };

  w1 = getChunk(L1 * L2);
  w2 = getChunk(L2 * L3);
  w3 = getChunk(L3 * L4);
  b1 = getChunk(L2);
  b2 = getChunk(L3);
  b3 = getChunk(L4);
}

function one_hot(text) {
  input_layer = [];
  for (let i = 0; i < 4; i++) {
    let char = text[i] || " ";
    let idx = getAlphaIndex(char);

    for (let j = 1; j < idx; j++) input_layer.push(0);
    input_layer.push(1);
    for (let j = idx; j < 26; j++) input_layer.push(0);
  }
}

function fe() {
  // input -> hidden 1
  for (let i = 0; i < L2; i++) {
    let pt = 0;
    for (let j = 0; j < L1; j++) {
      pt += input_layer[j] * w1[i * L1 + j];
    }
    hidden_layer[i] = scratchTanh(b1[i] + pt);
  }

  // hidden 1 -> hidden 2
  for (let i = 0; i < L3; i++) {
    let pt = 0;
    for (let j = 0; j < L2; j++) {
      pt += hidden_layer[j] * w2[i * L2 + j];
    }
    output_layer[i] = scratchTanh(b2[i] + pt);
  }

  // hidden 2 -> last layer
  for (let i = 0; i < L4; i++) {
    let pt = 0;
    for (let j = 0; j < L3; j++) {
      pt += output_layer[j] * w3[i * L3 + j];
    }
    last_layer[i] = b3[i] + pt;
  }
}

function draw() {
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const IMAGE_DIMS = 40;
  const PIXEL_SIZE = (WIDTH / 2 + HEIGHT / 2) / IMAGE_DIMS;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let i = 0; i < L4; i++) {
    let val = last_layer[i] || 0;
    let _tick = val * 100;

    let sColor = Math.sqrt(Math.abs(scratchAtan(_tick) * _tick));

    let sBrightness = _tick;

    let sSaturation = scratchSin(_tick) * _tick;

    const h = (sColor % 100) * 3.6;
    const s = Math.max(0, Math.min(100, sSaturation));
    const b = Math.max(0, Math.min(100, sBrightness));

    const lightness = (b / 100) * (100 - s / 2);
    const saturation = s;

    let x = i % 40;
    let y = Math.floor(i / 40);

    ctx.fillStyle = `hsl(${h}, ${saturation}%, ${lightness}%)`;
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
  }
}

function handleAsk() {
  let ans = prompt("enter a 4 letter prompt");
  if (!ans) return;
  ans = ans.padEnd(4, " ").substring(0, 4);
  one_hot(ans);
  fe();
  draw();
}

function handleRandom() {
  let ans = "";
  for (let i = 0; i < 4; i++) ans += ALPHA[randint(0, 26)];
  one_hot(ans);
  fe();
  draw();
}

let isMorfing = false;
async function handleMorf() {
  if (isMorfing) {
    isMorfing = false;
    return;
  }

  isMorfing = true;
  const frames = 100;
  const delay = 1000 / 5;

  for (let f = 0; f < frames; f++) {
    if (!isMorfing) break;

    let rnd = randint(0, L1 - 1);
    input_layer[rnd] += randint(-100, 100) / 100;

    fe();
    draw();

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  isMorfing = false;
}

function saveToStorage(weightString) {
  try {
    localStorage.setItem("texa-ai-weights", weightString);
    console.log("Weights cached.");
  } catch (e) {
    console.warn("Could not cache weights.");
  }
}

function loadFromStorage() {
  const saved = localStorage.getItem("texa-ai-weights");
  if (saved) {
    console.log("Found weights in LocalStorage, loading..");
    parseWeightString(saved);
    return true;
  }
  return false;
}

init();
