const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/client.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(PORT);

console.log(`Listening on localhost:${PORT}`);

const determineNewSquare = () => {
  let x = Math.floor(Math.random() * 1000);
  let y = Math.floor(Math.random() * 700);
  const width = 100;
  const height = 100;

  if (x + width >= 1000) {
    x = 1000 - width;
  }

  if (y + height >= 700) {
    y = 700 - height;
  }

  return {
    x, y, width, height,
  };
};

// pass in the http server into socketio and grab the websocket sever as io
const io = socketio(app);
// keep track of the current square
let currentSquare = determineNewSquare();

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', () => {
    socket.emit('sendNewSquare', currentSquare);
    socket.join('room1');
  });
};

const onSquareClick = (sock) => {
  const socket = sock;

  socket.on('squareClicked', () => {
    currentSquare = determineNewSquare();
    io.sockets.in('room1').emit('sendNewSquare', currentSquare);
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
};

io.sockets.on('connection', (socket) => {
  console.log('started');

  onJoined(socket);
  onSquareClick(socket);
  onDisconnect(socket);
});

console.log('Websocket server started');
