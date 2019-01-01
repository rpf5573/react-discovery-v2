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
const sessionStore = new MySQLStore({
  schema: {
    tableName: 'dc_sessions'
  }
}/* session store options */, pool);

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
require('./entrance/init')(app, pool);

// admin
require('./admin/init')(app, path, multer, pool);

// user
require('./user/init')(app, path, multer, pool, io);

// assist
require('./assist/init')(app, pool);

// warehouse
require('./warehouse/init')(app, pool);

app.use(express.static('public'));

const PORT = process.env.PORT || 8080;
server.listen(PORT);

// for real time puzzle update
io.on('connection', function(socket) {
  console.log( 'socket is connected !' );
  socket.on('open_puzzle_box', function(data) {
    console.log( 'data : ', data );
    io.emit('puzzle_box_opened', data);
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  })
});