const db = require("../db");
const { notFound } = require("../utils/functions");

// GET::all user's book, public and private
const getAllUsersBooks = async (req, res) => {
  const { limit, offset } = req.params;

  // manage pagination
  const limitBooks = limit ? parseInt(limit) : 20;
  const safeOffset = offset ? parseInt(offset) : 0;
  const page = limitBooks * safeOffset;

  try {
    // get user
    const user = await checkUserAuth(req, res);

    // get all books
    const books = await db.query(
      `
      SELECT b.book_id, b.book_name, b.description, b.book_url, b.file_path, b.status, a.author_name, g.genre,
      JSON_BUILD_OBJECT('user_id', u.user_id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS user
      FROM books b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN authors a ON b.author_id = a.author_id
      LEFT JOIN genres g ON b.genre_id = g.genre_id
      WHERE b.user_id=$1
      LIMIT $2
      OFFSET $3
    `,
      [user.rows[0].user_id, limitBooks, page]
    );

    return res.status(200).json(books.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// GET::single user's book
const getSingleUsersBook = async (req, res) => {
  const { bookId } = req.params;
  try {
    // get user
    const user = await checkUserAuth(req, res);

    const book = await db.query(
      `
          SELECT b.book_id, b.book_name, b.description, b.book_url, b.file_path, b.status, a.author_name, g.genre,
          JSON_BUILD_OBJECT('user_id', u.user_id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS user
          FROM books b
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN authors a ON b.author_id = a.author_id
          LEFT JOIN genres g ON b.genre_id = g.genre_id
          WHERE b.user_id=$1 AND b.book_id=$2
        `,
      [user.rows[0].user_id, bookId]
    );

    // if there no res it will return not found
    notFound(book.rows[0], res);

    return res.status(200).json(book.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// GET::search for user's books where contains (book_name, author)
const searchUsersBooks = async (req, res) => {
  const { bookOrAuthor, limit, offset } = req.query;

  // manage pagination
  const limitBooks = limit ? parseInt(limit) : 20;
  const safeOffset = offset ? parseInt(offset) : 0;

  try {
    // get user
    const user = await checkUserAuth(req, res);

    const books = await db.query(
      `
          SELECT b.book_id, b.book_name, b.description, b.book_url, b.file_path, b.status, a.author_name, g.genre,
          JSON_BUILD_OBJECT('user_id', u.user_id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS user
          FROM books b
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN authors a ON b.author_id = a.author_id
          LEFT JOIN genres g ON b.genre_id = g.genre_id
          WHERE b.user_id=$1 AND (LOWER(b.book_name) LIKE LOWER('%' || $2 || '%') OR LOWER(a.author_name) LIKE LOWER('%' || $2 || '%'))
          LIMIT $3
          OFFSET $4
        `,
      [user.rows[0].user_id, bookOrAuthor, limitBooks, limitBooks * safeOffset]
    );

    // if there no res it will return not found
    notFound(books.rows[0], res);

    return res.status(200).json(books.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// GET::filter user's books by gernes or status
const filterUsersBooks = async (req, res) => {
  const { genres, status, limit, offset } = req.query;

  // Sanitize and validate input
  const safeGenres = genres ? `%${genres.toLowerCase()}%` : "";
  const safeStatus = status ? `%${status.toLowerCase()}%` : "";

  // manage pagination
  const limitBooks = limit ? parseInt(limit) : 20;
  const safeOffset = offset ? parseInt(offset) : 0;
  const page = limitBooks * safeOffset;

  try {
    // get user
    const user = await checkUserAuth(req, res);

    const books = await db.query(
      `
          SELECT b.book_id, b.book_name, b.description, b.book_url, b.file_path, b.status, a.author_name, g.genre,
          JSON_BUILD_OBJECT('user_id', u.user_id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS user
          FROM books b
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN authors a ON b.author_id = a.author_id
          LEFT JOIN genres g ON b.genre_id = g.genre_id
          WHERE b.user_id=$1 AND (LOWER(g.genre) LIKE LOWER('%' || $2 || '%') OR LOWER(b.status) LIKE LOWER('%' || $3 || '%'))
          LIMIT $4
          OFFSET $5
        `,
      [user.rows[0].user_id, genres, status, limitBooks, page]
    );

    // if there no res it will return not found
    notFound(books.rows[0], res);

    return res.status(200).json(books.rows);
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

module.exports = {
  getAllUsersBooks,
  getSingleUsersBook,
  searchUsersBooks,
  filterUsersBooks,
};
