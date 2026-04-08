require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const { startNewsCron } = require("./cron/newsCron");

const newsRoutes = require("./routes/newsRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use("/api/news", newsRoutes);
app.use("/api/users", userRoutes);

// test route
app.get("/", (req, res) => {
    res.send("🚀 Server is running");
});

const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();

    // 🚀 START CRON
    startNewsCron();

    app.listen(PORT, () => {
        console.log(`🔥 Server running on port ${PORT}`);
    });
};

start();