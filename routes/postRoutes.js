const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  createPost,
  likePost,
  getLikeOnPost,
  commentsPost,
} = require("../controller/postController");

router.get("/posts", getAllPosts);
router.post("/posts", createPost);
router.put("/posts/:id/like", likePost);
router.get("/post/:id/like", getLikeOnPost);
router.post("/posts/:id/comments", commentsPost);

module.exports = router;
