const express = require("express");

const router = express.Router();

const {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    togglePinNote
} = require("../controllers/noteController");

const authMiddleware = require("../middleware/authMiddleware");

// ===============================
// ALL NOTE ROUTES ARE PROTECTED
// ===============================
router.use(authMiddleware);

// ===============================
// GET ALL NOTES
// CREATE NOTE
// ===============================
router.route("/")
    .get(getNotes)
    .post(createNote);

// ===============================
// GET / UPDATE / DELETE NOTE
// ===============================
router.route("/:id")
    .get(getNoteById)
    .put(updateNote)
    .delete(deleteNote);

// ===============================
// PIN / UNPIN NOTE
// ===============================
router.patch("/:id/pin", togglePinNote);

module.exports = router;