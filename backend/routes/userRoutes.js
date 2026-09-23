const express = require("express");
const User = require("../models/User");

const router = express.Router();

// ======================================================
// GET /api/users
// Get all users
// ======================================================
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

// ======================================================
// GET /api/users/count
// Get total number of users
// ======================================================
router.get("/count", async (req, res) => {
    try {
        const count = await User.countDocuments();

        res.json({
            totalUsers: count
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to count users",
            error: error.message
        });
    }
});

// ======================================================
// GET /api/users/:id
// Get one user by ID
// ======================================================
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
});

// ======================================================
// PUT /api/users/:id
// Update an existing user
// ======================================================
router.put("/:id", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name) {
            user.name = name;
        }

        if (email) {
            user.email = email;
        }

        if (password) {
            user.password = password;
        }

        await user.save();

        res.json({
            message: "User updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update user",
            error: error.message
        });
    }
});

// ======================================================
// DELETE /api/users/:id
// Delete an existing user
// ======================================================
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
});

// ======================================================
// POST /api/users
// Create a new user
// ======================================================
router.post("/", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const user = new User({
            name: name,
            email: email,
            password: password
        });

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