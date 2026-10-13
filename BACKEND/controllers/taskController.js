const Task = require("../models/Task");

// @desc    Get all tasks for current user with optional filters
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const { status, priority, category, search } = req.query;

        // Build query filtered by current authenticated user
        const query = { user: req.user._id };

        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const tasks = await Task.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error("Get Tasks Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found or unauthorized"
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error("Get Task Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, category, dueDate, timeSpent } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });
        }

        const task = await Task.create({
            user: req.user._id,
            title,
            description,
            status: status || "pending",
            priority: priority || "medium",
            category: category || "General",
            dueDate,
            timeSpent: timeSpent || 0,
            completedAt: status === "completed" ? new Date() : null
        });

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        });
    } catch (error) {
        console.error("Create Task Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        let task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found or unauthorized"
            });
        }

        // Handle completedAt timestamp
        if (req.body.status && req.body.status === "completed" && task.status !== "completed") {
            req.body.completedAt = new Date();
        } else if (req.body.status && req.body.status !== "completed") {
            req.body.completedAt = null;
        }

        task = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Task updated successfully",
            data: task
        });
    } catch (error) {
        console.error("Update Task Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found or unauthorized"
            });
        }

        res.json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch (error) {
        console.error("Delete Task Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// @desc    Get user productivity metrics & summary
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalTasks = await Task.countDocuments({ user: userId });
        const completedTasks = await Task.countDocuments({ user: userId, status: "completed" });
        const pendingTasks = await Task.countDocuments({ user: userId, status: "pending" });
        const inProgressTasks = await Task.countDocuments({ user: userId, status: "in-progress" });
        const highPriorityPending = await Task.countDocuments({
            user: userId,
            priority: "high",
            status: { $ne: "completed" }
        });

        // Calculate total focus time spent (minutes)
        const timeAggregation = await Task.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, totalMinutes: { $sum: "$timeSpent" } } }
        ]);

        const totalMinutesSpent = timeAggregation.length > 0 ? timeAggregation[0].totalMinutes : 0;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        res.json({
            success: true,
            data: {
                totalTasks,
                completedTasks,
                pendingTasks,
                inProgressTasks,
                highPriorityPending,
                totalMinutesSpent,
                completionRate
            }
        });
    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
};
