const jwt = require("jsonwebtoken");

// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================
const authMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        // Check if token exists
        if (!authHeader) {
            return res.status(401).json({
                message: "Access denied. No token provided"
            });
        }

        // Check Bearer format
        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        const token = parts[1];

        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store authenticated user information
        // JWT contains "id", while controllers use "_id"
        req.user = {
            _id: decoded.id,
            email: decoded.email
        };

        // Continue to controller
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// ===============================
// EXPORT
// ===============================
module.exports = authMiddleware;