require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// 🔥 ADD THIS
const startNewsCron = require("./cron/newsCron");

const newsRoutes = require("./routes/newsRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use("/api/news", newsRoutes);

// test route
app.get("/", (req, res) => {
    res.send("🚀 Server is running");
});

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB();

        // 🔥 START CRON AFTER DB CONNECTS
        startNewsCron();

        app.listen(PORT, () => {
            console.log(`🔥 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server start error:", error);
    }
};

start();