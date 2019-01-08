const utils = require('./utils/server');
const constants = require('./utils/constants');

class DCQuery {
  constructor(mysql) {
    this.mysql = mysql;
    this.tables = {
      meta: 'dc_meta',
      teamPasswords: 'dc_team_passwords',
      timer: 'dc_timer',
      points: 'dc_points',
      puzzle: 'dc_puzzle',
      postInfo: 'dc_post_info',
      uploads: 'dc_uploads',
    }
    this.meta = new Meta(this.tables.meta, this.mysql);
    this.teamPasswords = new TeamPasswords(this.tables.teamPasswords, this.mysql);
    this.timer = new Timer(this.tables.timer, this.mysql);
    this.points = new Points(this.tables.points, this.mysql);
    this.puzzle = new Puzzle(this.tables.puzzle, this.mysql);
    this.postInfo = new PostInfo(this.tables.postInfo, this.mysql);
    this.uploads = new Uploads(this.tables.uploads, this.mysql);
  }
  async getInitialState(role) {
    switch( role ) {
      case 'admin':
        var teamCount = await this.teamPasswords.getTeamCount();
        var teamPasswords = await this.teamPasswords.getAll();
        var metas = await this.meta.get(['laptime', 'company_image', 'map', 'puzzlebox_count', 'original_eniac_words', 'random_eniac_words', 'lastbox_google_drive_url', 'eniac_state', 'lastbox_state', 'admin_passwords', 'mapping_points']);
        var teamTimers = await this.timer.getAll();
        var postInfos = await this.postInfo.getAll();
        return {
          ...metas,
          teamPasswords,
          teamCount,
          teamTimers,
          postInfos
        };

      case 'user':
        var metas = await this.meta.get(['laptime', 'company_image', 'map', 'puzzlebox_count', 'original_eniac_words', 'random_eniac_words', 'lastbox_google_drive_url', 'lastbox_state', 'mapping_points']);
        var teamCount = await this.teamPasswords.getTeamCount();
        var points = await this.points.get('useable');
        var puzzleColonInfo = await this.puzzle.getAll();
        var postInfos = await this.postInfo.getAll();
        return {
          ...metas,
          teamCount,
          points,
          puzzleColonInfo,
          postInfos
        };

      case 'assist':
        var metas = await this.meta.get(['map', 'random_eniac_words', 'puzzlebox_count', 'lastbox_google_drive_url', 'lastbox_state']);
        var teamCount = await this.teamPasswords.getTeamCount();
        var useablePoints = await this.points.get('useable');
        var postInfos = await this.postInfo.getAll();
        var puzzleColonInfo = await this.puzzle.getAll();
        return {
          ...metas,
          teamCount,
          useablePoints,
          postInfos,
          puzzleColonInfo
        };
        
      default:
        return {};
    }
  }
  async resultData(teamCount, puzzleBoxCount) {
    let points = await this.points.getAll(teamCount);
    let puzzles = await this.puzzle.getAll(teamCount);

    var rows = [];

    for( var i = 0; i < teamCount; i++ ) {

      const puzzleNumbers = (function(raw) {
        if ( raw == null ) {
          return [];
        }
        try {
          return JSON.parse(raw);
        } catch (err) {
            return [];
        }
      })(puzzles[i].numbers);

      const puzzleBoxOpenRate =  Math.floor( ( puzzleNumbers.length / puzzleBoxCount ) * 100 );

      let row = {
        team: i+1,
        useable: points[i].useable,
        timer: points[i].timer,
        eniac: points[i].eniac,
        puzzle: points[i].puzzle,
        emptyPuzzleBoxOpenCount: puzzles[i].empty_puzzle_box_open_count,
        wordPuzzleBoxOpenCount: puzzles[i].word_puzzle_box_open_count,
        puzzleBoxOpenRate,
        totalPoint: points[i].useable + points[i].timer + points[i].eniac + points[i].puzzle,
        rank: teamCount
      }
      rows.push(row);
    }
    
    // 이제 순위를 매긴다
    for ( var i = 0; i < rows.length; i++ ) {
      let target = rows[i].totalPoint;
      for ( var z = 0; z < rows.length; z++ ) {
        if ( (i != z) && target >= rows[z].totalPoint ) {
          rows[i].rank--;
        }
      }
    }
    return rows;
  }
  async reset() {
    this.meta.reset();
    this.points.reset();
    this.puzzle.reset();
    this.teamPasswords.reset();
    this.timer.reset();
    this.postInfo.reset();
    this.uploads.reset();
  }
}

