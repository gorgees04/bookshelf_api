const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const PORT = process.env.SERVER_PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", async (req, res) => {
  const user = await db.query(`SELECT * FROM books`);
  res.json(user.rows);
});

app.listen(PORT, () => {
  console.log(`server is runing on http://localhost:${PORT}`);
});
