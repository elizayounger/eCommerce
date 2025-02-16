import { employee_pool } from "../config/db.js";

export const checkPreExistingEmail = async (req, res, next) => {
    // Previous middleware has ensured: token authorized, (if) new password has already been salt & hashed,
    // applicable fields exist and are correct format, no extra fields in body, XSS nullified

    // Check if email is being updated
    const { email } = req.body;
    if (!email) return next();

    const query = `
        SELECT email 
        FROM public."user"
        WHERE email = $1`;

    try {
        const { rows } = await employee_pool.query(query, [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'The email you have input already belongs to another account. Please try again.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }

    next();
}
