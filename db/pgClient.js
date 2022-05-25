const { Pool, Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "NotNow",
  password: "hejdu123",
  port: 5000
});

module.exports = client;
