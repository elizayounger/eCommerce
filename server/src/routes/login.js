import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js'; 
// import { sessionMiddleware } from '../config/session.js'; 

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

        req.session.user = {
            id: user.id,
            email: user.email,
            username: user.username, // Store any other necessary user info
        };
      
        res.json({ message: 'Login successful', user: req.session.user });
        
        // Generate JWT token
        const token = jwt.sign({ userId: user.id, role: "customer" }, SECRET_KEY, { expiresIn: '1h' });  
          
        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
