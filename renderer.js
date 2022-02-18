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

let networkTime = null;
let dataParseTime = null;
let drawTime = null;
let totalTime = null;

let deviceList = null;

let connectBtn = null;
let disconnectBtn = null;

let deviceImage = null;

let t1 = 0.0;
let t2 = 0.0;
let t3 = 0.0;
let t4 = 0.0;


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
    t2 = performance.now();
    setTimeout(getMap, CONFIG.delay);
    let map = JSON.parse(data.toString().replaceAll("\'", "\""));
    consoleLog.value = `${getFullTimestamp()}\t${data.toString()}\n${consoleLog.value}`;
    drawDevice(map);
    showPerformance();
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
  t1 = performance.now();
  client.write(':/map\n');
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

function showPerformance() {
  networkTime.textContent = `network: ${(t2-t1).toFixed(2)} msec`;
  dataParseTime.textContent = `data parse: ${(t3-t2).toFixed(2)} msec`;
  drawTime.textContent = `draw: ${(t4-t3).toFixed(2)} msec`;
  totalTime.textContent = `total: ${(t4-t1).toFixed(2)} msec`;
}

function drawDevice(map) {
  t3 = performance.now();
  deviceList.innerHTML = '';
  deviceContext.clearRect(0, 0, deviceCanvas.width, deviceCanvas.height);
  for (let key in map) {
    let data = map[key].split(',');
    deviceContext.fillText(
      `${key}`,
      parseInt(data[0]) - CONFIG.vehicle.radius,
      CONFIG.map.height - (parseInt(data[1]) + CONFIG.vehicle.radius));
    deviceContext.drawImage(
      deviceImage,
      parseInt(data[0]) - CONFIG.vehicle.radius,
      CONFIG.map.height - (parseInt(data[1]) + CONFIG.vehicle.radius),
      CONFIG.vehicle.radius*2,
      CONFIG.vehicle.radius*2);
    let text_li = document.createElement('li');
    text_li.appendChild(document.createTextNode(`${key}: ${data[0]}, ${data[1]}, ${data[2]} (${data[3]})`));
    deviceList.appendChild(text_li);
  }
  t4 = performance.now();
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
  gridContext.lineWidth = 3;

  deviceCanvas = document.getElementById('device-layer');
  deviceCanvas.width = CONFIG.map.width;
  deviceCanvas.height = CONFIG.map.height;
  deviceContext = deviceCanvas.getContext('2d');
  deviceContext.font = '34px arial';
  deviceContext.strokeStyle = 'blue';
  deviceContext.lineWidth = 5;

  consoleLog = document.getElementById('console-log');

  host = document.getElementById('host');
  host.textContent = `host: ${CONFIG.host}`;
  port = document.getElementById('port');
  port.textContent = `port: ${CONFIG.port}`;
  map = document.getElementById('map');
  map.textContent = `map: ${CONFIG.map.width}cm X ${CONFIG.map.height}cm, ${CONFIG.map.offset}cm`;

  networkTime = document.getElementById('network-time');
  networkTime.textContent = `network: n/a`;
  dataParseTime = document.getElementById('data-parse-time');
  dataParseTime.textContent = `data parse: n/a`;
  drawTime = document.getElementById('draw-time');
  drawTime.textContent = `draw: n/a`;
  totalTime = document.getElementById('total-time');
  totalTime.textContent = `total: n/a`;

  deviceList = document.getElementById('device-list');

  connectBtn = document.getElementById('connect');
  connectBtn.disabled = false;

  disconnectBtn = document.getElementById('disconnect');
  disconnectBtn.disabled = true;

  deviceImage = new Image();
  deviceImage.src = './assets/sunface.svg';

  drawGrid();
}
