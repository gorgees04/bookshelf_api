const db = require("../db");
const { uploadFile, deleteFile } = require("../utils/fileUpload/filesStorage");
const { capitalize } = require("../utils/functions");
const { validationCreateBook } = require("../utils/validation");

// POST::create a new book
const createBook = async (req, res) => {
  const { bookName, description, bookUrl, status, genre, authorName } =
    req.body;
  try {
    // validation body
    validationCreateBook(req.body);
    // check status
    if (
      status &&
      status.toLowerCase() !== "private" &&
      status.toLowerCase() !== "public"
    ) {
      return res
        .status(400)
        .json({ message: "Status either should be PRIVATE or PUBLIC" });
    }

    // check for user's authorization
    const user = await checkUserAuth(req, res);

    // get the pdf file url
    const pdfFile = req.file;
    let pdfFileUrl;
    if (pdfFile) {
      pdfFileUrl = await uploadFile(pdfFile, "bookshelf-app-books", bookName);
      if (!pdfFileUrl) {
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    // insert auther name
    let author = await db.query("SELECT * FROM authors WHERE author_name=$1", [
      authorName.toLowerCase(),
    ]);

    if (author.rows.length === 0) {
      author = await db.query(
        "INSERT INTO authors (author_name) VALUES ($1) RETURNING *",
        [authorName.toLowerCase()]
      );
    }

    // insert genre
    let genreQuery = await db.query("SELECT * FROM genres WHERE genre=$1", [
      genre.toLowerCase(),
    ]);

    if (genreQuery.rows.length === 0) {
      genreQuery = await db.query(
        "INSERT INTO genres (genre) VALUES ($1) RETURNING *",
        [genre.toLowerCase()]
      );
    }

    // insert book
    const book = await db.query(
      `
      INSERT INTO books (book_name, description, book_url, 
      file_path, status, genre_id, user_id, author_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `,
      [
        capitalize(bookName),
        description,
        bookUrl,
        pdfFileUrl,
        status ? status.toLowerCase() : "public",
        genreQuery.rows[0].genre_id,
        user.rows[0].user_id,
        author.rows[0].author_id,
      ]
    );
    return res
      .status(200)
      .json({ message: "New book created", book: book.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// PUT::update a single book
const updateBook = async (req, res) => {
  const { bookId } = req.params;
  const { bookName, description, bookUrl, status, genre, authorName } =
    req.body;
  try {
    // check status
    if (
      status &&
      status.toLowerCase() !== "private" &&
      status.toLowerCase() !== "public"
    ) {
      return res
        .status(400)
        .json({ message: "Status either should be PRIVATE or PUBLIC" });
    }

    // check for user's authorization
    const user = await checkUserAuth(req, res);

    // get the book with neccessry details
    const bookQuery = `SELECT book_id, book_name, description, book_url, file_path, status, email, author_name, genre FROM books 
                        LEFT JOIN users ON books.user_id = users.user_id
                        LEFT JOIN authors ON books.author_id = authors.author_id
                        LEFT JOIN genres ON books.genre_id = genres.genre_id
                        WHERE book_id=$1 AND books.user_id=$2`;

    const book = await db.query(bookQuery, [bookId, user.rows[0].user_id]);

    // check if the other matches, if not create a new one
    let author;
    if (authorName && authorName.toLowerCase() !== book.rows[0].author_name) {
      author = await db.query(
        "INSERT INTO authors (author_name) VALUES ($1) RETURNING *",
        [authorName.toLowerCase()]
      );
    }
    // check if the genres matches, if not create a new one
    let genres;
    if (genre && genre.toLowerCase() !== book.rows[0].genre) {
      genres = await db.query(
        "INSERT INTO genres (genre) VALUES ($1) RETURNING *",
        [genre.toLowerCase()]
      );
    }

    // get the pdf file url
    const pdfFile = req.file;
    let pdfFileUrl;
    if (pdfFile) {
      deleteFile(book.rows[0].file_path);
      pdfFileUrl = await uploadFile(
        pdfFile,
        "bookshelf-app-books",
        book.rows[0].book_name
      );
      if (!pdfFileUrl) {
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    const updateQuery = `
      UPDATE books 
      SET book_name = COALESCE($1, book_name), description = COALESCE($2, description), 
      book_url = COALESCE($3, book_url), file_path = COALESCE($4, file_path), 
      status = COALESCE($5, status), genre_id = COALESCE($6, genre_id), author_id = COALESCE($7, author_id)
      WHERE book_id=$8 RETURNING *
    `;
    const updatedBook = await db.query(updateQuery, [
      bookName && capitalize(bookName),
      description,
      bookUrl,
      pdfFileUrl,
      status && status.toLowerCase(),
      genres && genres.rows[0].genre_id,
      author && author.rows[0].author_id,
      bookId,
    ]);

    return res
      .status(200)
      .json({ message: "Book updated successful", book: updatedBook.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE::delete a single book
const deleteBook = async (req, res) => {
  const { bookId } = req.params;
  try {
    // check for user's authorization
    const user = await checkUserAuth(req, res);

    const deletedBook = await db.query(
      "DELETE FROM books WHERE book_id=$1 AND user_id=$2 RETURNING *",
      [bookId, user.rows[0].user_id]
    );

    // delete book file
    if (deletedBook.rows[0]) {
      deleteFile(deletedBook.rows[0].file_path);
    }

    // delete genre if it was the only one
    if (deletedBook.rows[0]) {
      const genre = await db.query("SELECT * FROM books WHERE genre_id=$1", [
        deletedBook.rows[0].genre_id,
      ]);
      if (genre.rowCount === 0) {
        await db.query("DELETE FROM genres WHERE genre_id=$1", [
          deletedBook.rows[0].genre_id,
        ]);
      }
    }

    // delete author if it was the only one
    if (deletedBook.rows[0]) {
      const author = await db.query("SELECT * FROM books WHERE author_id=$1", [
        deletedBook.rows[0].author_id,
      ]);
      if (author.rowCount === 0) {
        await db.query("DELETE FROM authors WHERE author_id=$1", [
          deletedBook.rows[0].author_id,
        ]);
      }
    }

    return res
      .status(200)
      .json({ message: "book deleted", book: deletedBook.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// check if user is authrized
async function checkUserAuth(req, res) {
  const user = await db.query("SELECT * FROM users WHERE user_id=$1", [
    req.userId,
  ]);
  if (!user.rows[0]) return res.status(401).json({ message: "Access denied" });
  return user;
}
module.exports = { createBook, updateBook, deleteBook };
