const teamColors = [
  '#1B378A', // 1
  '#B6171E', // 2
  '#41B33B', // 3
  '#e162dc', // 4
  '#f76904', // 5
  '#a8f908', // 6
  '#479eef', // 7
  '#F4297D', // 8
  '#1C1A25', // 9
  '#f3f3fd', // 10
  '#9C27B0', // 11
  '#607D8B', // 12
  '#795548', // 13
  '#9E9E9E', // 14
  '#00BCD4'  // 15
]; // 이제 안쓴다 이거는...
const OFF = 0;
const ON = 1;
const START = '시작';
const STOP = '종료';
const WAIT = '준비중';
const IMAGE = 'image';
const VIDEO = 'video';
const EMPTY = 'empty';
const WORD = 'word';
const UPLOAD_TIME_INTERVAL = 180;
const ERROR = {
  unknown: 'ERROR : 알수없는 에러가 발생했습니다'
}

module.exports = {
  teamColors,
  OFF,
  ON,
  START,
  STOP,
  WAIT,
  IMAGE,
  VIDEO,
  EMPTY,
  WORD,
  UPLOAD_TIME_INTERVAL,
  ERROR
}