class Meta {
  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }
  // team passwords
  async get(key) {
    // get single value
    if ( ! (key instanceof Array) ) {
      const sql = `SELECT meta_value FROM ${this.table} WHERE meta_key = '${key}'`;
      const result = await this.mysql.query(sql);
      return result[0].meta_value;
    } 
    // get multi value
    else {
      var keys = key.reduce(
        function (cl, a, currIndex, arr) { 
          return cl + (currIndex == 0 ? "" : ",") + "'" + a + "'";
        },
        ""
      );

      const sql = `SELECT meta_key,meta_value FROM ${this.table} WHERE meta_key IN (${keys})`;
      var rows = await this.mysql.query(sql);
      var results = {};
      rows.forEach((obj) => {
        Object.assign(results, {[obj.meta_key]: obj.meta_value});
      });

      return results;
    }
  }
  async update(key, value) {
    let sql = `UPDATE ${this.table} SET meta_value = '${value}' WHERE meta_key = '${key}'`;
    if ( value == null ) {
      sql = `UPDATE ${this.table} SET meta_value = NULL WHERE meta_key = '${key}'`;
    }
    const result = await this.mysql.query(sql);
    return result;
  }
  async reset() {
    var sql = `UPDATE ${this.table} SET meta_value = 0 WHERE meta_key IN ('total_team_count', 'game_state', 'posts_count', 'eniac_state', 'lastbox_state', 'laptime', 'puzzlebox_count')`;
    var result = await this.mysql.query(sql);

    sql = `UPDATE ${this.table} SET meta_value = NULL WHERE meta_key IN ('company_image', 'map', 'original_eniac_words', 'eniac_success_teams', 'random_eniac_words', 'lastbox_google_drive_url')`;
    result = await this.mysql.query(sql);

    // mapping point
    const mappingPoints = {
      timer_plus: 100,
      timer_minus: 100,
      upload: 1000,
      boxOpenGetEmpty: 6000,
      boxOpenGetWord: 9000,
      boxOpenUse: 3000,
      eniac: 20000
    }
    sql = `UPDATE ${this.table} SET meta_value='${JSON.stringify(mappingPoints)}' WHERE meta_key='mapping_points'`;
    result = await this.mysql.query(sql);

    // admin passwords
    const adminPasswords = {
      admin: '1234',
      assist: '4321'
    }
    sql = `UPDATE ${this.table} SET meta_value='${JSON.stringify(adminPasswords)}' WHERE meta_key='admin_passwords'`;
    result = await this.mysql.query(sql);

    // laptime
    sql = `UPDATE ${this.table} SET meta_value=480 WHERE meta_key='laptime'`;
    result = await this.mysql.query(sql);

    return result;
  }
}

class TeamPasswords {
  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }
  async getAll(until = false) {
    let sql = `SELECT * FROM ${this.table} ORDER BY team`;
    if ( until ) {
      sql = `SELECT * FROM ${this.table} WHERE team <= ${until} ORDER BY team`;
    }
    const result = await this.mysql.query(sql);
    return result;
  }
  async update(teamPasswords) {
    var values = "";
    let last = teamPasswords.length - 1;
    for ( var i = 0; i < last; i++ ) {
      values += `('${teamPasswords[i].team}', '${teamPasswords[i].password}'), `;
    }
    values += `('${teamPasswords[last].team}', '${teamPasswords[last].password}')`; // except ','
    const sql = `INSERT INTO ${this.table} (team, password) VALUES ${values} ON DUPLICATE KEY UPDATE password=VALUES(password)`;
    const result = await this.mysql.query(sql);
    return result;
  }
  async getTeamCount() {
    const sql = `SELECT COUNT(password) as team_count FROM ${this.table} WHERE password IS NOT NULL and password != 0`;
    const result = await this.mysql.query(sql);
    return result[0].team_count;
  }
  async reset() {
    let sql = `UPDATE ${this.table} SET password = 0`;
    let result = await this.mysql.query(sql);
    return result;
  }
}

