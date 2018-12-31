module.exports = (app, mysql) => {
  const DCQuery = new (require('../query'))(mysql);
  require('./warehouseRoute')(app, DCQuery);
}