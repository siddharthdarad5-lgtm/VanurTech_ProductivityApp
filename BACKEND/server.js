
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ===============================
// ROUTES
// ===============================
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const noteRoutes = require("./routes/noteRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const eventRoutes = require("./routes/eventRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// ===============================
// EXPRESS APP
// ===============================
const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// AUTHENTICATION ROUTES
// ===============================
app.use("/api/auth", authRoutes);

// ===============================
// TASK ROUTES
// ===============================
app.use("/api/tasks", taskRoutes);

// ===============================
// NOTE ROUTES
// ===============================
app.use("/api/notes", noteRoutes);

// ===============================
// EXPENSE ROUTES
// ===============================
app.use("/api/expenses", expenseRoutes);

// ===============================
// EVENT & REMINDER ROUTES
// ===============================
app.use("/api/events", eventRoutes);

// ===============================
// DASHBOARD ROUTES
// ===============================
app.use("/api/dashboard", dashboardRoutes);

// ===============================
// HEALTH CHECK ROUTE
// ===============================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "VanurTech Productivity App Backend is Running"
    });
});

// ===============================
// MONGODB CONNECTION & SERVER
// ===============================
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB Connection Failed:",
            error.message
        );
        process.exit(1);
    });