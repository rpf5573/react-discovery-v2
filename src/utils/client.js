const constants = require('./constants');
const fileExtensions = require('./file-extensions');

function getCurrentTimeInSeconds() {
  let date = new Date();
  let h = date.getHours();
  let m = date.getMinutes();
  let s = date.getSeconds();
  return(h*60*60 + m*60 + s);
}

function secondToMinute(second) {
  if ( second >= 0) {
    let m = parseInt(second/60);
    let s = parseInt(second%60);
    return `${m}분 ${s}초`;
  } else {
    let m = parseInt(-second/60);
    let s = parseInt(-second%60);
    return `-${m}분 ${s}초`;
  }
}

function shuffle(array) {
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

function isValidURL(url) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?'+ // port
  '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
  '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(url);
}

function getFileExtension(filename){
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

function mediaTypeCheck(filename){
  // file 확장자명 체크
  const extension = getFileExtension(filename).toLowerCase();
  for ( var i = 0; i < fileExtensions.image.length; i++ ) {
    if ( extension == fileExtensions.image[i] ) {
      return constants.IMAGE;
    }
  }

  for ( var i = 0; i < fileExtensions.video.length; i++ ) {
    if ( extension == fileExtensions.video[i] ) {
      return constants.VIDEO;
    }
  }

  return null;
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simpleAxios(axios, config) {
  return new Promise(async function(resolve, reject) {
    try {
      let response = await axios(config);
      if ( response.status == 201 ) {
        if (response.data.error) {
          alert(response.data.error);
          reject(response.data.error);
        }
        resolve(response);
      } else {
        alert(constants.ERROR.unknown);
        console.errir( constants.ERROR.unknown );
        reject( constants.ERROR.unknown );
      }
    } catch(e) {
      console.error(e);
      reject(e);
    }
  });
}

function boxNumberToLocation(number, maxLocation) {
  // 일단
  var x = 0, y = 0;
  let quotient = parseInt(number/maxLocation[0]);
  let rest = number - (maxLocation[0] * quotient);
  if ( rest == 0 ) {
    x = maxLocation[0] - 1;
    y = quotient - 1;
  } else {
    x = rest - 1;
    y = quotient;
  }
  return [x, y];
}

function makeGrid(maxLocation, puzzleColonInfos = []) {

  var grid = [...Array(maxLocation[0])].map(e => Array(maxLocation[1]).fill(0));
  for ( var i = 0; i < puzzleColonInfos.length; i++ ) {
    if ( Array.isArray(puzzleColonInfos[i].boxNumbers) ) {
      for ( var z = 0; z < puzzleColonInfos[i].boxNumbers.length; z++ ) {
        const number = puzzleColonInfos[i].boxNumbers[z];
        const location = boxNumberToLocation(number, maxLocation);
        grid[location[0]][location[1]] = puzzleColonInfos[i].team;
      }  
    }
  }

  return grid;
}

/**
 * Convert a base64 string in a Blob according to the data and contentType.
 * 
 * @param b64Data {String} Pure base64 string without contentType
 * @param contentType {String} the content type of the file i.e (image/jpeg - image/png - text/plain)
 * @param sliceSize {Int} SliceSize to process the byteCharacters
 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 * @return Blob
 */
function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
  }

var blob = new Blob(byteArrays, {type: contentType});
return blob;
}

module.exports = {
  getCurrentTimeInSeconds,
  secondToMinute,
  shuffle,
  isValidURL,
  getFileExtension,
  mediaTypeCheck,
  getRandomInteger,
  simpleAxios,
  boxNumberToLocation,
  makeGrid,
  b64toBlob
}