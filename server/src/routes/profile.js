import { customer_pool } from '../config/db.js'; 
import { setAppCurrentUser, resetAppCurrentUser } from '../middleware/rlsProtectedQuery.js';

// ------------------ PUT ------------------
export const updateProfile = async (req, res) => {
    // middlware has ensured: token authorized, (if) new password has already been salt&hashed,
    // applicable fields exist and are correct format, no extra fields in body, XSS nullified
    // email doesn't already exist?

    const email = req.user.email;
    if (!email) {   throw new Error("Missing req.user.email");   };

    try {
        await setAppCurrentUser(email); // Set current user for RLS

        const updates = [];
        const params = [];
        let index = 1;

        Object.entries(req.body).forEach(([key, value]) => {
            updates.push(`${key} = $${index}`);
            params.push(value);
            index++;
        });

        let query = `
            UPDATE public."user" SET ${updates.join(", ")} 
            WHERE email = current_setting('app.current_user') 
            RETURNING firstname, lastname, email;`;

        const { rows: updatedRows } = await customer_pool.query(query, params);
        if (updatedRows.length === 0) {   return res.status(400).json({ message: 'Failed to update profile' });   }

        const updatedProfile = updatedRows[0];
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
        const { rows } = await customer_pool.query(userQuery);

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
