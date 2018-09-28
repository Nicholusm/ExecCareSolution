const sql = require("mssql");

const config = {
    sql: function () {
        return "mssql://sa:1964587912Amo@localhost/HealthManagement";

    }
};

let pool = sql.connect(
  config.sql(),
  err => {
    if (err) throw err;
  }
);

let poolConfiguration = {
  getPool: function() {
    return pool;
  }
};

/*
const displayItems = await pool
      .getPool()
      .request()
      .input("InternalTabId", sql.Int, req.params.id)
      .execute("GetDisplayItemsForCategory");
*/

module.exports = poolConfiguration;


