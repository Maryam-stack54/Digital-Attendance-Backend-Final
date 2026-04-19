 const jwt = require("jsonwebtoken");

const authentication = (req, res, next) => {
    const token =
        req.cookies?.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
        if (error) {
            return res.status(401).json({ message: "Session expired" });
        }

        req.user = { id: payload.id, role: payload.role };
        next();
    });
};

module.exports = authentication