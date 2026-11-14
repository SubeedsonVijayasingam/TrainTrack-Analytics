const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Store uploaded files inside backend/uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName = crypto.randomUUID() + extension;

        cb(null, uniqueName);
    }
});

// Allowed file types
const allowedTypes = {
    ".pdf": ["application/pdf"],
    ".png": ["image/png"],
    ".jpg": ["image/jpeg"],
    ".jpeg": ["image/jpeg"],
    ".docx": [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
};

// Configure Multer
const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const allowedMimeTypes = allowedTypes[extension];

        if (
            allowedMimeTypes &&
            allowedMimeTypes.includes(file.mimetype)
        ) {
            cb(null, true);
        } else {
            const error = new Error(
                "Only PDF, PNG, JPG, JPEG and DOCX files are allowed"
            );

            error.code = "INVALID_FILE_TYPE";
            cb(error);
        }
    }
});

// POST /api/uploads
router.post("/", authenticateToken, (req, res, next) => {

    upload.single("file")(req, res, (error) => {

        if (error) {
            if (error instanceof multer.MulterError) {
                return res.status(
                    error.code === "LIMIT_FILE_SIZE" ? 413 : 400
                ).json({
                    message: error.message
                });
            }

            if (error.code === "INVALID_FILE_TYPE") {
                return res.status(400).json({
                    message: error.message
                });
            }

            return next(error);
        }

        next();
    });

}, (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "Please select a file to upload"
        });
    }

    return res.status(201).json({
        message: "File uploaded successfully",
        file: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedBy: req.auth.userId
        }
    });

});

module.exports = router;