const express = require("express");
const router = express.Router();
const booksController = require("../controllers/booksController");
const authUser = require("../middlewares/authUser");
const { uploadMulter } = require("../middlewares/Multer");

router.use(uploadMulter.single("bookFile"));

router.use(authUser);

// get public books
// router.get("/", booksController.getAllBooks);
// router.get("/:id", booksController.getSingleBook);

// get user's books
// router.get("/user", booksController.getAllUsersBooks);
// router.get("/user", booksController.getSingleUsersBook);

// create a new book
router.post("/new", booksController.createBook);

module.exports = router;
