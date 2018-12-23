const utils = new(require('./utils'))();

class DCQuery {
  constructor(mysql) {
    this.mysql = mysql;
    this.tables = {
      meta: 'dc_meta',
      teamPasswords: 'dc_team_passwords',
      timer: 'dc_timer',
      points: 'dc_points',
      puzzle: 'dc_puzzle',
      postInfo: 'dc_post_info'
    }
    this.meta = new Meta(this.tables.meta, this.mysql);
    this.teamPasswords = new TeamPasswords(this.tables.teamPasswords, this.mysql);
    this.timer = new Timer(this.tables.timer, this.mysql);
    this.points = new Points(this.tables.points, this.mysql);
    this.puzzle = new Puzzle(this.tables.puzzle, this.mysql);
    this.postInfo = new PostInfo(this.tables.postInfo, this.mysql);
  }
  async getInitialState(role) {
    switch( role ) {
      case 'admin':
        console.log( 'admin switch', ' is called' );
        var teamPasswords = await this.teamPasswords.getAll();
        var teamCount = await this.teamPasswords.getTeamCount();
        var metas = await this.meta.get(['laptime', 'company_image', 'map', 'puzzlebox_count', 'original_eniac_words', 'lastbox_google_drive_url', 'eniac_state', 'lastbox_state', 'admin_passwords', 'mapping_points']);
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
        console.log( 'user switch', ' is called' );
        var metas = await this.meta.get(['laptime', 'company_image', 'map', 'puzzlebox_count', 'original_eniac_words', 'random_eniac_words', 'lastbox_google_drive_url', 'lastbox_state', 'mapping_points']);
        var teamCount = await this.teamPasswords.getTeamCount();
        var points = await this.points.get('useable');
        var puzzleColonInfo = await this.puzzle.getAll();
        return {
          ...metas,
          teamCount,
          points,
          puzzleColonInfo
        };
        
      default:
        return {};
    }
  }
  async resultData() {
    let meta = await this.meta.get(['mapping_points', 'total_team_count']);
    let total_team_count = meta.total_team_count;

    let points = await this.points.getAll();
    let puzzles = await this.puzzle.getAll();

    var rows = [];

    for( var i = 0; i < total_team_count; i++ ) {
      const puzzleNumbers = (function(raw) {
        try {
            return JSON.parse(raw);
        } catch (err) {
            return [];
        }
      })(puzzles[i].numbers);

      let row = {
        team: i+1,
        useable: points[i].useable,
        stack: points[i].stack,
        timer: points[i].timer,
        eniac: points[i].eniac,
        puzzle: points[i].puzzle,
        puzzleOpenCount: puzzleNumbers.length,
        wordPuzzle: 10, // temp
        totalPoint: points[i].useable + points[i].timer + points[i].eniac + points[i].puzzle,
        rank: total_team_count
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
    var result = this.meta.reset();
    if ( result.err ) {
      return result;
    }
    result = this.points.reset();
    if ( result.err ) {
      return result;
    }

    result = this.puzzle.reset();
    if ( result.err ) {
      return result;
    }

    result = this.teamPasswords.reset();
    if ( result.err ) {
      return result;
    }

    result = this.timer.reset();
    return result;
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
    const sql = `UPDATE ${this.table} SET meta_value = '${value}' WHERE meta_key = '${key}'`;
    const result = await this.mysql.query(sql);
    return result;
  }
  async reset() {
    var sql = `UPDATE ${this.table} SET meta_value = 0 WHERE meta_key IN ('total_team_count', 'game_state', 'posts_count', 'lastbox_state', 'laptime', 'puzzlebox_count')`;
    var result = await this.mysql.query(sql);
    if ( result.err ) {
      return result;
    }

    sql = `UPDATE ${this.table} SET meta_value = NULL WHERE meta_key IN ('company_image', 'map', 'original_eniac_word', 'random_eniac_words', 'lastbox_google_drive_url')`;
    var result = await this.mysql.query(sql);
    return result;
  }
}

class TeamPasswords {
  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }
  async getAll() {
    const sql = `SELECT * FROM ${this.table} ORDER BY team`;
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

  async getAll() {
    const sql = `SELECT * FROM ${this.table} ORDER BY team`;
    const result = await this.mysql.query(sql);
    return result;
  }

  async updateState(team, state, isAll) {
    var startTime = 0;
    if ( state ) {
      startTime = utils.getCurrentTimeInSeconds();
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
  async getAll() {
    const sql = `SELECT * FROM ${this.table} ORDER BY team`;
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
    let stack = useable > 0 ? useable : 0; // 왜냐면 얻는 점수만 쌓는거거든 !

    let sql = `UPDATE ${this.table} SET useable = useable + ${useable}, stack = stack + ${stack}, timer = timer + ${timer}, eniac = eniac + ${eniac}, puzzle = puzzle + ${puzzle} WHERE team = ${team}`;
    let result = await this.mysql.query(sql);
    return result;
  }
  async reset() {
    let sql = `UPDATE ${this.table} SET useable = 0, stack = 0, timer = 0, eniac = 0, puzzle = 0`;
    let result = await this.mysql.query(sql);
    return result;
  }
}

class Puzzle {
  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }
  async getAll() {
    const sql = `SELECT * FROM ${this.table} ORDER BY team`;
    const result = await this.mysql.query(sql);
    return result;
  }
  async get(team) {
    const sql = `SELECT * FROM ${this.table} WHERE team=${team}`;
    const result = await this.mysql.query(sql);

    return result;
  }
  async update(team, boxNumber) {
    let puzzleColonInfo = await this.get(team);

    console.log( 'puzzleColonInfo : ', puzzleColonInfo );

    let puzzleNumbers = (function(raw) {
      try {
        console.log( 'puzzle number json parse raw : ', raw );
        if ( raw == null ) {
          return [];
        }
        return JSON.parse(raw);
      } catch (err) {
          console.log( 'err in JSON.parse : ', err );
          return [];
      }
    })(puzzleColonInfo[0].numbers);

    puzzleNumbers.push(boxNumber);
    
    const sql = `UPDATE ${this.table} SET numbers='${JSON.stringify(puzzleNumbers)}' WHERE team=${team}`;
    const result = await this.mysql.query(sql);
    return result;
  }
  async reset() {
    let sql = `UPDATE ${this.table} SET numbers = ${JSON.stringify([])}`;
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
    console.log( 'sql : ', sql );
    let result = await this.mysql.query(sql);
    return result;
  }
  async remove(post) {
    let sql = `DELETE FROM ${this.table} WHERE post=${post}`;
    let result = this.mysql.query(sql);
    return result;
  }
}

module.exports = DCQuery;