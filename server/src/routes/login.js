import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';  // Use a separate file to manage DB connection

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// User Login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userQuery = 'SELECT id, email, password FROM users WHERE email = $1';
        const { rows } = await pool.query(userQuery, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, role: "customer" }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
