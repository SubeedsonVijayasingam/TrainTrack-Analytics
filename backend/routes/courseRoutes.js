const express = require("express");
const Course = require("../models/course");
const User = require("../models/User");

const router = express.Router();

// POST /api/courses - Create a course
router.post("/", async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required"
            });
        }

        const course = await Course.create({
            title,
            description,
            enrolledUsers: []
        });

        res.status(201).json({
            message: "Course created successfully",
            course
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create course",
            error: error.message
        });
    }
});

// GET /api/courses - Get all courses and enrolled users
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find().populate(
            "enrolledUsers",
            "name email"
        );

        res.json(courses);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch courses",
            error: error.message
        });
    }
});

// POST /api/courses/:courseId/enroll/:userId - Enroll a user
router.post("/:courseId/enroll/:userId", async (req, res) => {
    try {
        const { courseId, userId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (course.enrolledUsers.some(id => id.equals(user._id))) {
            return res.status(400).json({
                message: "User is already enrolled in this course"
            });
        }

        course.enrolledUsers.push(user._id);
        await course.save();

        const updatedCourse = await Course.findById(courseId).populate(
            "enrolledUsers",
            "name email"
        );

        res.json({
            message: "User enrolled successfully",
            course: updatedCourse
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to enroll user",
            error: error.message
        });
    }
});

module.exports = router;
