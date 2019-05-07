const utils = require('./utils/server');
const constants = require('./utils/constants');

class DCQuery {
  constructor(mysql) {
    this.mysql = mysql;
    this.tables = {
      metas: 'dc_metas',
      teamPasswords: 'dc_teamPasswords',
      timers: 'dc_timers',
      points: 'dc_points',
      puzzles: 'dc_puzzles',
      postInfos: 'dc_postInfos',
      uploads: 'dc_uploads',
    }
    this.metas = new Metas(this.tables.metas, this.mysql);
    this.teamPasswords = new TeamPasswords(this.tables.teamPasswords, this.mysql);
    this.timers = new Timers(this.tables.timers, this.mysql);
    this.points = new Points(this.tables.points, this.mysql);
    this.puzzles = new Puzzles(this.tables.puzzles, this.mysql);
    this.postInfos = new PostInfos(this.tables.postInfos, this.mysql);
    this.uploads = new Uploads(this.tables.uploads, this.mysql);
  }
  async getInitialState(role) {
    switch( role ) {
      case 'admin':
        var teamCount = await this.teamPasswords.getTeamCount();
        var teamPasswords = await this.teamPasswords.getAll();
        var metas = await this.metas.get(['laptime', 'companyImage', 'map', 'puzzleBoxCount', 'originalEniacWords', 'randomEniacWords', 'lastBoxUrl', 'eniacState', 'tempBoxState', 'lastBoxState', 'adminPasswords', 'mappingPoints']);
        var teamTimers = await this.timers.getAll();
        var postInfos = await this.postInfos.getAll();
        return {
          ...metas,
          teamPasswords,
          teamCount,
          teamTimers,
          postInfos
        };

      case 'user':
        var metas = await this.metas.get(['laptime', 'companyImage', 'map', 'puzzleBoxCount', 'originalEniacWords', 'randomEniacWords', 'tempBoxState', 'lastBoxUrl', 'lastBoxState', 'mappingPoints']);
        var teamCount = await this.teamPasswords.getTeamCount();
        var points = await this.points.get('useable');
        var puzzleColonInfos = await this.puzzles.getAll();
        var postInfos = await this.postInfos.getAll();
        return {
          ...metas,
          teamCount,
          points,
          puzzleColonInfos,
          postInfos
        };

      case 'assist':
        var metas = await this.metas.get(['map', 'randomEniacWords', 'puzzleBoxCount', 'lastBoxUrl', 'lastBoxState']);
        var teamCount = await this.teamPasswords.getTeamCount();
        var useablePoints = await this.points.get('useable');
        var postInfos = await this.postInfos.getAll();
        var puzzleColonInfos = await this.puzzles.getAll();
        return {
          ...metas,
          teamCount,
          useablePoints,
          postInfos,
          puzzleColonInfos
        };
        
      default:
        return {};
    }
  }
  async resultData(teamCount, puzzleBoxCount) {
    let points = await this.points.getAll(teamCount);
    let puzzles = await this.puzzles.getAll(teamCount);

    var rows = [];

    for( var i = 0; i < teamCount; i++ ) {

      const boxNumbers = (function(raw) {
        if ( raw == null ) {
          return [];
        }
        try {
          return JSON.parse(raw);
        } catch (err) {
            return [];
        }
      })(puzzles[i].boxNumbers);

      const puzzleBoxOpenRate =  Math.floor( ( boxNumbers.length / puzzleBoxCount ) * 100 );

      let row = {
        team: i+1,
        useable: points[i].useable,
        timer: points[i].timer,
        eniac: points[i].eniac,
        puzzle: points[i].puzzle,
        bingo: points[i].bingo,
        emptyBoxOpenCount: puzzles[i].emptyBoxOpenCount,
        wordBoxOpenCount: puzzles[i].wordBoxOpenCount,
        puzzleBoxOpenRate,
        totalPoint: points[i].useable + points[i].timer + points[i].eniac + points[i].puzzle + points[i].bingo,
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
    this.metas.reset();
    this.points.reset();
    this.puzzles.reset();
    this.teamPasswords.reset();
    this.timers.reset();
    this.postInfos.reset();
    this.uploads.reset();
  }
}

class Metas {
  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }
  // team passwords
  async get(key) {
    // get single value
    if ( ! (key instanceof Array) ) {
      const sql = `SELECT metaValue FROM ${this.table} WHERE metaKey = '${key}'`;
      const result = await this.mysql.query(sql);
      return result[0].metaValue;
    } 
    // get multi value
    else {
      var keys = key.reduce(
        function (cl, a, currIndex, arr) { 
          return cl + (currIndex == 0 ? "" : ",") + "'" + a + "'";
        },
        ""
      );

      const sql = `SELECT metaKey,metaValue FROM ${this.table} WHERE metaKey IN (${keys})`;
      var rows = await this.mysql.query(sql);
      var results = {};
      rows.forEach((obj) => {
        Object.assign(results, {[obj.metaKey]: obj.metaValue});
      });

      return results;
    }
  }
  async update(key, value) {
    let sql = `UPDATE ${this.table} SET metaValue = '${value}' WHERE metaKey = '${key}'`;
    if ( value == null ) {
      sql = `UPDATE ${this.table} SET metaValue = NULL WHERE metaKey = '${key}'`;
    }
    const result = await this.mysql.query(sql);
    return result;
  }
  async reset() {
    var sql = `UPDATE ${this.table} SET metaValue = 0 WHERE metaKey IN ('eniacState', 'tempBoxState', 'lastBoxState', 'laptime', 'puzzleBoxCount')`;
    var result = await this.mysql.query(sql);

    sql = `UPDATE ${this.table} SET metaValue = 1 WHERE metaKey IN ('tempBoxState')`;
    result = await this.mysql.query(sql);

    sql = `UPDATE ${this.table} SET metaValue = NULL WHERE metaKey IN ('companyImage', 'map', 'originalEniacWords', 'eniacSuccessTeams', 'randomEniacWords', 'lastBoxUrl')`;
    result = await this.mysql.query(sql);

    // mapping point
    const mappingPoints = {
      timerPlus: 100,
      timerMinus: 100,
      upload: 1000,
      boxOpenGetEmpty: 2000,
      boxOpenGetWord: 4000,
      boxOpenUse: 1000,
      eniac: 20000,
      bingo: 1000
    }
    sql = `UPDATE ${this.table} SET metaValue='${JSON.stringify(mappingPoints)}' WHERE metaKey='mappingPoints'`;
    result = await this.mysql.query(sql);

    // admin passwords
    const adminPasswords = {
      admin: '1234',
      assist: '4321'
    }
    sql = `UPDATE ${this.table} SET metaValue='${JSON.stringify(adminPasswords)}' WHERE metaKey='adminPasswords'`;
    result = await this.mysql.query(sql);

    // laptime
    sql = `UPDATE ${this.table} SET metaValue=480 WHERE metaKey='laptime'`;
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

class Timers {
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

  async updateState(team, state, restTime, isAll = false) {
    var startTime = 0;
    if ( state ) {
      startTime = utils.getCurrentTimeInSeconds();
    }
    var sql = `UPDATE ${this.table} SET state=${state}, startTime=${startTime}, restTime=${restTime} WHERE team=${team}`;

    // 이렇게 쿼리내용이 빈약한 이유는, 어차피 전체 시작밖에 없기 때문이야. startTime만 저장하면 되는 각!
    if ( isAll ) {
      sql = `UPDATE ${this.table} SET state=${state}, startTime=${startTime}`;
    }
    const result = await this.mysql.query(sql);
    return result;
  }

  async check(team, laptime) {
    let result = await this.get(team);
    let timerState = parseInt(result[0].state);
    if ( ! timerState ) {
      return {
        state: false,
        td: 0
      };
    }
    const startTime = result[0].startTime;
    const currentTime = utils.getCurrentTimeInSeconds();
    let td = laptime - ( currentTime - startTime );
    return {
      state: true,
      td
    }
  }

  async reset() {
    let sql = `UPDATE ${this.table} SET startTime = 0, state = 0, restTime = 0`;
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
  async updateAll(points) {
    var result = false;
    if ( Array.isArray(points) ) {
      for ( var i = 0; i < points.length; i++ ) {
        result = await this.update(points[i]);
      }
    } else {
      result = await this.update(points);
    }
    return result;
  }
  async update(obj) {
    let team = obj.team;
    let useable = obj.hasOwnProperty('useable') ? obj.useable : 0;
    let timer = obj.hasOwnProperty('timer') ? obj.timer : 0;
    let eniac = obj.hasOwnProperty('eniac') ? obj.eniac : 0;
    let puzzle = obj.hasOwnProperty('puzzle') ? obj.puzzle : 0;
    let bingo = obj.hasOwnProperty('bingo') ? obj.bingo : 0;
    let temp = obj.hasOwnProperty('temp') ? obj.temp : 0;

    let sql = `UPDATE ${this.table} SET useable = useable + ${useable}, timer = timer + ${timer}, eniac = eniac + ${eniac}, puzzle = puzzle + ${puzzle}, bingo = bingo + ${bingo}, temp = temp + ${temp} WHERE team = ${team}`;
    let result = await this.mysql.query(sql);
    return result;
  }
  async move(team) {
    let result = await this.get('temp', team);
    let temp = result[0].temp;
    result = await this.update({
      team,
      useable: temp,
      temp: -temp // 가져온 만큼 빼면 0이 되겠지 !
    });
    return result;
  }
  async reset(col = null, team = null) {
    let sql = `UPDATE ${this.table} SET useable = 0, timer = 0, eniac = 0, puzzle = 0, bingo = 0, temp = 0`;
    if ( col && team ) {
      sql = `UPDATE ${this.table} SET ${col} = 0 WHERE team = ${team}`;
    }
    let result = await this.mysql.query(sql);
    return result;
  }
}

class Puzzles {

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
    let puzzleColonInfos = await this.get(team);
    let boxNumbers = (function(raw) {
      try {
        if ( raw == null ) {
          return [];
        }
        return JSON.parse(raw);
      } catch (err) {
          return [];
      }
    })(puzzleColonInfos[0].boxNumbers);

    boxNumbers.push(boxNumber);

    const emptyBox = ( type == constants.EMPTY ? 1 : 0 );
    const wordBox = ( type == constants.WORD ? 1 : 0 );
    
    const sql = `UPDATE ${this.table} SET boxNumbers='${JSON.stringify(boxNumbers)}', emptyBoxOpenCount = emptyBoxOpenCount + ${emptyBox}, wordBoxOpenCount = wordBoxOpenCount + ${wordBox} WHERE team=${team}`;
    const result = await this.mysql.query(sql);
    return result;
  }

  async reset() {
    let sql = `UPDATE ${this.table} SET boxNumbers = NULL, emptyBoxOpenCount = 0, wordBoxOpenCount = 0`;
    let result = await this.mysql.query(sql);
    return result;
  }

}

class PostInfos {
  constructor(table, mysql) {
    this.table = table;
    this.mysql = mysql;
  }
  async getAll() {
    const sql = `SELECT post, mission, url FROM ${this.table} ORDER BY post`;
    const result = await this.mysql.query(sql);
    return result;
  }
  async insert(postInfo) {
    postInfo.url = encodeURI(postInfo.url);
    let sql = `INSERT INTO ${this.table}
              (post, mission, url)
              VALUES(${postInfo.post}, '${postInfo.mission}', '${postInfo.url}')`;
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
    let sql = `SELECT files, temp, uploadTime FROM ${this.table} WHERE team = ${team}`;
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

  async add(team, filename, currentTime, isTemp = false) {
    let result = await this.get(team);
    let col = isTemp ? 'temp' : 'files'; // 아주 기발했다 !
    let files = (result[0][col] ? JSON.parse(result[0][col]) : []);
    files.push(filename);

    let sql = `UPDATE ${this.table} SET ${col} = '${JSON.stringify(files)}'`;
    if ( currentTime > 0 ) { // 항상 넣으면 안되고, 새로운 시간이 들어왔을때만 넣어야되
      sql += `, uploadTime = ${currentTime}`;
    }
    sql += ` WHERE team = ${team}`;
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
      let sql = `UPDATE ${this.table} SET files = '${JSON.stringify(newFiles)}', temp = NULL, uploadTime = 0 WHERE team = ${team}`;
      result = await this.mysql.query(sql);
    }
    return result;
  }

  async getStackFiles(team) {
    let sql = `SELECT team, stackFiles FROM ${this.table} WHERE team = ${team}`;
    let result = await this.mysql.query(sql);
    return result;
  }

  async getAllStackFiles(until = false) {
    let sql = `SELECT team, stackFiles FROM ${this.table} ORDER BY team`;
    if ( until ) {
      sql = `SELECT team, stackFiles FROM ${this.table} WHERE team <= ${until} ORDER BY team`;
    }
    let result = await this.mysql.query(sql);
    return result;
  }

  async addStackFile(team, filename) {
    let result = await this.getStackFiles(team);
    let files = (result[0].stackFiles ? JSON.parse(result[0].stackFiles) : []);
    files.push({
      filename,
      downloaded: false
    });

    let sql = `UPDATE ${this.table} SET stackFiles = '${JSON.stringify(files)}' WHERE team = ${team}`;
    result = await this.mysql.query(sql);
    return result;
  }

  async makeStackFileDownloaded(team, filename) {
    let result = await this.getStackFiles(team);
    let stackFiles = JSON.parse(result[0].stackFiles);
    if ( Array.isArray(stackFiles) ) {
      for ( var i = 0; i < stackFiles.length; i++ ) {
        if ( stackFiles[i].filename == filename ) {
          stackFiles[i].downloaded = true;
        }
      }
    }

    let sql = `UPDATE ${this.table} SET stackFiles = '${JSON.stringify(stackFiles)}' WHERE team = ${team}`;
    result = await this.mysql.query(sql);
    return result;
  }

  async reset(col = null, team = null) {
    let sql = `UPDATE ${this.table} SET files = NULL, temp = NULL, uploadTime = 0, stackFiles = NULL`;
    if ( col && team ) {
      sql = `UPDATE ${this.table} SET ${col} = NULL WHERE team = ${team}`;
    }
    let result = this.mysql.query(sql);
    return result;
  }
}

module.exports = DCQuery;