const { validationSignup } = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const signup = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  try {
    // validate signip details
    validationSignup(req.body);

    // check if the user exist
    const userExist = await db.query("SELECT email FROM users WHERE email=$1", [
      email,
    ]);
    if (userExist.rows.length > 0)
      return res
        .status(409)
        .json({ message: "Email already exists", user: userExist.rows });

    // check if the password and confirmPassword match
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Password does not match" });

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user in db
    await db.query(
      "INSERT INTO users (email, hashed_password, first_name, last_name) VALUES ($1, $2, $3, $4)",
      [email, hashedPassword, firstName, lastName]
    );

    // get user
    const user = await db.query("SELECT * FROM users WHERE email=$1", [email]);

    // create a token
    const token = createToken(user.user_id);

    // store token in cookie
    res.cookie("token", token, {
      secure: true,
      httpOnly: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res
      .status(200)
      .json({ message: "Signup successful", user: user.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// function to create a token
function createToken(id) {
  return jwt.sign({ id }, process.env.SECRET_KEY);
}
module.exports = { signup };
