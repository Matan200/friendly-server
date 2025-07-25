const User = require("../models/userModel");
const multer = require("multer");
const express = require("express");
const path = require("path");
const app = express();
//const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

express.json();
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

const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    const emailExists = await User.findOne({ email }); // חיפוש במאגר
    if (emailExists) {
      return res.json({ exists: true });
    }
    res.json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: "Error checking email", error });
  }
};

const loginCheck = async (req, res) => {
  try {
    const { email, password } = req.body;

    // בדיקה אם האימייל קיים ב-DB
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    // השוואת הסיסמה שהוזנה לסיסמה ב-DB
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid password" });
    }

    // אם הכל תקין
    return res.status(200).json({
      success: true,
      message: "Login successful server",
      user: { email: user.email, userName: user.userName, age: user.age },
    });
  } catch (error) {
    console.error("Error during login server:", error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred during login" });
  }
};
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
      console.log(req.body);

      // חישוב גיל המשתמש
      const {
        userName,
        password,
        email,
        birthdate,
        idnumber,
        address,
        gender,
        school = null,
        picture,
      } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res
          .status(200)
          .json({ existMail: true, message: "Email already exists" });
      }

      const age = new Date().getFullYear() - new Date(birthdate).getFullYear();

      // יצירת אובייקט משתמש חדש
      const newUser = new User({
        userName,
        password: hashedPassword,
        email,
        birthdate,
        idnumber,
        address,
        gender,
        //picture: req.file ? req.file.path : null, // שמירת נתיב התמונה אם קובץ הועלה
        school,
        picture: req.file ? req.file.path : picture || null, // ✅ תיקון כאן: שמירה גם אם מגיע picture מ- body
      });

      // הגדרת סוג המשתמש
      if (age < 18) {
        newUser.userType = "student";
      } else {
        newUser.userType = "adult";
      }
      if (age < 18 && !school) {
        return res
          .status(400)
          .json({ message: "School is required for users under 18" });
      }

      // שמירת המשתמש
      const saveNewUser = await newUser.save();
      res.status(200).json(saveNewUser);
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error: error });
    }
  });
};
// const getUserByEmail = async (req, res) => {
//   const email = req.params;
//   //return res.status(200).json(email);

//   // if (email) {
//   //   return res.status(200).json({ message: "email found" });
//   // }

//   try {
//     const user = await User.findOne({ email }).select("_id"); // מחפש את המשתמש לפי המייל ומחזיר רק את ה-ID
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(user); // מחזיר את ה-ID של המשתמש
//   } catch (error) {
//     console.error("Error finding user by email:", error);
//     res.status(500).json({ message: "Error finding user by email" });
//   }
// };

const getUserByEmail = async (req, res) => {
  const email = req.params.email; // שולף את המייל מתוך האובייקט

  try {
    const user = await User.findOne({ email }); // מחפש לפי מייל
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user); // מחזיר את כל המשתמש
  } catch (error) {
    console.error("Error finding user by email:", error);
    res.status(500).json({ message: "Error finding user by email" });
  }
};

module.exports = { checkEmailExists, createUser, loginCheck, getUserByEmail };
