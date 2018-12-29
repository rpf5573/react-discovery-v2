const path = require('path');
const template = require('./assist-client/template');

module.exports = (app, DCQuery) => {
  app.get('/', (req, res) => {
    let document = template(req.query.message);
    return res.set('Content-Type', 'text/html').end(document);
  });
}