// PARAMS CHECK

// BODY CHECK
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;  // Attach user info to request
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};
