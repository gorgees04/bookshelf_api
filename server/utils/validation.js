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

module.exports = { validationSignup };
