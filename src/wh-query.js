/* ------------------------------------------------------------------------- *
 *  Warehouse Query
/* ------------------------------------------------------------------------- */
class WHQuery {
  constructor(mysql) {
    this.table = 'dc_warehouse';
    this.mysql = mysql;
  }
  async getInitialState() {
    let postInfos = await this.getAll();
    return {
      postInfos
    };
  }
  async getAll() {
    const sql = `SELECT id, mission, google_drive_url as googleDriveURL FROM ${this.table} ORDER BY id`;
    const result = await this.mysql.query(sql);
    return result;
  }
  async insert(postInfo) {
    postInfo.googleDriveURL = encodeURI(postInfo.googleDriveURL);
    let sql = `INSERT INTO ${this.table} 
              (mission, google_drive_url) 
              VALUES('${postInfo.mission}', '${postInfo.googleDriveURL}')`;
    let result = await this.mysql.query(sql);
    return result;
  }
  async update(postInfo) {
    postInfo.googleDriveURL = encodeURI(postInfo.googleDriveURL);
    let sql = `UPDATE ${this.table}
              SET google_drive_url='${postInfo.googleDriveURL}' 
              WHERE mission='${postInfo.mission}'`;
    let result = await this.mysql.query(sql);
    return result;
  }
  async remove(mission) {
    let sql = `DELETE FROM ${this.table} WHERE mission='${mission}'`;
    let result = this.mysql.query(sql);
    return result;
  }
  async reset() {
    let sql = `DELETE FROM ${this.table}`;
    let result = await this.mysql.query(sql);
    return result;
  }
}

module.exports = WHQuery;