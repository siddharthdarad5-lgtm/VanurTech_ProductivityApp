const mongoose = require("mongoose");

// ===============================
// NOTE SCHEMA
// ===============================
const noteSchema = new mongoose.Schema(
    {
        // User who owns the note
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Note title
        title: {
            type: String,
            required: true,
            trim: true
        },

        // Note content
        content: {
            type: String,
            required: true,
            trim: true
        },

        // Note category
        category: {
            type: String,
            default: "General",
            trim: true
        },

        // Pin / Unpin note
        isPinned: {
            type: Boolean,
            default: false
        },

        // Date and time of note
        noteDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// ===============================
// EXPORT MODEL
// ===============================
module.exports = mongoose.model("Note", noteSchema);