const express = require("express");

const router = express.Router();

const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

// ===============================
// ALL TASK ROUTES ARE PROTECTED
// ===============================
router.use(authMiddleware);

// ===============================
// PRODUCTIVITY STATS
// ===============================
router.get("/stats", getTaskStats);

// ===============================
// TASKS CRUD
// ===============================
router.route("/")
    .get(getTasks)
    .post(createTask);

router.route("/:id")
    .get(getTaskById)
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;