const mongoose = require("mongoose");
const User = require("./userModel");

const postSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  postContent: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  // נסיוןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןןן
  comments: [
    {
      text: { type: String },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // פרטי המשתמש שכתב את התגובה
      createdAt: { type: Date, default: Date.now }, // תאריך יצירת התגובה
    },
  ],
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // רפרנס למשתמש שיצר את הפוסט
  },
});
const Post = mongoose.model("Post", postSchema);
module.exports = Post;
