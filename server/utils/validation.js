const validator = require("validator");

// validate signup fields
const validationSignup = (body) => {
  if (!body.firstName) {
    throw Error("First Name is required");
  } else if (!body.lastName) {
    throw Error("Last Name is required");
  } else if (!validator.isEmail(body.email)) {
    throw new Error("Invalid Email");
  } else if (!validator.isStrongPassword(body.password)) {
    throw new Error("Password is not strong enough");
  }
};
// valdite create book
// bookName, description, bookUrl, status, genre, authorName
const validationCreateBook = (body) => {
  if (!body.bookName) {
    throw Error("Book Name is required");
  } else if (!body.description) {
    throw Error("Descriptionis is required");
  } else if (!body.genre) {
    throw Error("Genre is required");
  } else if (!body.authorName) {
    throw Error("Author Name id required");
  }
};

module.exports = { validationSignup, validationCreateBook };
