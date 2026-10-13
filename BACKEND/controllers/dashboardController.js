
const mongoose = require("mongoose");

const Task = require("../models/Task");
const Note = require("../models/Note");
const Expense = require("../models/Expense");
const Event = require("../models/Event");

// ===============================
// GET DASHBOARD DATA
// ===============================
const getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // Today's date range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Current month date range
        const now = new Date();

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );

        // Get all dashboard data
        const [
            todayTasks,
            totalTasks,
            completedTasks,
            recentNotes,
            recentExpenses,
            monthlyExpenseSummary,
            upcomingEvents
        ] = await Promise.all([

            // Today's tasks
            Task.find({
                user: userId,
                dueDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            })
                .sort({ dueDate: 1 })
                .limit(5),

            // Total tasks
            Task.countDocuments({
                user: userId
            }),

            // Completed tasks
            Task.countDocuments({
                user: userId,
                status: "completed"
            }),

            // Recent notes
            Note.find({
                user: userId
            })
                .sort({ updatedAt: -1 })
                .limit(5),

            // Recent expenses for current month
            Expense.find({
                user: userId,
                expenseDate: {
                    $gte: startOfMonth,
                    $lt: endOfMonth
                }
            })
                .sort({ expenseDate: -1 })
                .limit(5),

            // Total expenses for current month
            Expense.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(
                            userId
                        ),
                        expenseDate: {
                            $gte: startOfMonth,
                            $lt: endOfMonth
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount"
                        }
                    }
                }
            ]),

            // Upcoming pending events
            Event.find({
                user: userId,
                eventDate: {
                    $gte: new Date()
                },
                status: "pending"
            })
                .sort({ eventDate: 1 })
                .limit(5)
        ]);

        // Calculate task statistics
        const pendingTasks = Math.max(
            totalTasks - completedTasks,
            0
        );

        const monthlyExpenses =
            monthlyExpenseSummary.length > 0
                ? monthlyExpenseSummary[0].total
                : 0;

        // Send dashboard response
        res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: {
                tasks: todayTasks,
                recentNotes,
                recentExpenses,
                upcomingEvents,

                statistics: {
                    totalTasks,
                    completedTasks,
                    pendingTasks,
                    monthlyExpenses
                }
            }
        });

    } catch (error) {
        console.error(
            "Dashboard Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message
        });
    }
};

module.exports = {
    getDashboard
};