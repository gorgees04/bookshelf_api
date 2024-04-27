const db = require("../db");

// GET::public books
const getAllPublicBooks = async (req, res) => {
  const { limit, offset } = req.params;
  try {
    // if there is no limit pass in params limtit is 20 by default
    const limitBooks = limit || 20;
    const page = (offset || 0) * limitBooks;

    // get all books
    const books = await db.query(
      `
      SELECT b.book_id, b.book_name, b.description, b.book_url, b.file_path, b.status, a.author_name, g.genre,
      JSON_BUILD_OBJECT('user_id', u.user_id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS user
      FROM books b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN authors a ON b.author_id = a.author_id
      LEFT JOIN genres g ON b.genre_id = g.genre_id
      WHERE b.status='public'
      LIMIT $1
      OFFSET $2
    `,
      [limitBooks, page]
    );

    return res.status(200).json(books.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// GET::single public book
const getSinglePublicBook = async (req, res) => {
  const { bookId } = req.params;
  try {
    const book = await db.query(
      `
        SELECT b.book_id, b.book_name, b.description, b.book_url, b.file_path, b.status, a.author_name, g.genre,
        JSON_BUILD_OBJECT('user_id', u.user_id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS user
        FROM books b
        LEFT JOIN users u ON b.user_id = u.user_id
        LEFT JOIN authors a ON b.author_id = a.author_id
        LEFT JOIN genres g ON b.genre_id = g.genre_id
        WHERE b.status='public' AND b.book_id=$1
      `,
      [bookId]
    );

    return res.status(200).json(book.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// GET::search for books where start with (book_name, author)
const searchPublicBooks = async (req, res) => {
  const { bookOrAuthor, limit, offset } = req.query;
  try {
    // if there is no limit pass in params limtit is 20 by default
    const limitBooks = limit || 20;
    const page = (offset || 0) * limitBooks;

    const book = await db.query(
      `
        SELECT b.book_id, b.book_name, b.description, b.book_url, b.file_path, b.status, a.author_name, g.genre,
        JSON_BUILD_OBJECT('user_id', u.user_id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS user
        FROM books b
        LEFT JOIN users u ON b.user_id = u.user_id
        LEFT JOIN authors a ON b.author_id = a.author_id
        LEFT JOIN genres g ON b.genre_id = g.genre_id
        WHERE b.status='public' AND (LOWER(b.book_name) LIKE LOWER('%' || $1 || '%') OR LOWER(a.author_name) LIKE LOWER('%' || $1 || '%'))
        LIMIT $2
        OFFSET $3
      `,
      [bookOrAuthor, limitBooks, page]
    );

    return res.status(200).json(book.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// GET::filter by gernes
const filterPublicBooks = async (req, res) => {
  const { genres, limit, offset } = req.query;
  try {
    // if there is no limit pass in params limtit is 20 by default
    const limitBooks = limit || 20;
    const page = (offset || 0) * limitBooks;

    const book = await db.query(
      `
        SELECT b.book_id, b.book_name, b.description, b.book_url, b.file_path, b.status, a.author_name, g.genre,
        JSON_BUILD_OBJECT('user_id', u.user_id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS user
        FROM books b
        LEFT JOIN users u ON b.user_id = u.user_id
        LEFT JOIN authors a ON b.author_id = a.author_id
        LEFT JOIN genres g ON b.genre_id = g.genre_id
        WHERE b.status='public' AND LOWER(g.genre) LIKE LOWER('%' || $1 || '%')
        LIMIT $2
        OFFSET $3
      `,
      [genres, limitBooks, page]
    );

    return res.status(200).json(book.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPublicBooks,
  getSinglePublicBook,
  searchPublicBooks,
  filterPublicBooks,
};
