import { customer_pool } from "../config/db.js";
import { setAppCurrentUser, resetAppCurrentUser } from './rlsProtectedQuery.js';

export const checkProfileExists = async (req, res, next) => {
    // previous middlware has ensured: token authorized 

    const email = res.locals.user.email;
    if (!email) {   throw new Error("Missing res.locals.user.email");   };

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

        req.user = {firstname: profile.firstname, lastname: profile.lastname};

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await resetAppCurrentUser(); // Ensure cleanup even in case of an error
    }
};
