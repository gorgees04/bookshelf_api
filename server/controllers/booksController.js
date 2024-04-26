const db = require("../db");
const { uploadFile } = require("../utils/fileUpload/filesStorage");

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
    const newAuthor = await db.query(
      "INSERT INTO authors (author_name) VALUES ($1) RETURNING *",
      [authorName]
    );

    // insert genre
    const newGenre = await db.query(
      "INSERT INTO genres (genre) VALUES ($1) RETURNING *",
      [genre]
    );

    // insert book
    const book = await db.query(
      "INSERT INTO books (book_name, description, book_url, file_path, status, genre_id, user_id, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        bookName,
        description,
        bookUrl,
        pdfFileUrl,
        status || "public",
        newGenre.rows[0].genre_id,
        user.rows[0].user_id,
        newAuthor.rows[0].author_id,
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

module.exports = { createBook };
