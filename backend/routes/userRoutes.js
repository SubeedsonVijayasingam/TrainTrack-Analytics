const express = require("express");
const User = require("../models/User");

const router = express.Router();

// GET /api/users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
});

// POST /api/users
router.post("/", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Create new user
        const user = new User({
            name: name,
            email: email,
            password: password
        });

        // Save to MongoDB
        await user.save();

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create user",
            error: error.message
        });
    }
});

module.exports = router;