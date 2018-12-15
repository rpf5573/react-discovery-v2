export const OFF = 0;
export const ON = 1;
export const START = '시작';
export const STOP = '정지';
export function getCurrentTimeInSeconds() {
  let date = new Date();
  let h = date.getHours();
  let m = date.getMinutes();
  let s = date.getSeconds();
  return(h*60*60 + m*60 + s);
}
export function secondToMinute(second) {
  if ( second > 0 ) {
    let m = parseInt(second/60);
    let s = parseInt(second%60);
    return `${m}분 ${s}초`;
  } else {
    let m = parseInt(-second/60);
    let s = parseInt(-second%60);
    return `-${m}분 ${s}초`;
  }
}

export function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function isValidURL(url) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?'+ // port
  '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
  '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(url);
}