const express = require("express");
const {
  checkEmailExists,
  createUser,
  loginCheck,
  getUserByEmail,
  updateUserField,
  uploadAvatar,
} = require("../controller/usersController");
const router = express.Router();

router.post("/signup", createUser);
router.post("/check-email", checkEmailExists);
router.post("/login", loginCheck);
router.get("/findByEmail/:email", getUserByEmail);
router.put("/update", updateUserField);
router.put("/upload-avatar", uploadAvatar);

module.exports = router;
