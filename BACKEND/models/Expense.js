const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        expenseDate: {
            type: Date,
            default: Date.now
        },

        paymentMethod: {
            type: String,
            enum: [
                "Cash",
                "UPI",
                "Card",
                "Bank Transfer",
                "Other"
            ],
            default: "Cash"
        },

        notes: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Expense", expenseSchema);