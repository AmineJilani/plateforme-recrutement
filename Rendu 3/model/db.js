var mysql = require("mysql");
var pool = mysql.createPool({
host: "localhost", //ou localhost
user: "root",
password: "Test123*",
database: "db_recrut"
});
module.exports = pool;
