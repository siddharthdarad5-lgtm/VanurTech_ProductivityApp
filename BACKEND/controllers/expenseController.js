const Expense = require("../models/Expense");

// ===============================
// CREATE EXPENSE
// ===============================
const createExpense = async (req, res) => {
    try {
        const {
            amount,
            category,
            expenseDate,
            paymentMethod,
            notes
        } = req.body;

        if (!amount || !category) {
            return res.status(400).json({
                success: false,
                message: "Amount and category are required"
            });
        }

        const expense = await Expense.create({
            user: req.user._id,
            amount,
            category,
            expenseDate: expenseDate || new Date(),
            paymentMethod: paymentMethod || "Cash",
            notes: notes || ""
        });

        res.status(201).json({
            success: true,
            message: "Expense created successfully",
            data: expense
        });

    } catch (error) {
        console.error("Create Expense Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// GET ALL EXPENSES
// ===============================
const getExpenses = async (req, res) => {
    try {
        const {
            category,
            paymentMethod,
            search
        } = req.query;

        const query = {
            user: req.user._id
        };

        if (category) {
            query.category = category;
        }

        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        if (search) {
            query.notes = {
                $regex: search,
                $options: "i"
            };
        }

        const expenses = await Expense
            .find(query)
            .sort({ expenseDate: -1 });

        res.json({
            success: true,
            count: expenses.length,
            data: expenses
        });

    } catch (error) {
        console.error("Get Expenses Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// GET EXPENSE BY ID
// ===============================
const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found or unauthorized"
            });
        }

        res.json({
            success: true,
            data: expense
        });

    } catch (error) {
        console.error("Get Expense Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// UPDATE EXPENSE
// ===============================
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found or unauthorized"
            });
        }

        const allowedFields = [
            "amount",
            "category",
            "expenseDate",
            "paymentMethod",
            "notes"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                expense[field] = req.body[field];
            }
        });

        await expense.save();

        res.json({
            success: true,
            message: "Expense updated successfully",
            data: expense
        });

    } catch (error) {
        console.error("Update Expense Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// DELETE EXPENSE
// ===============================
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found or unauthorized"
            });
        }

        res.json({
            success: true,
            message: "Expense deleted successfully"
        });

    } catch (error) {
        console.error("Delete Expense Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// EXPENSE SUMMARY
// ===============================
const getExpenseSummary = async (req, res) => {

    console.log("🔥 NEW EXPENSE SUMMARY CODE RUNNING");

    try {
        const userId = req.user._id;

        const now = new Date();

        // ===============================
        // START OF CURRENT WEEK
        // ===============================
        const startOfWeek = new Date(now);

        startOfWeek.setHours(0, 0, 0, 0);

        startOfWeek.setDate(
            now.getDate() - now.getDay()
        );


        // ===============================
        // START OF CURRENT MONTH
        // ===============================
        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        startOfMonth.setHours(0, 0, 0, 0);


        // ===============================
        // ALL EXPENSES
        // ===============================
        const expenses = await Expense.find({
            user: userId
        });


        // ===============================
        // WEEKLY EXPENSES
        // ===============================
        const weeklyExpenses = await Expense.find({
            user: userId,
            expenseDate: {
                $gte: startOfWeek,
                $lte: now
            }
        });


        // ===============================
        // MONTHLY EXPENSES
        // ===============================
        const monthlyExpenses = await Expense.find({
            user: userId,
            expenseDate: {
                $gte: startOfMonth,
                $lte: now
            }
        });


        // ===============================
        // TOTAL EXPENSE
        // ===============================
        const totalExpenses = expenses.reduce(
            (total, expense) => {
                return total + expense.amount;
            },
            0
        );


        // ===============================
        // WEEKLY TOTAL
        // ===============================
        const weeklyTotal = weeklyExpenses.reduce(
            (total, expense) => {
                return total + expense.amount;
            },
            0
        );


        // ===============================
        // MONTHLY TOTAL
        // ===============================
        const monthlyTotal = monthlyExpenses.reduce(
            (total, expense) => {
                return total + expense.amount;
            },
            0
        );


        // ===============================
        // CATEGORY-WISE SUMMARY
        // ===============================
        const categorySummary = {};

        expenses.forEach((expense) => {

            if (!categorySummary[expense.category]) {
                categorySummary[expense.category] = 0;
            }

            categorySummary[expense.category] += expense.amount;
        });


        // ===============================
        // RESPONSE
        // ===============================
        res.json({
            success: true,
            data: {
                totalExpenses,
                weeklyTotal,
                monthlyTotal,
                totalRecords: expenses.length,
                categorySummary
            }
        });

    } catch (error) {

        console.error(
            "Expense Summary Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// EXPORT CONTROLLERS
// ===============================
module.exports = {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseSummary
};