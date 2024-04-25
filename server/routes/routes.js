const express = require("express");
const router = express.Router();
const auth = require("./auth");
const books = require("./books");

router.use("/auth", auth);
router.use("/books", books);

module.exports = router;
