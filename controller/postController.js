const Post = require("../models/postModel");

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "error fetching posts!" });
  }
};

const createPost = async (req, res) => {
  try {
    const newPost = new Post({
      subject: req.body.subject,
      postContent: req.body.postContent,
    });
    const saveNewPost = await newPost.save();
    res.status(200).json(saveNewPost);
  } catch (error) {
    res.status(500).json({ message: "fail to create a post!" });
  }
};
const updateLikes = async (postId) => {
  try {
    const updatePost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    console.log("Updated post:", updatePost);
    return updatePost;
  } catch (error) {
    console.error("Error updating likes:", error);
    throw error;
  }
};

const likePost = async (req, res) => {
  const postId = req.params.id;
  try {
    const updatedPost = await updateLikes(postId);
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "error liking the post" });
  }
};
const getLikeOnPost = async (req, res) => {
  const postId = req.params.id;
  try {
    const LikeOnPost = await Post.findById(postId.likes);
    res.status(200).json(LikeOnPost);
  } catch (error) {
    res.status(500).json({ message: "error get the likes" });
  }
};
module.exports = { getAllPosts, createPost, likePost, getLikeOnPost };
