
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from the backend .env file");
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Authentication token required"
        });
    }

    try {
        req.auth = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// Register a new user
router.post("/register", async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                message: "Name, username, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedEmail }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        return res.status(500).json({
            message: "Registration failed"
        });
    }
});

// Login with username and password
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const user = await User.findOne({
            username: username.trim().toLowerCase()
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Login failed"
        });
    }
});

// Get all users (requires authentication)
router.get("/", authenticateToken, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.json(users);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch users"
        });
    }
});

// Get total user count (requires authentication)
router.get("/count", authenticateToken, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        return res.json({ totalUsers });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to count users"
        });
    }
});

// Get one user by ID (requires authentication)
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.json(user);
    } catch (error) {
        return res.status(400).json({
            message: "Invalid user ID"
        });
    }
});

// Update your own account (requires authentication)
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        if (req.auth.userId !== req.params.id) {
            return res.status(403).json({
                message: "You can update only your own account"
            });
        }

        const { name, username, email, password } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name) {
            user.name = name.trim();
        }

        if (username) {
            const normalizedUsername = username.trim().toLowerCase();

            const existingUsername = await User.findOne({
                username: normalizedUsername,
                _id: { $ne: user._id }
            });

            if (existingUsername) {
                return res.status(409).json({
                    message: "Username already exists"
                });
            }

            user.username = normalizedUsername;
        }

        if (email) {
            const normalizedEmail = email.trim().toLowerCase();

            const existingEmail = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id }
            });

            if (existingEmail) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }

            user.email = normalizedEmail;
        }

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must contain at least 8 characters"
                });
            }

            user.password = await bcrypt.hash(password, 12);
        }

        await user.save();

        return res.json({
            message: "User updated successfully",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        return res.status(400).json({
            message: "Failed to update user"
        });
    }
});

// Create a user through the existing endpoint
router.post("/", async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                message: "Name, username, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedEmail }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        const user = await User.create({
            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12)
        });

        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create user"
        });
    }
});

module.exports = router;