import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export const authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {   return res.status(401).json({ message: 'Unauthorized' });   }

    try {    
        const decoded = jwt.verify(token, SECRET_KEY); // Verify token
        const email = decoded.email;
        req.user = decoded;  // Attach user info to request

        await pool.query(`SET app.current_user = $1`, [email]); // Set the session variable for app.current_user

        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};