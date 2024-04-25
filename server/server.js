const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const PORT = process.env.SERVER_PORT || 3000;
const routes = require("./routes/routes");

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`server is runing on http://localhost:${PORT}`);
});
