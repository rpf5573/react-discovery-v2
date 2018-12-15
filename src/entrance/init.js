module.exports = (app, mysql) => {
  const DCQuery = new (require('../query'))(mysql);
  require('./entranceRoute')(app, DCQuery);
}