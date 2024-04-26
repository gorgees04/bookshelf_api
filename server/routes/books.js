const express = require("express");
const router = express.Router();
const booksController = require("../controllers/booksController");
const publicBooksController = require("../controllers/publicBooksController");
const usersBooksController = require("../controllers/usersBooksController");
const authUser = require("../middlewares/authUser");
const { uploadMulter } = require("../middlewares/Multer");

router.use(uploadMulter.single("bookFile"));

router.use(authUser);

// get public books
router.get("/public", publicBooksController.getAllPublicBooks);
router.get("/public/:bookId", publicBooksController.getSinglePublicBook);
// router.get('/public/search', publicBooksController.searchPublicBooks)
// router.get('/public/filter', publicBooksController.filterPublicBooks)

// get user's books
// router.get("/user", booksController.getAllUsersBooks);
// router.get("/user/:bookId", booksController.getSingleUsersBook);
// router.get("/user/search", booksController.searchUsersBook);
// router.get("/user/filter", booksController.filterUsersBook);

// create a new book
router.post("/user/new", booksController.createBook);
router.put("/user/:bookId", booksController.updateBook);
router.delete("/user/:bookId", booksController.deleteBook);

module.exports = router;
