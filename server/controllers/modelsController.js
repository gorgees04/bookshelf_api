const db = require("../db");

const getAllGenres = async (req, res) => {
  try {
    const genres = await db.query(`
        SELECT g.genre_id, g.genre, COUNT(b.book_id) AS book_count
        FROM genres g
        LEFT JOIN books b ON g.genre_id = b.genre_id
        GROUP BY g.genre_id, g.genre;`);

    res.status(200).json(genres.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
const getAllAuthors = async (req, res) => {};

module.exports = { getAllGenres, getAllAuthors };
