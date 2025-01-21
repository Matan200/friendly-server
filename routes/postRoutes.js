const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  createPost,
  likePost,
  getLikeOnPost,
} = require("../controller/postController");

router.get("/posts", getAllPosts);
router.post("/posts", createPost);
router.put("/posts/:id/like", likePost);
router.get("/post/:id/like", getLikeOnPost);
module.exports = router;
