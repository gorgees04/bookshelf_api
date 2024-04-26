const jwt = require("jsonwebtoken");

const authUser = (req, res, next) => {
  try {
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Please login" });
    }

    // decode the token by verify it with secret key we user when token was created
    decodedUser = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decodedUser.userId);
    // send user id
    req.userId = decodedUser.userId;

    next();
  } catch (error) {
    if (error.message === "invalid signature") {
      return res.status(401).json({ message: "Please login" });
    }
    return res.status(401).json({ message: error.message });
  }
};

module.exports = authUser;
