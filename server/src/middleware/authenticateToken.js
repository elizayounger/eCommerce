import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from '../config/db.js'; 

dotenv.config();

// Ensure JWT_SECRET is set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {   throw new Error("Missing JWT_SECRET environment variable");   }

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: `Unauthorized. authheader: ${JSON.stringify(authHeader)}` });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        const email = decoded.email;

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return res.status(400).json({ message: "Invalid email in token" });
        }

        req.user = decoded;
        res.locals.user = decoded;  // Store user info in res.locals for middleware safety

        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(403).json({ message: 'Invalid token' });
    }
};
