const Post = require("../models/postModel");
const User = require("../models/userModel");

const getPostsForAdults = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userType = user.userType;

    // שליפת הפוסטים עם הצטרפות למידע על המשתמשים
    const posts = await Post.find().populate("createdBy", "userType");

    // סינון: אם המשתמש הוא adult, לא להחזיר פוסטים של students
    const filteredPosts = posts.filter((post) => {
      if (userType === "adult" && post.createdBy.userType === "student") {
        return false;
      }
      return true;
    });

    res.status(200).json(filteredPosts);
  } catch (error) {
    console.error("Error getting posts:", error);
    res.status(500).json({ message: "Error getting posts", error });
  }
};

// שליפת כל הפוסטים
// const getAllPosts = async (req, res) => {
//   try {
//     const posts = await Post.find()
//       .populate("editor", "userName email")
//       .populate("comments.user", "userName email") // שליפת פרטי המשתמש שיצר את הפוסט
//       .sort({ createdAt: -1 });
//     res.status(200).json(posts);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching posts!" });
//   }
// };

const getAllPosts = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userType = user.userType;

    const posts = await Post.find()
      .populate("editor", "userName email userType")
      .populate("comments.user", "userName email");

    const filteredPosts = posts.filter((post) => {
      return post.editor?.userType === userType;
    });

    res.status(200).json(filteredPosts);
  } catch (error) {
    console.error("Error filtering posts by user type:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// יצירת פוסט חדש
const createPost = async (req, res) => {
  try {
    const { editor, /*subject*/ postContent } = req.body;
    const user = await User.findOne({ email: editor });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // יצירת הפוסט החדש
    const newPost = new Post({
      editor: user._id,
      //subject,
      postContent,
    });
    //return res.status(200).json(newPost.editor);
    // שמירת הפוסט למסד הנתונים
    const saveNewPost = await newPost.save();
    if (saveNewPost) {
      //return res.status(200).json(newPost.editor);
      user.posts.push(saveNewPost._id); // הוספת הפוסט לרשימת הפוסטים של המשתמש
      await user.save();
      // if (ressss) {
      //   return res.status(200).json("its ok!");
      // } else {
      //   return res.status(200).json("its in the else ");
      // }
    }
    // await User.findByIdAndUpdate(user._id, {
    //   $push: { posts: saveNewPost._id },

    return res.status(200).json(saveNewPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create a post!" });
  }
};

// עדכון מספר לייקים
const updateLikes = async (postId) => {
  try {
    const updatePost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    return updatePost;
  } catch (error) {
    console.error("Error updating likes:", error);
    throw error;
  }
};
const commentsPost = async (req, res) => {
  const postId = req.params.id;
  const { text, email } = req.body;
  //return res.status(200).json(email);
  try {
    const post = await Post.findById(postId);
    const commentUser = await User.findOne({ email }).select(
      "userName _id email"
    );
    //בדיקההההההההההההההההההה
    // if (!post) {
    //   return res.status(200).json("commentUser.email");
    // } else if (!commentUser) {
    //   return res.status(200).json("text");
    // }

    const newComment = {
      text: text,
      user: commentUser._id,
    };
    post.comments.push(newComment);
    await post.save();
    const updatedPost = await Post.findById(postId)
      .populate("editor", "userName email")
      .populate("comments.user", "userName");
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};
// הוספת לייק לפוסט
const likePost = async (req, res) => {
  const postId = req.params.id;
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    )
      .populate("editor", "userName email") // שליפת פרטי היוצר
      .populate("comments.user", "userName email"); // שליפת פרטי המגיבים
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Error liking the post" });
  }
};

// שליפת לייקים לפוסט
const getLikeOnPost = async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: "Error getting the likes" });
  }
};

const getFilteredPosts = async (req, res) => {
  try {
    const { city, school, minAge, maxAge, /*subject,*/ gender } = req.query;

    let posts = await Post.find({}).populate("editor").sort({ createdAt: -1 });

    if (city) {
      posts = posts.filter(
        (post) =>
          post.editor?.address &&
          post.editor.address.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (school) {
      posts = posts.filter(
        (post) =>
          post.editor?.school &&
          post.editor.school.toLowerCase().includes(school.toLowerCase())
      );
    }

    if (minAge && maxAge) {
      const today = new Date();
      posts = posts.filter((post) => {
        const birthDate = post.editor?.birthdate;
        if (!birthDate) return false;

        const ageDifMs = today - new Date(birthDate);
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        return age >= minAge && age <= maxAge;
      });
    }

    // if (subject) {
    //   posts = posts.filter(
    //     (post) =>
    //       post.subject &&
    //       post.subject.toLowerCase().includes(subject.toLowerCase())
    //   );
    // }
    if (gender && gender.trim() !== "") {
      posts = posts.filter(
        (post) =>
          post.editor?.gender &&
          post.editor.gender.toLowerCase() === gender.toLowerCase()
      );
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error filtering posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllPosts,
  createPost,
  likePost,
  getLikeOnPost,
  commentsPost,
  getFilteredPosts,
};
