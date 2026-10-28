const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_PASSWORD_BYTES = 72;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from the backend .env file");
}

function validateUserInput({ name, username, email, password }) {
    if (typeof name !== "string" || !name.trim()) {
        return "Name must be a non-empty string";
    }

    if (typeof username !== "string" || !username.trim()) {
        return "Username must be a non-empty string";
    }

    if (typeof email !== "string" || !email.trim()) {
        return "Email must be a non-empty string";
    }

    if (typeof password !== "string" || !password.trim()) {
        return "Password must be a non-empty string";
    }

    if (password.length < 8) {
        return "Password must contain at least 8 characters";
    }

    if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
        return "Password must not exceed 72 bytes";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return "Please provide a valid email address";
    }

    return null;
}

function passwordIsHashed(password) {
    return typeof password === "string" && /^\$2[aby]\$/.test(password);
}

async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({
            message: "Authentication token required"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists"
            });
        }

        if (decoded.tokenVersion !== (user.tokenVersion || 0)) {
            return res.status(401).json({
                message: "Token is no longer valid. Please log in again."
            });
        }

        req.auth = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

async function createUser(req, res, successMessage) {
    try {
        const validationError = validateUserInput(req.body || {});

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const { name, username, email, password } = req.body;
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
            password: await bcrypt.hash(password, 12),
            tokenVersion: 0
        });

        return res.status(201).json({
            message: successMessage,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("User creation failed:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        return res.status(500).json({
            message: "User creation failed"
        });
    }
}

router.post("/register", async (req, res) => {
    return createUser(req, res, "Registration successful");
});

router.post("/login", async (req, res) => {
    try {
        const { username, email, password } = req.body || {};

        const identifier =
            typeof username === "string" && username.trim()
                ? username.trim().toLowerCase()
                : typeof email === "string" && email.trim()
                    ? email.trim().toLowerCase()
                    : null;

        if (!identifier || typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Valid username or email and password are required"
            });
        }

        if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
            return res.status(400).json({
                message: "Password must not exceed 72 bytes"
            });
        }

        const user = await User.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid username/email or password"
            });
        }

        let passwordMatches = false;

        if (passwordIsHashed(user.password)) {
            passwordMatches = await bcrypt.compare(password, user.password);
        } else {
            passwordMatches = password === user.password;
        }

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid username/email or password"
            });
        }

        if (!passwordIsHashed(user.password)) {
            user.password = await bcrypt.hash(password, 12);
        }

        if (!user.username) {
            const baseUsername = (
                user.email.split("@")[0]
                    .toLowerCase()
                    .replace(/[^a-z0-9._-]/g, "") || "user"
            ).slice(0, 25);

            let candidate = baseUsername;
            let suffix = 1;

            while (await User.exists({
                username: candidate,
                _id: { $ne: user._id }
            })) {
                candidate = `${baseUsername.slice(0, 25)}${suffix}`;
                suffix += 1;
            }

            user.username = candidate;
        }

        await user.save();

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                username: user.username,
                tokenVersion: user.tokenVersion || 0
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
        console.error("Login failed:", error.message);

        return res.status(500).json({
            message: "Login failed"
        });
    }
});

router.get("/", authenticateToken, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.json(users);
    } catch (error) {
        console.error("Failed to fetch users:", error.message);

        return res.status(500).json({
            message: "Failed to fetch users"
        });
    }
});

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

router.put("/:id", authenticateToken, async (req, res) => {
    try {
        if (req.auth.userId !== req.params.id) {
            return res.status(403).json({
                message: "You can update only your own account"
            });
        }

        const { name, username, email, password } = req.body || {};
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message: "Name must be a non-empty string"
                });
            }

            user.name = name.trim();
        }

        if (username !== undefined) {
            if (typeof username !== "string" || !username.trim()) {
                return res.status(400).json({
                    message: "Username must be a non-empty string"
                });
            }

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

        if (email !== undefined) {
            if (typeof email !== "string" || !email.trim()) {
                return res.status(400).json({
                    message: "Email must be a non-empty string"
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
                return res.status(400).json({
                    message: "Please provide a valid email address"
                });
            }

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

        if (password !== undefined) {
            if (typeof password !== "string" || !password.trim()) {
                return res.status(400).json({
                    message: "Password must be a non-empty string"
                });
            }

            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must contain at least 8 characters"
                });
            }

            if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
                return res.status(400).json({
                    message: "Password must not exceed 72 bytes"
                });
            }

            user.password = await bcrypt.hash(password, 12);
            user.tokenVersion = (user.tokenVersion || 0) + 1;
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
        console.error("Failed to update user:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        return res.status(500).json({
            message: "Failed to update user"
        });
    }
});

router.post("/", async (req, res) => {
    return createUser(req, res, "User created successfully");
});

module.exports = router;