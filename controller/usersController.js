const User = require("../models/userModel");
const multer = require("multer");
const express = require("express");
const path = require("path");
const app = express();

// הגדרת הגדרת העלאת קבצים עם multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // הגדרת תיקיית העלאה
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // שימור שם הקובץ עם timestamp
  },
});

const upload = multer({ storage });

// יצירת משתמש
const createUser = async (req, res) => {
  // הגדרת middleware של multer (כדי להעלות תמונה אחת בלבד)
  upload.single("picture")(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error uploading file", error: err });
    }

    try {
      // חישוב גיל המשתמש
      const { userName, password, email, birthdate } = req.body;
      const age = new Date().getFullYear() - new Date(birthdate).getFullYear();

      // יצירת אובייקט משתמש חדש
      const newUser = new User({
        userName,
        password,
        email,
        birthdate,
        picture: req.file ? req.file.path : null, // שמירת נתיב התמונה אם קובץ הועלה
      });

      // הגדרת סוג המשתמש
      if (age < 18) {
        newUser.userType = "student";
      } else {
        newUser.userType = "adult";
      }

      // שמירת המשתמש
      const saveNewUser = await newUser.save();
      res.status(200).json(saveNewUser);
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error: error });
    }
  });
};

module.exports = { createUser };
