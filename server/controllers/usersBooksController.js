const db = require("../db");

// GET::all user's book, public and private
const getAllUsersBooks = async (req, res) => {
  const { limit, offset } = req.params;
  try {
    // if there is no limit pass in params limtit is 20 by default
    const limitBooks = limit || 20;
    const page = (offset || 0) * limitBooks;

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

    return res.status(200).json(book.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// GET::search for user's books where contains (book_name, author)
const searchUsersBooks = async (req, res) => {
  const { bookOrAuthor, limit, offset } = req.query;
  try {
    // if there is no limit pass in params limtit is 20 by default
    const limitBooks = limit || 20;
    const page = (offset || 0) * limitBooks;

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
      [user.rows[0].user_id, bookOrAuthor, limitBooks, page]
    );

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

module.exports = { getAllUsersBooks, getSingleUsersBook, searchUsersBooks };
