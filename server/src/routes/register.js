import bcrypt from 'bcrypt';
import { pool } from '../db.js';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, hashedPassword, 'customer']
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
