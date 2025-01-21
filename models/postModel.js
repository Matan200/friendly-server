const mongoose = require("mongoose");
const User = require("./userModel");

const postSchema = new mongoose.Schema({
  subject: {
    type: String,
    require: true,
  },
  postContent: {
    type: String,
    require: true,
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
  // editor: {
  //   type: User,
  // },
});
const Post = mongoose.model("Post", postSchema);
module.exports = Post;
