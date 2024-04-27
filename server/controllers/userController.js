const db = require("../db");

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

// check if user is authrized
async function checkUserAuth(req, res) {
  const user = await db.query("SELECT * FROM users WHERE user_id=$1", [
    req.userId,
  ]);
  if (!user.rows[0]) return res.status(401).json({ message: "Access denied" });
  return user;
}

module.exports = { getUserInfo };
