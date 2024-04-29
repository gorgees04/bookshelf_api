const db = require("../db");
const { deleteFile } = require("../utils/fileUpload/filesStorage");
const { capitalize } = require("../utils/functions");
const validator = require("validator");
const bcrypt = require("bcrypt");

// GET::get user's info
const getUserInfo = async (req, res) => {
  try {
    // get user
    const user = await checkUserAuth(req, res);

    // get user info
    const userInfo = await db.query(`SELECT * FROM users WHERE user_id=$1`, [
      user.rows[0].user_id,
    ]);

    return res.status(200).json(userInfo.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// PUT::update user's info
const updateUserInfo = async (req, res) => {
  const { firstName, lastName, email, prevPassword, newPassword } = req.body;
  try {
    // validate email
    if (email) {
      if (!validator.isEmail(email))
        return res.status(400).json({ message: "Invalid Email" });

      // check if email already exist
      const emailExist = await db.query(
        `SELECT email FROM users WHERE email=$1`,
        [email]
      );

      if (emailExist.rows[0])
        return res.status(400).json({ message: "Email already exist" });
    }

    // get user
    const user = await checkUserAuth(req, res);

    // confirm from user's prev password before change the paswword
    const matchPassword = await bcrypt.compare(
      prevPassword,
      user.rows[0].hashed_password
    );

    if (!matchPassword)
      return res.status(401).json({ message: "Incorrect password" });

    // check the strength of the new password
    if (newPassword && !validator.isStrongPassword(newPassword)) {
      return res.status(400).json({ message: "Password is not strong enough" });
    }

    // if prev password was correct then now hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // get user info
    const updatedUserInfo = await db.query(
      `
        UPDATE users SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        hashed_password = COALESCE($4, hashed_password)
        WHERE user_id=$5 RETURNING *`,
      [
        firstName === "" || !firstName ? null : capitalize(firstName),
        lastName === "" || !lastName ? null : capitalize(lastName),
        email === "" || !email ? null : email.toLowerCase(),
        newPassword === "" || !newPassword ? null : hashedNewPassword,
        user.rows[0].user_id,
      ]
    );

    return res
      .status(200)
      .json({ message: "User info updated", user: updatedUserInfo.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// DELETE::delete user and all his books
const deleteUserInfo = async (req, res) => {
  const { password } = req.body;
  try {
    // get user
    const user = await checkUserAuth(req, res);

    // confirm from user's password before delete his accound
    const matchPassword = await bcrypt.compare(
      password,
      user.rows[0].hashed_password
    );

    if (!matchPassword)
      return res.status(401).json({ message: "Incorrect password" });

    const usersBooks = await db.query(
      `SELECT book_id FROM books WHERE user_id=$1`,
      [user.rows[0].user_id]
    );

    usersBooks.rows.forEach(async (book) => {
      const bookId = book.book_id;

      const deletedBook = await db.query(
        "DELETE FROM books WHERE book_id=$1 RETURNING *",
        [bookId]
      );

      // delete book file
      if (deletedBook.rows[0].file_path) {
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
        const author = await db.query(
          "SELECT * FROM books WHERE author_id=$1",
          [deletedBook.rows[0].author_id]
        );
        if (author.rowCount === 0) {
          await db.query("DELETE FROM authors WHERE author_id=$1", [
            deletedBook.rows[0].author_id,
          ]);
        }
      }
    });

    const deletedUser = await db.query(
      `DELETE FROM users WHERE user_id=$1 RETURNING *`,
      [user.rows[0].user_id]
    );

    return res
      .status(200)
      .json({ message: "User deleted", user: deletedUser.rows[0] });
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

module.exports = { getUserInfo, updateUserInfo, deleteUserInfo };
