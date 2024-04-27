const db = require("../db");
const { capitalize } = require("../utils/functions");
const validator = require("validator");

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
  const { firstName, lastName, email } = req.body;
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

    // get user info
    const updatedUserInfo = await db.query(
      `
        UPDATE users SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email)
        WHERE user_id=$4 RETURNING *`,
      [
        firstName && capitalize(firstName),
        lastName && capitalize(lastName),
        email && email.toLowerCase(),
        user.rows[0].user_id,
      ]
    );

    return res.status(200).json(updatedUserInfo.rows[0]);
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

module.exports = { getUserInfo, updateUserInfo };
