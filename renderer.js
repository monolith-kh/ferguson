// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const CONFIG = require('./config')
const net = require('net')

let client = null;

let backgroundCanvas = null;
let gridCanvas = null;
let deviceCanvas = null;

let consoleLog = null;

let host = null;
let port = null;
let map = null;
let deviceList = null;

let connectBtn = null;
let disconnectBtn = null;


initialize();

connectBtn.addEventListener('click', async () => {

  client = net.createConnection({ host: CONFIG.host, port: CONFIG.port }, () => {
    consoleLog.value = `connect\n${consoleLog.value}`;
    console.log('connected to server');
    connectBtn.disabled = true;
    disconnectBtn.disabled = false;
  });

  client.on('error', () => {
    consoleLog.value = `connect error\n${consoleLog.value}`;
    console.log('connection error');
  });

  client.on('data', (data) => {
    let map = JSON.parse(data.toString().replaceAll("\'", "\""));
    consoleLog.value = `${getFullTimestamp()}\t${data.toString()}\n${consoleLog.value}`;
    drawDevice(map);
  });
  
  client.on('end', () => {
    console.log('disconnected from server');
  });
  
  if(true) {
    getMap();
  }
})

disconnectBtn.addEventListener('click', async () => {
  disconnect();
  consoleLog.value = `disconnected\n${consoleLog.value}`;
  connectBtn.disabled = false;
  disconnectBtn.disabled = true;
})

function getMap() {
  client.write(':/map\n');
  setTimeout(getMap, CONFIG.delay);
}

function disconnect() {
  client.write(':/quit\n');
}

function getFullTimestamp () {
  const pad = (n,s=2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
  const d = new Date();
  return `${pad(d.getFullYear(),4)}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(),3)}`;
}

function drawGrid() {
  gridContext.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  for (var x = 0; x <= CONFIG.map.width; x += CONFIG.map.offset) {
    gridContext.moveTo(x, 0);
    gridContext.lineTo(x, CONFIG.map.height);
  }
  for (var y = 0; y <= CONFIG.map.height; y += CONFIG.map.offset) {
    gridContext.moveTo(0, y);
    gridContext.lineTo(CONFIG.map.width, y);
  }
  gridContext.stroke();
}

function drawDevice(map) {
  deviceList.innerHTML = '';
  deviceContext.clearRect(0, 0, deviceCanvas.width, deviceCanvas.height);
  deviceContext.beginPath();
  for (let key in map) {
    let data = map[key].split(',');
    deviceContext.fillText(`${key}`, parseInt(data[0]), CONFIG.map.height-parseInt(data[1]));
    deviceContext.moveTo(parseInt(data[0]), CONFIG.map.height-parseInt(data[1]));
    deviceContext.arc(parseInt(data[0]), CONFIG.map.height-parseInt(data[1]), CONFIG.vehicle.radius, 0, Math.PI*2, true);
    deviceContext.stroke();
    let text_li = document.createElement('li');
    text_li.appendChild(document.createTextNode(`${key}: ${data[0]}, ${data[1]}, ${data[2]} (${data[3]})`));
    deviceList.appendChild(text_li);
  }
}

function initialize() {
  backgroundCanvas = document.getElementById('background-layer');
  backgroundCanvas.width = CONFIG.map.width;
  backgroundCanvas.height = CONFIG.map.height;

  gridCanvas = document.getElementById('grid-layer');
  gridCanvas.width = CONFIG.map.width;
  gridCanvas.height = CONFIG.map.height;
  gridContext = gridCanvas.getContext('2d');
  gridContext.strokeStyle = 'gray';
  gridContext.lineWidth = 30;

  deviceCanvas = document.getElementById('device-layer');
  deviceCanvas.width = CONFIG.map.width;
  deviceCanvas.height = CONFIG.map.height;
  deviceContext = deviceCanvas.getContext('2d');
  deviceContext.font = 'bold 338px arial';
  deviceContext.strokeStyle = 'gray';
  deviceContext.lineWidth = 30;

  consoleLog = document.getElementById('console-log');

  host = document.getElementById('host');
  host.textContent = `host: ${CONFIG.host}`;
  port = document.getElementById('port');
  port.textContent = `port: ${CONFIG.port}`;
  map = document.getElementById('map');
  map.textContent = `map: ${CONFIG.map.width}mm X ${CONFIG.map.height}mm, ${CONFIG.map.offset}mm`;

  deviceList = document.getElementById('device-list');

  connectBtn = document.getElementById('connect');
  connectBtn.disabled = false;

  disconnectBtn = document.getElementById('disconnect');
  disconnectBtn.disabled = true;

  drawGrid();
}
