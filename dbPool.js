const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "en1ehf30yom7txe7.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "yj16v3o1q58u2qv8",
  password: "n2i9a6k97c59uk02",
  database: "p9n7hseexirjce2v"
});

module.exports = pool;