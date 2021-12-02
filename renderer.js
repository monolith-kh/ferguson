// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const net = require('net')

let client = null;

let refresh = true;

document.getElementById('connect').addEventListener('click', async () => {
  client = net.createConnection({ host: '35.180.40.190', port: 8888 }, () => {
    console.log('connected to server');
  });

  client.on('data', (data) => {
    let map = JSON.parse(data.toString().replaceAll("\'", "\""));
    console.log(map);
    document.getElementById('console-log').value = `${getFullTimestamp()}\t${data.toString()}\n${document.getElementById('console-log').value}`;

    let mapCanvas = document.getElementById('map-canvas')
    let ctx = mapCanvas.getContext('2d');
    ctx.font = '68px serif';
    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    for (let key in map) {
      let data = map[key].split(',');
      ctx.fillText(`${key}(${data[3]})`, parseInt(data[0]), parseInt(data[1]));
      console.log(key);
      console.log(data);
    }
  });
  
  client.on('end', () => {
    console.log('disconnected from server');
  });
  
  document.getElementById('console-log').value = 'connected';

  if(refresh) {
    setInterval(getMap, 1000);
  }
})

document.getElementById('disconnect').addEventListener('click', async () => {
  disconnect();
  document.getElementById('console-log').value = 'disconnected';
})

document.getElementById('sync-map').addEventListener('click', async () => {
  getMap();
  console.log('synchronized map');
})

document.getElementById('refresh').addEventListener('click', async () => {
  // refresh = !refresh;
  // let refreshButton = document.getElementById('refresh');
  // refreshButton.disabled = refresh;
  // console.log(`refresh is ${refresh}`);
})

function getMap() {
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
