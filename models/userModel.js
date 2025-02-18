const mongoose = require("mongoose");
const { schema } = require("./postModel");
const Post = require("./postModel");
const { post } = require("../routes/postRoutes");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  userType: {
    type: String,
  },
  picture: {
    type: String, // שדה לתמונה (נתיב התמונה שהועלתה)
  },
  school: {
    type: String,
    //require: true,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  idnumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
