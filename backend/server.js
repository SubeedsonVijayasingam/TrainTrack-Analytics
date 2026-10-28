require("dotenv").config();

const express = require("express");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "TrainTrack Analytics API is running"
    });
});

// User authentication and user routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Course routes
const courseRoutes = require("./routes/courseRoutes");
app.use("/api/courses", courseRoutes);

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
};

startServer();