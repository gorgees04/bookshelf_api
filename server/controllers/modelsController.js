const db = require("../db");

// GET::get all genres and the count of the books genres
const getAllGenres = async (req, res) => {
  try {
    const genres = await db.query(`
        SELECT g.genre_id, g.genre, COUNT(b.book_id) AS book_count
        FROM genres g
        LEFT JOIN books b ON g.genre_id = b.genre_id
        GROUP BY g.genre_id, g.genre`);

    return res.status(200).json(genres.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// GET::get all authors and the count of the books authors
const getAllAuthors = async (req, res) => {
  try {
    const authors = await db.query(`
        SELECT a.author_id, a.author_name, COUNT(b.book_id) AS book_count
        FROM authors a
        LEFT JOIN books b ON a.author_id = b.author_id
        GROUP BY a.author_id, a.author_name`);

    return res.status(200).json(authors.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllGenres, getAllAuthors };
