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

function makeGrid(maxLocation, boxNumbers = [], team) {
  var grid = [...Array(maxLocation[0])].map(e => Array(maxLocation[1]).fill(0));
  if ( Array.isArray(boxNumbers) ) {
    for ( var i = 0; i < boxNumbers.length; i++ ) {
      const number = boxNumbers[i];
      const location = boxNumberToLocation(number, maxLocation);
      grid[location[0]][location[1]] = team;
    }  
  }
  return grid;
}

function checkBingo(grid, maxLocation, boxNumber, team) {
  const xMax = grid.length - 1;
  const yMax = grid[0].length - 1;
  var totalCount = 0;
  let location = boxNumberToLocation(boxNumber, maxLocation);

  /*  가로
  /* --------------------------------------------------- */
  var x = location[0];
  var y = location[1];
  var count = 0;

  /* ------ 맨 왼쪽으로 이동 ------ */
  while(x > 0 && grid[x-1][y] == team) {
    x--;
  }

  /* ------ 오른쪽으로 2개 발견할때까지 이동 왜냐면 내가 방금 누른곳이 거기니까 ------ */
  while(x <= xMax && grid[x][y] == team) {
    x += 1;
    count++;

    // 딱 3개만 발견해야 하는거니까, 3개째는 추가하고 4개째는 멈춰! 4개째 멈췄으니까 5개째는 당연히 없겠지 !
    // 왜 이렇게 하냐고? 다 세고 3개 이상인지 체크하는건 비효율 적이기 때문이지
    if ( count == 3) {
      totalCount += 1;
    }

    // 왜 3개에서 안끝내냐면, 3개 이상(4,5..)이면 안되니까 !
    if ( count == 4 ) {
      // 야 취소취소, 하나 추가한거 취소 퇘퇘퇘 !
      totalCount -= 1;
      break;
    }
  }



  /*  세로
  /* --------------------------------------------------- */
  x = location[0];
  y = location[1];
  count = 0;

  /* ------ 위쪽으로 이동 ------ */
  while(y > 0 && grid[x][y-1] == team) {
    y--;
  }

  /* ------ 아래쪽으로 3개 발견할때까지 이동 ------ */
  while(y <= yMax && grid[x][y] == team) {
    y += 1;
    count++;

    if ( count == 3) {
      totalCount += 1;
    }

    // 왜 3개에서 안끝내냐면, 3개 이상(4,5..)이면 안되니까 !
    if ( count == 4 ) {
      // 야 취소취소, 하나 추가한거 취소 퇘퇘퇘 !
      totalCount -= 1;
      break;
    }
  }



  /*  오른쪽 위 대각
  /* --------------------------------------------------- */
  x = location[0];
  y = location[1];
  count = 0;

  /* ------ 오른쪽위으로 이동 ------ */
  while((y > 0 && x < xMax) && grid[x+1][y-1] == team) {
    x++;
    y--;
  }

  /* ------ 아래왼쪽으로 3개 발견할때까지 이동 ------ */
  while((y <= yMax && x >= 0) && grid[x][y] == team) {
    x--;
    y++;
    count++;

    if ( count == 3) {
      totalCount += 1;
    }

    // 왜 3개에서 안끝내냐면, 3개 이상(4,5..)이면 안되니까 !
    if ( count == 4 ) {
      // 야 취소취소, 하나 추가한거 취소 퇘퇘퇘 !
      totalCount -= 1;
      break;
    }
  }



  /*  왼쪽 위 대각
  /* --------------------------------------------------- */
  x = location[0];
  y = location[1];
  count = 0;

  /* ------ 왼쪽위으로 이동 ------ */
  while((x > 0 && y > 0) && grid[x-1][y-1] == team) {
    x--;
    y--;
  }

  /* ------ 아래오른쪽으로 2개 발견할때까지 이동 ------ */
  while((y <= yMax && x <= xMax) && grid[x][y] == team) {
    x++;
    y++;
    count++;

    if ( count == 3) {
      totalCount += 1;
    }
    if ( count == 4 ) {
      // 야 취소취소, 하나 추가한거 취소 퇘퇘퇘 !
      totalCount -= 1;
      break;
    }
  }

  return totalCount;
}

module.exports = {
  getCurrentTimeInSeconds,
  getYYYYMMDDHHMMSS,
  archive,
  boxNumberToLocation,
  makeGrid,
  checkBingo
}