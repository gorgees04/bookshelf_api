const db = require("../db");
const { uploadFile } = require("../utils/fileUpload/filesStorage");
const { capitalize } = require("../utils/functions");

// POST::create a new book
const createBook = async (req, res) => {
  const { bookName, description, bookUrl, status, genre, authorName } =
    req.body;
  try {
    const user = await db.query("SELECT * FROM users WHERE user_id=$1", [
      req.userId,
    ]);
    if (!user.rows[0])
      return res.status(401).json({ message: "Access denied" });

    // get the pdf file url
    const pdfFile = req.file;
    let pdfFileUrl;
    if (pdfFile) {
      pdfFileUrl = await uploadFile(pdfFile, "bookshelf-app-books");
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
        status.toLowerCase() || "public",
        genreQuery.rows[0].genre_id,
        user.rows[0].user_id,
        author.rows[0].author_id,
      ]
    );
    return res
      .status(200)
      .json({ message: "new book created", book: book.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// PUT::update a single book
const updateBook = async (req, res) => {
  const { id } = req.params;
  const { bookName, description, bookUrl, status, genre, authorName } =
    req.body;
  try {
    const user = await db.query("SELECT * FROM users WHERE user_id=$1", [
      req.userId,
    ]);
    if (!user.rows[0])
      return res.status(401).json({ message: "Access denied" });

    if (genre === "public" || genre === "private") {
      await db.query(`UPDATE genres SET genre = $1 WHERE book_id = $2`, [
        genre,
        id,
      ]);
    }

    const updateQuery = `
      UPDATE books 
      SET COALESCE($1, book_name), 
      WHERE book_id = $5 RETURNING *
    `;
    const updatedBook = await db.query(updateQuery, [
      bookName,
      description,
      bookUrl,
      status,
      id,
    ]);

    return res.status(200).json({ book: updatedBook.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE::delete a single book
const deleteBook = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createBook, updateBook, deleteBook };
