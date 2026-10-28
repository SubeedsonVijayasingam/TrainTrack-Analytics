const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        username: {
            type: String,
            trim: true,
            lowercase: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        tokenVersion: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

userSchema.index(
    { username: 1 },
    {
        unique: true,
        partialFilterExpression: {
            username: { $type: "string" }
        }
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

