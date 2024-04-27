const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authUser = require("../middlewares/authUser");

// decode and authenticate the user
router.use(authUser);

router.get("/", userController.getUserInfo);
router.put("/", userController.updateUserInfo);
// router.delete("/", userController.deleteUserInfo);

module.exports = router;
