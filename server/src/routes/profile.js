import { customer_pool } from '../config/db.js'; 
import { setAppCurrentUser, resetAppCurrentUser } from '../util/rlsProtectedQuery.js';

// ------------------ DELETE ------------------
export const deleteProfile = async (req, res) => {
    // middlware has ensured: token authorized, profile exists, applicable fields exist and are correct format, XSS nullified

    const email = res.locals.user.email;
    if (!email) {   throw new Error("Missing res.locals.user.email");   };

    try {
        await setAppCurrentUser(email); // Set session variable
        const deleteQuery = `
                    DELETE FROM public."user" 
                    WHERE email = current_setting('app.current_user') 
                    RETURNING firstname, lastname, email;
                `;

        const { rows } = await customer_pool.query(deleteQuery);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).send({ message: 'Profile successfully deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await resetAppCurrentUser(); // Ensure cleanup even in case of an error
    }
};

// ------------------ PUT ------------------
export const updateProfile = async (req, res) => {
    // middlware has ensured: token authorized, (if) new password has already been salt&hashed,
    // applicable fields exist and are correct format, no extra fields in body, XSS nullified,
    // email doesn't already exist

    const email = res.locals.user.email;
    if (!email) {   throw new Error("Missing res.locals.user.email");   };

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
export const getProfile = (req, res) => {
    const returnFields = ["id", "firstname", "lastname", "email", "created_at"];
    
    const profile = Object.fromEntries(
        Object.entries(req.user).filter(([key]) => returnFields.includes(key))
    );

    res.json({ message: 'Profile request successful', profile });
};

