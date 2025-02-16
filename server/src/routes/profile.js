import { query } from 'express';
import { pool } from '../config/db.js'; 
import { setAppCurrentUser, resetAppCurrentUser } from '../middleware/rlsProtectedQuery.js';

// ------------------ PUT ------------------
export const updateProfile = async (req, res) => {
    const { firstname, lastname, email, hashedPassword } = req.body;
    
    try {
        await setAppCurrentUser(email); // Set session variable

        // Fetch current profile to make sure profile exists
        const userQuery = `
            SELECT firstname, lastname, email 
            FROM public."user" 
            WHERE email = current_setting('app.current_user');
        `;

        const { rows } = await pool.query(userQuery);
        if (rows.length === 0) {   return res.status(404).json({ message: 'User not found' });   };

        const params = [firstname, lastname, email];

        const queryBuilder = `
            UPDATE public."user"
            SET firstname = $1 
            SET lastname = $2
            SET email = $3 `;

        if (hashedPassword) {
            queryBuilder += `SET password = $3 `;
            params.push(hashedPassword);
        }

        queryBuilder += `WHERE email = current_setting('app.current_user');`;

        const updateResult = await pool.query(queryBuilder, params);

        if (updateResult.rows.length === 0) {
            return res.status(400).json({ message: 'Failed to update profile' });
        }

        const updatedProfile = updateResult.rows[0];

        res.json({ message: 'Profile updated successfully', profile: updatedProfile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await resetAppCurrentUser(); // Ensure cleanup
    }
};


// ------------------ GET ------------------
export const getProfile = async (req, res) => {
    const email = req.user.email;
    if (!email) {   throw new Error("Missing req.user.email");   };

    try {
        await setAppCurrentUser(email); // Set session variable

        const userQuery = `SELECT firstname, lastname, email FROM public."user" WHERE email = current_setting('app.current_user');`;
        const { rows } = await pool.query(userQuery);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        };

        const profile = rows[0];

        if (!profile.firstname || !profile.lastname || !profile.email) {
            return res.status(400).json({ message: 'Missing profile information in database' });
        };

        res.json({ message: 'Profile request successful', profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await resetAppCurrentUser(); // Ensure cleanup even in case of an error
    }
};
