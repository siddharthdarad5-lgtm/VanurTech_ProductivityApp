const Event = require("../models/Event");

// ===============================
// CREATE EVENT
// ===============================
const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            eventDate,
            reminderMinutesBefore,
            repeat,
            customRepeatDays,
            notificationEnabled,
            notificationChannels
        } = req.body;

        if (!title || !eventDate) {
            return res.status(400).json({
                success: false,
                message: "Title and event date are required"
            });
        }

        const event = await Event.create({
            user: req.user._id,
            title,
            description: description || "",
            category: category || "Personal",
            eventDate,
            reminderMinutesBefore: reminderMinutesBefore || 0,
            repeat: repeat || "once",
            customRepeatDays: customRepeatDays || [],
            notificationEnabled:
                notificationEnabled !== undefined
                    ? notificationEnabled
                    : true,
            notificationChannels:
                notificationChannels || ["in-app"]
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event
        });

    } catch (error) {
        console.error("Create Event Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// GET ALL EVENTS
// ===============================
const getEvents = async (req, res) => {
    try {
        const {
            category,
            status,
            repeat,
            search
        } = req.query;

        const query = {
            user: req.user._id
        };

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        if (repeat) {
            query.repeat = repeat;
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
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const events = await Event
            .find(query)
            .sort({ eventDate: 1 });

        res.json({
            success: true,
            count: events.length,
            data: events
        });

    } catch (error) {
        console.error("Get Events Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// GET EVENT BY ID
// ===============================
const getEventById = async (req, res) => {
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found or unauthorized"
            });
        }

        res.json({
            success: true,
            data: event
        });

    } catch (error) {
        console.error("Get Event Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// UPDATE EVENT
// ===============================
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found or unauthorized"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "category",
            "eventDate",
            "reminderMinutesBefore",
            "repeat",
            "customRepeatDays",
            "notificationEnabled",
            "notificationChannels"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                event[field] = req.body[field];
            }
        });

        await event.save();

        res.json({
            success: true,
            message: "Event updated successfully",
            data: event
        });

    } catch (error) {
        console.error("Update Event Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// DELETE EVENT
// ===============================
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found or unauthorized"
            });
        }

        res.json({
            success: true,
            message: "Event deleted successfully"
        });

    } catch (error) {
        console.error("Delete Event Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// COMPLETE EVENT
// ===============================
const completeEvent = async (req, res) => {
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found or unauthorized"
            });
        }

        event.status = "completed";
        event.completedAt = new Date();
        event.snoozedUntil = null;

        await event.save();

        res.json({
            success: true,
            message: "Event completed successfully",
            data: event
        });

    } catch (error) {
        console.error("Complete Event Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// SNOOZE EVENT
// ===============================
const snoozeEvent = async (req, res) => {
    try {
        const { snoozedUntil } = req.body;

        if (!snoozedUntil) {
            return res.status(400).json({
                success: false,
                message: "Snooze date and time are required"
            });
        }

        const event = await Event.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found or unauthorized"
            });
        }

        event.status = "snoozed";
        event.snoozedUntil = snoozedUntil;

        await event.save();

        res.json({
            success: true,
            message: "Event snoozed successfully",
            data: event
        });

    } catch (error) {
        console.error("Snooze Event Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};


// ===============================
// RESCHEDULE EVENT
// ===============================
const rescheduleEvent = async (req, res) => {
    try {
        const { eventDate } = req.body;

        if (!eventDate) {
            return res.status(400).json({
                success: false,
                message: "New event date and time are required"
            });
        }

        const event = await Event.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found or unauthorized"
            });
        }

        event.eventDate = eventDate;
        event.status = "pending";
        event.snoozedUntil = null;
        event.completedAt = null;

        await event.save();

        res.json({
            success: true,
            message: "Event rescheduled successfully",
            data: event
        });

    } catch (error) {
        console.error("Reschedule Event Error:", error);

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
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    completeEvent,
    snoozeEvent,
    rescheduleEvent
};