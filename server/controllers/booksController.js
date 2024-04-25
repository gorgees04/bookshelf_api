const db = require("../db");
const { uploadFile } = require("../utils/fileUpload/filesStorage");

const createBook = async (req, res) => {
  const {
    bookName,
    description,
    bookUrl,
    filePath,
    status,
    genre,
    authorName,
  } = req.body;
  try {
    const url = await uploadFile(req.file, "bookshelf-app-books");
    console.log(url);
    // const user = await db.query("SELECT * FROM users WHERE user_id=$1", [
    //   req.userId,
    // ]);
    // if (!user.rows[0])
    //   return res.status(401).json({ message: "Access denied" });

    return res.status(200).json("user.rows");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createBook };
