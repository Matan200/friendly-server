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

console.log("=== USERS ROUTES LOADED ===");
console.log("updateUserField function:", typeof updateUserField);

router.post("/signup", createUser);
router.post("/check-email", checkEmailExists);
router.post("/login", loginCheck);
router.get("/findByEmail/:email", getUserByEmail);
router.put(
  "/update",
  (req, res, next) => {
    console.log("=== UPDATE ROUTE HIT ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Body:", req.body);
    next();
  },
  updateUserField
);
router.put("/upload-avatar", uploadAvatar);

module.exports = router;
