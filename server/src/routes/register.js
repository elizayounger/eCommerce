import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../config/jwt.js';

export const registerUser = async (req, res) => {

    const { firstname, lastname, email, hashedPassword } = req.body; // user details
    
    const params = [firstname, lastname, email, hashedPassword];

    try {
        const result = await pool.query(
            'INSERT INTO public."user" (firstname, lastname, email, password) VALUES ($1, $2, $3, $4)',
            params
        );

        const token = generateToken(email);

        res.status(201).json({ message: 'User registered successfully', token }); // Send response with token

    } catch (err) {
        console.error('Registration Error:', err);
        
        if (err.code === '23505') { // Unique constraint violation (email already exists)
            return res.status(400).json({ message: 'Email is already registered' });
        }

        res.status(500).json({ message: 'Internal Server Error' });
    }
};

