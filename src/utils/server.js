var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var archive = require('./zip');

function getCurrentTimeInSeconds() {
  let currentTime = moment().format('HH:mm:ss');
  return moment.duration( currentTime ).asSeconds();
}

function getYYYYMMDDHHMMSS() {
  function pad2(n) { return n < 10 ? '0' + n : n };
  var date = new Date();
  return date.getFullYear().toString() + '_' + pad2(date.getMonth() + 1) + '_' + pad2( date.getDate()) + '_' + pad2( date.getHours() ) + '_' + pad2( date.getMinutes() ) + '_' + pad2( date.getSeconds() );
}

module.exports = {
  getCurrentTimeInSeconds,
  getYYYYMMDDHHMMSS,
  archive
}