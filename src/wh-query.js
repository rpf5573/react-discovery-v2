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
    const sql = `SELECT id, mission, url as url FROM ${this.table} ORDER BY id`;
    const result = await this.mysql.query(sql);
    return result;
  }
  async insert(postInfo) {
    postInfo.url = encodeURI(postInfo.url);
    let sql = `INSERT INTO ${this.table} 
              (mission, url)
              VALUES('${postInfo.mission}', '${postInfo.url}')`;
    let result = await this.mysql.query(sql);
    return result;
  }
  async update(postInfo) {
    postInfo.url = encodeURI(postInfo.url);
    let sql = `UPDATE ${this.table}
              SET url='${postInfo.url}', mission='${postInfo.mission}'
              WHERE id=${postInfo.id}`;
    let result = await this.mysql.query(sql);
    return result;
  }
  async remove(id) {
    let sql = `DELETE FROM ${this.table} WHERE id='${id}'`;
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