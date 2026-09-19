require("dotenv").config({ override: true });
var mysql = require("mysql");
var pool = mysql.createPool({
host: process.env.DB_HOST || "localhost",
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME
});
module.exports = pool;

