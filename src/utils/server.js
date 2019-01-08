var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

function getCurrentTimeInSeconds() {
  let date = new Date();

  const day = moment().startOf('day');
  console.log( 'day : ', day );

  // myVar = moment.duration('').asSeconds()

  let h = date.getHours();
  let m = date.getMinutes();
  let s = date.getSeconds();

  console.log( 'time : ', h + '-' + m + '-' + s );

  return(h*60*60 + m*60 + s);
}

function getYYYYMMDDHHMMSS() {
  function pad2(n) { return n < 10 ? '0' + n : n };
  var date = new Date();
  return date.getFullYear().toString() + '_' + pad2(date.getMonth() + 1) + '_' + pad2( date.getDate()) + '_' + pad2( date.getHours() ) + '_' + pad2( date.getMinutes() ) + '_' + pad2( date.getSeconds() );
}

module.exports = {
  getCurrentTimeInSeconds,
  getYYYYMMDDHHMMSS
}