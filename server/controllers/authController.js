const { validationSignup } = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { capitalize } = require("../utils/functions");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // check if the user entered both fields
    if (!email || !password)
      return res.status(400).json({ message: "All fields must be filled" });

    // check if the user exist
    const user = await db.query("SELECT * FROM users WHERE email=$1", [email]);

    // check if the email match
    if (!user.rows[0])
      return res.status(401).json({ message: "Incorrect email or password" });

    // check if the password match
    const matchPassword = await bcrypt.compare(
      password,
      user.rows[0].hashed_password
    );
    if (!matchPassword)
      return res.status(401).json({ message: "Incorrect email or password" });

    // create a token
    const token = createToken(user.rows[0].user_id);

    // store token in cookie
    res.cookie("token", token, {
      secure: true,
      httpOnly: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24,
    });

    // send token with user details
    return res.status(200).json({
      user: user.rows[0],
      message: "Login successful",
    });
  } catch (error) {
    // checking if the it's validation error
    if (error.name === "ValidationError") {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

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
    const user = await db.query(
      "INSERT INTO users (email, hashed_password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        email.toLowerCase(),
        hashedPassword,
        capitalize(firstName),
        capitalize(lastName),
      ]
    );

    // create a token
    const token = createToken(user.rows[0].user_id);

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
    return res.status(500).json({ message: error.message });
  }
};

// logout
const logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    // checking if the it's validation error
    if (error.name === "ValidationError") {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// function to create a token
function createToken(id) {
  return jwt.sign({ userId: id }, process.env.SECRET_KEY);
}

module.exports = { signup, login, logout };
