const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const PORT = process.env.SERVER_PORT;
const routes = require("./routes/routes");
const cookieParser = require("cookie-parser");
const swaggerSetup = require("./swagger/swaggerSetup");

const app = express();
app.use(
  cors({
    origin: process.env.SERVER_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// swagger setup
swaggerSetup(app);

// routes
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`server is runing on port ${PORT}`);
});
