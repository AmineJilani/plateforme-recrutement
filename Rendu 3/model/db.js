var mysql = require("mysql");
var pool = mysql.createPool({
host: "tuxa.sme.utc", //ou localhost
user: "sr10p056",//my id :sr10p056
password: "buUqMlzQU422", 
database: "sr10p056" //sr10p056
});
module.exports = pool;