class Timer {
  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }

  async getAll(until = false) {
    let sql = `SELECT * FROM ${this.table} ORDER BY team`;
    if (until) {
      sql = `SELECT * FROM ${this.table} WHERE team <= ${until} ORDER BY team`;
    }
    const result = await this.mysql.query(sql);
    return result;
  }

  async get(team) {
    let sql = `SELECT startTime, state FROM ${this.table} WHERE team = ${team}`;
    let result = await this.mysql.query(sql);
    return result;
  }

  async updateState(team, state, isAll) {
    console.log( 'updateState', ' is called' );
    var startTime = 0;
    if ( state ) {
      startTime = utils.getCurrentTimeInSeconds();
      console.log( 'startTime : ', startTime );
    }
    var sql = `UPDATE ${this.table} SET state=${state}, startTime=${startTime} WHERE team=${team}`;
    if ( isAll ) {
      sql = `UPDATE ${this.table} SET state=${state}, startTime=${startTime}`;
    }
    const result = await this.mysql.query(sql);
    return result;
  }

  async reset() {
    let sql = `UPDATE ${this.table} SET startTime = 0, state = 0`;
    let result = this.mysql.query(sql);
    return result;
  }
}

class Points {
  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }
  async getAll(until = false) {
    let sql = `SELECT * FROM ${this.table} ORDER BY team`;
    if ( until ) {
      sql = `SELECT * FROM ${this.table} WHERE team <= ${until} ORDER BY team`;
    }
    const result = await this.mysql.query(sql);
    return result;
  }
  async get(column, team) {
    let sql = `SELECT team, ${column} FROM ${this.table} ORDER BY team`;
    if ( team ) {
      sql = `SELECT ${column} FROM ${this.table} WHERE team = ${team}`;
    } 
    const result = await this.mysql.query(sql);
    return result;
  }
  // 이건 관리자페이지에서 한번에 주는거니까 temp option이 필요 없음
  async reward(points) {
    var result = false;
    if ( Array.isArray(points) ) {
      for ( var i = 0; i < points.length; i++ ) {
        result = await this.updateOneRow(points[i]);
      }
    } else {
      result = await this.updateOneRow(points);
    }
    return result;
  }
  async updateOneRow(obj) {
    let team = obj.team;
    let useable = obj.hasOwnProperty('useable') ? obj.useable : 0;
    let timer = obj.hasOwnProperty('timer') ? obj.timer : 0;
    let eniac = obj.hasOwnProperty('eniac') ? obj.eniac : 0;
    let puzzle = obj.hasOwnProperty('puzzle') ? obj.puzzle : 0;
    let temp = obj.hasOwnProperty('temp') ? obj.temp : 0;

    let sql = `UPDATE ${this.table} SET useable = useable + ${useable}, timer = timer + ${timer}, eniac = eniac + ${eniac}, puzzle = puzzle + ${puzzle}, temp = temp + ${temp} WHERE team = ${team}`;
    let result = await this.mysql.query(sql);
    return result;
  }
  async move(team) {
    let result = await this.get('temp', team);
    let temp = result[0].temp;
    result = await this.updateOneRow({
      team,
      useable: temp,
      temp: -temp // 가져온 만큼 빼면 0이 되겠지 !
    });
    return result;
  }
  async reset(col = null, team = null) {
    let sql = `UPDATE ${this.table} SET useable = 0, timer = 0, eniac = 0, puzzle = 0, temp = 0`;
    if ( col && team ) {
      sql = `UPDATE ${this.table} SET ${col} = 0 WHERE team = ${team}`;
    }
    let result = await this.mysql.query(sql);
    return result;
  }
}

