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
}

module.exports = Utils;