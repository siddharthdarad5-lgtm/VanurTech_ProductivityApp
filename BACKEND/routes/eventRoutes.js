const express = require("express");

const router = express.Router();

const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    completeEvent,
    snoozeEvent,
    rescheduleEvent
} = require("../controllers/eventController");

const authMiddleware = require("../middleware/authMiddleware");

// ===============================
// AUTHENTICATION
// ===============================
router.use(authMiddleware);

// ===============================
// GET ALL EVENTS + CREATE EVENT
// ===============================
router.route("/")
    .get(getEvents)
    .post(createEvent);

// ===============================
// GET / UPDATE / DELETE EVENT
// ===============================
router.route("/:id")
    .get(getEventById)
    .put(updateEvent)
    .delete(deleteEvent);

// ===============================
// COMPLETE EVENT
// ===============================
router.patch("/:id/complete", completeEvent);

// ===============================
// SNOOZE EVENT
// ===============================
router.patch("/:id/snooze", snoozeEvent);

// ===============================
// RESCHEDULE EVENT
// ===============================
router.patch("/:id/reschedule", rescheduleEvent);

module.exports = router;