import bcrypt from 'bcrypt';
import { customer_pool } from '../config/db.js'; 
import { generateToken } from '../config/jwt.js';
import { setAppCurrentUser, resetAppCurrentUser } from '../util/rlsProtectedQuery.js';

export const verifyUserCredentials = async (req, res) => {
    const { email, password } = req.body;

    try {
        await setAppCurrentUser(email); 

        const userQuery = `SELECT * FROM public."user" WHERE email = current_setting('app.current_user');`;
        const { rows } = await customer_pool.query(userQuery);

        if (rows.length === 0) {   return res.status(401).json({ message: 'Invalid email or password or server issue' });   }
        
        const user = rows[0];
        if (!user.password) {   return res.status(401).json({ message: 'password not in returned db_result' });   };

        const isMatch = await bcrypt.compare(password, user.password); 
        if (!isMatch) {   return res.status(401).json({ message: 'Invalid email or password' });   };

        const profile = {id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email};
        const token = generateToken(email);     // Generate JWT
        res.json({ message: 'Login successful', token: token, profile: profile });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await resetAppCurrentUser(); // Ensure cleanup 
    };
};
