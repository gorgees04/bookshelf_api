const express = require("express");
const router = express.Router();
const auth = require("./auth");
const books = require("./books");
const user = require("./user");

router.use("/auth", auth);
router.use("/books", books);
router.use("/user", user);

module.exports = router;
