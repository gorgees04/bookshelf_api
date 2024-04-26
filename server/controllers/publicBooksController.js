const db = require("../db");

// GET::public books
const getAllPublicBooks = async (req, res) => {
  try {
    const books = await db.query(`
        SELECT book_id, book_name, description, book_url, file_path, status, author_name, genre,
        JSON_BUILD_OBJECT('first_name', first_name, 'last_name', last_name, 'email', email) AS user
        FROM books 
        LEFT JOIN users ON books.user_id = users.user_id
        LEFT JOIN authors ON books.author_id = authors.author_id
        LEFT JOIN genres ON books.genre_id = genres.genre_id
        WHERE status='public'
    `);

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
            SELECT book_id, book_name, description, book_url, file_path, status, author_name, genre,
            JSON_BUILD_OBJECT('first_name', first_name, 'last_name', last_name, 'email', email) AS user
            FROM books 
            LEFT JOIN users ON books.user_id = users.user_id
            LEFT JOIN authors ON books.author_id = authors.author_id
            LEFT JOIN genres ON books.genre_id = genres.genre_id
            WHERE status='public' AND book_id=$1
        `,
      [bookId]
    );

    return res.status(200).json(book.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllPublicBooks, getSinglePublicBook };
