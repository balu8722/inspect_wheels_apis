const mysql = require("mysql2");
const { ENV_DATA } = require("../config/config");

class databaseFunction {
  db = null;
  dbConfig = {};

  getDBConfig() {
    return this.dbConfig;
  }

  setDBConfig(configObj) {
    this.dbConfig = configObj;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const connection = mysql.createConnection(this.getDBConfig());
      connection.connect((err) => {
        if (err) {
          reject("db connection error");
        }
        resolve("database connected====");
        this.db = connection;
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db?.end((err) => {
        if (err) {
          reject(err);
        }
        resolve("");
      });
    });
  }

  executeQuery(query, values) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connect();
        this.db.query(query, values, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      } catch (err) {
        reject(err);
      } finally {
        await this.close();
      }
    });
  }
}

const mySQLInstance = new databaseFunction();

mySQLInstance.setDBConfig({
  port: ENV_DATA.DB_PORT,
  host: ENV_DATA.DATA_BASE_HOST,
  user: ENV_DATA.DATA_BASE_USER_NAME,
  password: ENV_DATA.DATA_BASE_PASSOWRD,
  database: ENV_DATA.DATA_BASE_NAME,
  multipleStatements: true,
});

module.exports = mySQLInstance;
