const express = require("express");
const router = express.Router();
const modelsController = require("../controllers/modelsController");

// get genres
router.get("/genres", modelsController.getAllGenres);

// get authors
router.get("/authors", modelsController.getAllAuthors);

module.exports = router;
