require('date-utils');

class Utils {
  constructor() {

  }
  getCurrentTimeInSeconds() {
    let date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    return(h*60*60 + m*60 + s);
  }

  getYYYYMMDDHHMMSS() {
    function pad2(n) { return n < 10 ? '0' + n : n };
    var date = new Date();
    return date.getFullYear().toString() + '_' + pad2(date.getMonth() + 1) + '_' + pad2( date.getDate()) + '_' + pad2( date.getHours() ) + '_' + pad2( date.getMinutes() ) + '_' + pad2( date.getSeconds() );
  }

  getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = Utils;