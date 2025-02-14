import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

export const registerUser = async (req, res) => {

    const { firstname, lastname, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);        
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const params = [firstname, lastname, email, hashedPassword];

    try {
        const result = await pool.query(
            'INSERT INTO public."user" (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
            params
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};