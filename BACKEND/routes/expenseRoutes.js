const express = require("express");
const router = express.Router();

const {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseSummary
} = require("../controllers/expenseController");

const authMiddleware = require("../middleware/authMiddleware");

// All expense routes require authentication
router.use(authMiddleware);

// Expense summary
router.get("/summary", getExpenseSummary);

// Create + Get all expenses
router.route("/")
    .get(getExpenses)
    .post(createExpense);

// Get + Update + Delete expense
router.route("/:id")
    .get(getExpenseById)
    .put(updateExpense)
    .delete(deleteExpense);

module.exports = router;