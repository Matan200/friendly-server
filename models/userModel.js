const mongoose = require("mongoose");
const { schema } = require("./postModel");
const Post = require("./postModel");
const { post } = require("../routes/postRoutes");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  birthdate: {
    type: Date,
    require: true,
  },
  userType: {
    type: String,
  },
  picture: {
    type: String, // שדה לתמונה (נתיב התמונה שהועלתה)
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});
const User = mongoose.model("User", userSchema);
module.exports = User;
