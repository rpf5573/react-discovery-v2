const util = require('util');
const mysql = require('mysql');

/* ------------------------------------------------------------------------- *
 *  Default DB Connection
/* ------------------------------------------------------------------------- */
let config = {
  connectionLimit: 20,
  host: 'localhost',
  user: 'root',
  database: `discovery_${process.env.DCV}`
};
let password = 'root';
if ( process.env.NODE_ENV == 'production' ) {
  password = 'thoumas138';
}
config.password = password;
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
  // 이거 꼭 필요하다. 내가 이 커넥션을 갖고있으면, 다른 사람이 사용하지 못한다.
  // 내가 어차피 pool.query를 써도, 안에서는 다 쓰고 나서 release한다.
  if (connection) connection.release();
  return
});

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);


/* ------------------------------------------------------------------------- *
 *  Post Info Warehouse DB Connection
/* ------------------------------------------------------------------------- */
config.database = 'warehouse'; // db이름만 바꾸면 됨
const warehouse_pool = mysql.createPool(config);
// Ping database to check for common exception errors.
warehouse_pool.getConnection((err, connection) => {
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
  // 이거 꼭 필요하다. 내가 이 커넥션을 갖고있으면, 다른 사람이 사용하지 못한다.
  // 내가 어차피 pool.query를 써도, 안에서는 다 쓰고 나서 release한다.
  if (connection) connection.release();
  return;
});
// Promisify for Node.js async/await.
warehouse_pool.query = util.promisify(warehouse_pool.query);

module.exports = {default: pool, warehouse: warehouse_pool};