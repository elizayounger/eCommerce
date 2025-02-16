import bcrypt from 'bcrypt';
import { customer_pool } from '../config/db.js'; 
import { generateToken } from '../config/jwt.js';
import { setAppCurrentUser, resetAppCurrentUser } from '../middleware/rlsProtectedQuery.js';

export const verifyUserCredentials = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Set the db app.current_user variable
        await setAppCurrentUser(email); 

        // Query user table based on session variable (meaning app.current_user) for profile details
        const userQuery = `SELECT password FROM public."user" WHERE email = current_setting('app.current_user');`;
        const { rows } = await customer_pool.query(userQuery);

        // if nothing returned throw error
        if (rows.length === 0) {   
            return res.status(401).json({ message: 'Invalid email or password or server issue' });   
        }
        
        // if nothing returned throw error cont.
        const user = rows[0];
        if (!user.password) {   
            return res.status(401).json({ message: 'password not in returned db_result' });   
        };

        // Check password matches
        const isMatch = await bcrypt.compare(password, user.password); 
        if (!isMatch) {   
            return res.status(401).json({ message: 'Invalid email or password' });   
        };

        // Generate JWT
        const token = generateToken(email);
        res.json({ message: 'Login successful', token: token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await resetAppCurrentUser(); // Ensure cleanup 
    };
};
