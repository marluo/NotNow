const knex = require("knex");

const database = knex({
  client: "pg",
  connection: {
    host: "localhost",
    port: "5000",
    user: "postgres",
    password: "hejdu123",
    database: "NotNow"
  }
});

module.exports = database;
