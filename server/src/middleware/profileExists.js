import { employee_pool } from "../config/db.js";

export const checkProfileExists = async (req, res, next) => {
    // previous middlware has ensured: token authorized 

    try {
        const userQuery = `SELECT id, firstname, lastname, email FROM public."user" WHERE email = current_setting('app.current_user');`;
        const { rows } = await employee_pool.query(userQuery);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        };

        const profile = rows[0];

        if (!profile.firstname || !profile.lastname || !profile.email) {
            return res.status(400).json({ message: 'Missing profile information in database' });
        };

        req.user = {id: profile.id, firstname: profile.firstname, lastname: profile.lastname, email: profile.email};

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
