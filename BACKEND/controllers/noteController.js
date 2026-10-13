const Note = require("../models/Note");

// ===============================
// CREATE NOTE
// ===============================
const createNote = async (req, res) => {
    try {
        const { title, content, category, isPinned, noteDate } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const note = await Note.create({
            user: req.user._id,
            title,
            content,
            category: category || "General",
            isPinned: isPinned || false,
            noteDate: noteDate || new Date()
        });

        res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: note
        });
    } catch (error) {
        console.error("Create Note Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// ===============================
// GET ALL NOTES
// ===============================
const getNotes = async (req, res) => {
    try {
        const { category, search, pinned } = req.query;

        const query = {
            user: req.user._id
        };

        if (category) {
            query.category = category;
        }

        if (pinned !== undefined) {
            query.isPinned = pinned === "true";
        }

        if (search) {
            query.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    content: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const notes = await Note.find(query)
            .sort({
                isPinned: -1,
                noteDate: -1
            });

        res.json({
            success: true,
            count: notes.length,
            data: notes
        });
    } catch (error) {
        console.error("Get Notes Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// ===============================
// GET SINGLE NOTE
// ===============================
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found or unauthorized"
            });
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        console.error("Get Note Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// ===============================
// UPDATE NOTE
// ===============================
const updateNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found or unauthorized"
            });
        }

        const allowedFields = [
            "title",
            "content",
            "category",
            "isPinned",
            "noteDate"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                note[field] = req.body[field];
            }
        });

        await note.save();

        res.json({
            success: true,
            message: "Note updated successfully",
            data: note
        });
    } catch (error) {
        console.error("Update Note Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// ===============================
// DELETE NOTE
// ===============================
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found or unauthorized"
            });
        }

        res.json({
            success: true,
            message: "Note deleted successfully"
        });
    } catch (error) {
        console.error("Delete Note Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// ===============================
// PIN / UNPIN NOTE
// ===============================
const togglePinNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found or unauthorized"
            });
        }

        note.isPinned = !note.isPinned;

        await note.save();

        res.json({
            success: true,
            message: note.isPinned
                ? "Note pinned successfully"
                : "Note unpinned successfully",
            data: note
        });
    } catch (error) {
        console.error("Toggle Pin Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

// ===============================
// EXPORT
// ===============================
module.exports = {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    togglePinNote
};