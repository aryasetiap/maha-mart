console.log("PostgreSQL connection file executed");

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mahamart",
  password: "arya19032004A*",
  port: 5432,
});

module.exports = pool;
