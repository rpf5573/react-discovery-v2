if ( ! process.env.DCV ) {
  process.env.DCV = 'v1';
}

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
const session = require('express-session');
const MySQLStore = require('express-mysql-session');

// mysql
const pool = require('./database');
const DCQuery = new (require('./query'))(pool.default);
const WHQuery = new (require('./wh-query'))(pool.warehouse);
const sessionStore = new MySQLStore({
  schema: {
    tableName: 'dc_sessions'
  }
}/* session store options */, pool.default);

const app = express();
app.use(bodyParser.json());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(session({
  secret: 'z',
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));

// websocket for puzzle update
var server = require('http').Server(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);

// entrance
require('./entrance/init')(app, DCQuery);

// admin
require('./admin/init')(app, path, multer, DCQuery);

// user
require('./user/init')(app, path, multer, DCQuery, io);

// assist
require('./assist/init')(app, DCQuery);

// warehouse
require('./warehouse/init')(app, WHQuery);

// media-files
require('./media-files/init')(app, DCQuery);

app.use(express.static('public'));

console.log( 'process.env.NODE_PORT : ', process.env.NODE_PORT );

let PORT = process.env.NODE_PORT || 8081;
server.listen(PORT, '0.0.0.0');

// for real time puzzle update
io.on('connection', function(socket) {
  socket.on('open_puzzle_box', function(data) {
    console.log( 'on open_puzzle_box data : ', data );
    io.emit('puzzle_box_opened', data);
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  })
});