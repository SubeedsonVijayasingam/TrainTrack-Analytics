require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

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

// File upload routes
const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/uploads", uploadRoutes);

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