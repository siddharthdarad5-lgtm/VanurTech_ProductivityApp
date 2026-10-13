
const express = require("express");
const router = express.Router();

const { getDashboard } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// All dashboard routes require login
router.use(authMiddleware);

// Get dashboard data
router.get("/", getDashboard);

module.exports = router; 