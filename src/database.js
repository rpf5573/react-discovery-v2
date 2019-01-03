const util = require('util');
const mysql = require('mysql');
let config = {
  connectionLimit: 30,
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: `discovery_${process.env.DCV}`
};
if ( process.env.NODE_ENV == 'production' ) {
  config.password = 'thoumas138';
}
const pool = mysql.createPool(config);

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
    }
  }

  if (connection) connection.release()

  return
})

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query)

module.exports = pool