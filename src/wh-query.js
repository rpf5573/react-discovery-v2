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

module.exports = WHQuery;