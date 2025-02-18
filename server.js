const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const postRoutes = require("./routes/postRoutes"); // מוודא שיש לך את הנתיב הנכון
const userRoutes = require("./routes/usersRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const app = express();

// הגדרת CORS לפני הנתיבים
app.use(
  cors({
    origin: "http://localhost:3000", // אפשר גם '*' אם אתה רוצה לאפשר לכל כתובת לגשת
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // מבטיח שהשרת יכול לקבל JSON
app.use("/api", postRoutes); // כל הנתיבים של הפוסטים יהיו תחת /api
app.use("/api/users", userRoutes);
app.use("/api/events", eventsRoutes);
// חיבור ל-MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://tanyarehby:lBBKT6Hh6ZPDRXoq@cluster0.n1rvv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/Posts",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connected to MongoDB Atlas")) // עדכון ההודעה
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// מאזין על פורט 4000
app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
