const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  createPost,
  likePost,
  getLikeOnPost,
  commentsPost,
  getFilteredPosts,
} = require("../controller/postController");

// router.get("/posts", getAllPosts);
router.post("/posts/byUserType", getAllPosts);

router.post("/posts", createPost);
router.put("/posts/:id/like", likePost);
router.get("/post/:id/like", getLikeOnPost);
router.post("/posts/:id/comments", commentsPost);
router.get("/posts/filter", getFilteredPosts);

module.exports = router;
