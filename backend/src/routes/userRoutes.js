const express = require("express");
const router = express.Router();
const User = require("../models/user");

// GET all users
router.get("/all", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.post("/create", async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;