class Puzzle {

  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }

  async getAll(until = false) {
    let sql = `SELECT * FROM ${this.table} ORDER BY team`;
    if ( until ) {
      sql = `SELECT * FROM ${this.table} WHERE team <= ${until} ORDER BY team`;
    }
    const result = await this.mysql.query(sql);
    return result;
  }

  async get(team) {
    const sql = `SELECT * FROM ${this.table} WHERE team=${team}`;
    const result = await this.mysql.query(sql);

    return result;
  }

  async update(team, boxNumber, type) {
    let puzzleColonInfo = await this.get(team);
    let puzzleNumbers = (function(raw) {
      try {
        if ( raw == null ) {
          return [];
        }
        return JSON.parse(raw);
      } catch (err) {
          return [];
      }
    })(puzzleColonInfo[0].numbers);

    puzzleNumbers.push(boxNumber);

    const emptyBox = ( type == constants.EMPTY ? 1 : 0 );
    const wordBox = ( type == constants.WORD ? 1 : 0 );
    
    const sql = `UPDATE ${this.table} SET numbers='${JSON.stringify(puzzleNumbers)}', empty_puzzle_box_open_count = empty_puzzle_box_open_count + ${emptyBox}, word_puzzle_box_open_count = word_puzzle_box_open_count + ${wordBox} WHERE team=${team}`;
    const result = await this.mysql.query(sql);
    return result;
  }

  async reset() {
    let sql = `UPDATE ${this.table} SET numbers = NULL, empty_puzzle_box_open_count = 0, word_puzzle_box_open_count = 0`;
    let result = await this.mysql.query(sql);
    return result;
  }

}

class PostInfo {
  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }
  async getAll() {
    const sql = `SELECT post, mission, google_drive_url as googleDriveURL FROM ${this.table} ORDER BY post`;
    const result = await this.mysql.query(sql);
    return result;
  }
  async update(postInfo) {
    postInfo.googleDriveURL = encodeURI(postInfo.googleDriveURL);
    let sql = `INSERT INTO ${this.table} 
              (post, mission, google_drive_url) 
              VALUES(${postInfo.post}, '${postInfo.mission}', '${postInfo.googleDriveURL}') 
              ON DUPLICATE KEY UPDATE 
              post=${postInfo.post}, mission='${postInfo.mission}', google_drive_url='${postInfo.googleDriveURL}'`;
    let result = await this.mysql.query(sql);
    return result;
  }
  async remove(post) {
    let sql = `DELETE FROM ${this.table} WHERE post=${post}`;
    let result = this.mysql.query(sql);
    return result;
  }
  async reset() {
    let sql = `DELETE FROM ${this.table}`;
    let result = await this.mysql.query(sql);
    return result;
  }
}

class Uploads {
  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }

  async get(team) {
    let sql = `SELECT files, temp FROM ${this.table} WHERE team = ${team}`;
    let result = await this.mysql.query(sql);
    return result;
  }

  async getAll(until = false) {
    let sql = `SELECT team, files FROM ${this.table} ORDER BY team`;
    if ( until ) {
      sql = `SELECT team, files FROM ${this.table} WHERE team <= ${until} ORDER BY team`;
    }
    let result = await this.mysql.query(sql);
    return result;
  }

  async add(team, filename, isTemp = false) {
    let result = await this.get(team);
    let col = isTemp ? 'temp' : 'files'; // 아주 기발했다 !
    let files = (result[0][col] ? JSON.parse(result[0][col]) : []);
    files.push(filename);
    let sql = `UPDATE ${this.table} SET ${col} = '${JSON.stringify(files)}' WHERE team = ${team}`;
    result = await this.mysql.query(sql);

    return result;
  }

  async remove(team, filename) {
    let result = await this.get(team);
    let files = JSON.parse(result[0].files);

    if ( Array.isArray(files) ) {
      files = files.filter(val => val !== filename);
    }

    let sql = `UPDATE ${this.table} SET files = '${JSON.stringify(files)}' WHERE team = ${team}`;
    if ( files.length == 0 ) {
      sql = `UPDATE ${this.table} SET files = NULL WHERE team = ${team}`;
    }
    result = await this.mysql.query(sql);

    return result;
  }

  async move(team) {
    let result = await this.get(team);
    let temp = (result[0].temp ? JSON.parse(result[0].temp) : []);
    if ( temp.length > 0 ) {
      let files = (result[0].files ? JSON.parse(result[0].files) : []);
      let newFiles = files.concat(temp);
      let sql = `UPDATE ${this.table} SET files = '${JSON.stringify(newFiles)}', temp = NULL WHERE team = ${team}`;
      result = await this.mysql.query(sql);
    }
    return result;
  }

  async reset(col = null, team = null) {
    let sql = `UPDATE ${this.table} SET files = NULL, temp = NULL`;
    if ( col && team ) {
      sql = `UPDATE ${this.table} SET ${col} = NULL WHERE team = ${team}`;
    }
    let result = this.mysql.query(sql);
    return result;
  }
}

module.exports = DCQuery;