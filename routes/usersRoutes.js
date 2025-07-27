const express = require("express");
const {
  checkEmailExists,
  createUser,
  loginCheck,
  getUserByEmail,
  updateUserField,
} = require("../controller/usersController");
const router = express.Router();

router.post("/signup", createUser);
router.post("/check-email", checkEmailExists);
router.post("/login", loginCheck);
router.get("/findByEmail/:email", getUserByEmail);
router.put("/update", updateUserField);

module.exports = router;
const multer = require("multer");

const storage = multer.memoryStorage(); // אפשר גם לשמור בקבצים
const upload = multer({ storage });

router.put("/upload-avatar", upload.single("avatar"), async (req, res) => {
  const { email } = req.body;
  const file = req.file;

  if (!file) return res.status(400).send("No file uploaded");

  // שמירה בשרת או העלאה ל־cloudinary וכו'
  const newAvatarUrl = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;

  const user = await User.findOneAndUpdate(
    { email },
    { picture: newAvatarUrl },
    { new: true }
  );

  if (!user) return res.status(404).send("User not found");

  res.send({ newAvatar: user.picture });
});
