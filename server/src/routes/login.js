import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js'; 
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// User Login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userQuery =   `SELECT set_config('app.current_user', '$1', true);
                                SELECT * FROM public."user" 
                                WHERE email = current_setting('app.current_user');
                            COMMIT;`;
        const { rows } = await pool.query(userQuery, [email]);

        if (rows.length < 1) {
            return res.status(401).json({ message: 'Invalid email or password or server issue' }); // TODO: fix this statement
        }

        const user = rows[1];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        req.session.user = {
            id: user.id,
            email: user.email,
        };
      
        res.json({ message: 'Login successful', user: req.session.user });
        
        // Generate JWT token
        const token = jwt.sign({ userId: user, role: "customer" }, SECRET_KEY, { expiresIn: '1h' });  
          
        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
