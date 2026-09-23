const express = require("express");
const connectDB = require("./db");

const app = express();

const PORT = 5000;

// Middleware
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "TrainTrack Analytics API is running"
    });
});

// User routes
const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Connect to MongoDB
connectDB();