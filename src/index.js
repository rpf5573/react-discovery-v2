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

// entrance
// require('./entrance/init')(app, pool);

// admin
require('./admin/init')(app, path, multer, pool);

app.use(express.static('public'));

const PORT = process.env.PORT || 8080;
app.listen(PORT);