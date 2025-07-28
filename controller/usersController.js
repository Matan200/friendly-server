const User = require("../models/userModel");
const multer = require("multer");
const express = require("express");
const path = require("path");
const app = express();
const cloudinary = require("cloudinary").v2;

//const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

express.json();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

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
      user: {
        email: user.email,
        userName: user.userName,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Error during login server:", error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred during login" });
  }
};

const createUser = async (req, res) => {
  upload.single("picture")(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error uploading file", error: err.message });
    }

    try {
      console.log(req.body);

      const {
        userName,
        password,
        email,
        birthdate,
        idnumber,
        address,
        gender,
        school = null,
      } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res
          .status(200)
          .json({ existMail: true, message: "אימייל כבר קיים במערכת" });
      }

      const idExists = await User.findOne({ idnumber });
      if (idExists) {
        return res.status(200).json({
          existId: true,
          message: "תעודת זהות כבר קיימת במערכת",
        });
      }
      const age = new Date().getFullYear() - new Date(birthdate).getFullYear();

      let pictureUrl = null;

      // בדיקה אם התמונה מגיעה כ-base64 string במקום קובץ
      if (req.body.picture && req.body.picture.startsWith("data:image/")) {
        try {
          const result = await cloudinary.uploader.upload(req.body.picture, {
            resource_type: "image",
            folder: "user_pictures",
            public_id: `user_${email}_${Date.now()}`,
            transformation: [
              { width: 500, height: 500, crop: "limit" },
              { quality: "auto" },
            ],
          });

          pictureUrl = result.secure_url;
          console.log("Image uploaded to Cloudinary from base64:", pictureUrl);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res.status(500).json({
            message: "Error uploading image to cloud",
            error: uploadError.message,
          });
        }
      }
      // אם התמונה מגיעה כקובץ (multer)
      else if (req.file) {
        try {
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  resource_type: "image",
                  folder: "user_pictures", // תיקייה ב-Cloudinary
                  public_id: `user_${email}_${Date.now()}`, // שם ייחודי
                  transformation: [
                    { width: 500, height: 500, crop: "limit" },
                    { quality: "auto" },
                  ],
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              )
              .end(req.file.buffer);
          });

          pictureUrl = result.secure_url; // זה ה-URL ב-Cloudinary
          console.log("Image uploaded to Cloudinary from file:", pictureUrl);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res.status(500).json({
            message: "Error uploading image to cloud",
            error: uploadError.message,
          });
        }
      }

      // יצירת אובייקט משתמש חדש
      const newUser = new User({
        userName,
        password: hashedPassword,
        email,
        birthdate,
        idnumber,
        address,
        gender,
        school,
        picture: pictureUrl, // URL של התמונה ב-Cloudinary (לא נתיב מקומי)
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
      res
        .status(500)
        .json({ message: "Error creating user", error: error.message });
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

const updateUserField = async (req, res) => {
  try {
    console.log("=== UPDATE USER FIELD ===");
    console.log("Request body:", req.body);

    const { email, currentEmail, ...updates } = req.body;

    // אם יש currentEmail, זה אומר שרוצים לשנות מייל
    const searchEmail = currentEmail || email;

    // אם יש currentEmail, צריך להוסיף את המייל החדש לעדכונים
    if (currentEmail && email) {
      updates.email = email;
    }

    console.log("Search Email:", searchEmail);
    console.log("Updates:", updates);

    if (!searchEmail) {
      console.log("No email provided!");
      return res.status(400).json({ message: "Email is required" });
    } // טיפול בתמונה אם נשלחה - בדיוק כמו ב-createUser
    if (req.body.picture && req.body.picture.startsWith("data:image/")) {
      try {
        const result = await cloudinary.uploader.upload(req.body.picture, {
          resource_type: "image",
          folder: "user_pictures",
          public_id: `user_${searchEmail}_${Date.now()}`,
          transformation: [
            { width: 500, height: 500, crop: "limit" },
            { quality: "auto" },
          ],
        });

        updates.picture = result.secure_url;
        console.log(
          "Image updated to Cloudinary from base64:",
          result.secure_url
        );
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          message: "Error uploading image to cloud",
          error: uploadError.message,
        });
      }
    }

    console.log("Looking for user with email:", searchEmail);

    // חיפוש עם case-insensitive
    const user = await User.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${searchEmail}$`, "i") } },
      { $set: updates },
      { new: true }
    );

    console.log("User found:", user ? "Yes" : "No");
    if (!user) {
      console.log("User not found in database!");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User updated successfully:", user.email);
    res.status(200).json(user);
  } catch (error) {
    console.error("=== ERROR IN UPDATE USER FIELD ===");
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error while updating user" });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let pictureUrl = null;

    // טיפול בתמונה מbase64 - ללא multer
    if (req.body.picture && req.body.picture.startsWith("data:image/")) {
      try {
        const result = await cloudinary.uploader.upload(req.body.picture, {
          resource_type: "image",
          folder: "user_avatars",
          public_id: `avatar_${email}_${Date.now()}`,
          transformation: [
            { width: 300, height: 300, crop: "fill", gravity: "face" },
            { quality: "auto" },
            { format: "jpg" },
          ],
        });

        pictureUrl = result.secure_url;
        console.log("Avatar uploaded to Cloudinary from base64:", pictureUrl);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          message: "Error uploading avatar to cloud",
          error: uploadError.message,
        });
      }
    } else {
      return res.status(400).json({ message: "No valid image provided" });
    }

    // עדכון המשתמש עם ה-avatar החדש
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { picture: pictureUrl } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Avatar uploaded successfully",
      pictureUrl: pictureUrl,
      user: user,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ message: "Server error while uploading avatar" });
  }
};

module.exports = {
  checkEmailExists,
  createUser,
  loginCheck,
  getUserByEmail,
  updateUserField,
  uploadAvatar,
};
