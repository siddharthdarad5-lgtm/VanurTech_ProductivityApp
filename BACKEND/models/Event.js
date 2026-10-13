const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        category: {
            type: String,
            enum: [
                "Meeting",
                "Birthday",
                "Appointment",
                "Payment",
                "Personal",
                "Other"
            ],
            default: "Personal"
        },

        eventDate: {
            type: Date,
            required: true
        },

        reminderMinutesBefore: {
            type: Number,
            default: 0,
            min: 0
        },

        repeat: {
            type: String,
            enum: [
                "once",
                "daily",
                "weekly",
                "monthly",
                "custom"
            ],
            default: "once"
        },

        customRepeatDays: {
            type: [Number],
            default: []
        },

        notificationEnabled: {
            type: Boolean,
            default: true
        },

        notificationChannels: {
            type: [String],
            enum: [
                "in-app",
                "push",
                "email"
            ],
            default: ["in-app"]
        },

        status: {
            type: String,
            enum: [
                "pending",
                "completed",
                "snoozed"
            ],
            default: "pending"
        },

        snoozedUntil: {
            type: Date,
            default: null
        },

        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Event", eventSchema);