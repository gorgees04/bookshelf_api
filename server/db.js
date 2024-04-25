const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// run sql file once connect to the db
const sqlFilePath = path.join(__dirname, "sql", "data.sql");
const sqlFileCreateTables = fs.readFileSync(sqlFilePath, "utf8");

const client = new Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT,
});

// Connect to the database
client
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
    return client.query(sqlFileCreateTables);
  })
  .catch((error) => {
    console.error("Error connecting to PostgreSQL database:", error);
  });

module.exports = client;
