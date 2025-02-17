import { employee_pool } from "../config/db.js";

export const authoriseEmployee = async (req, res, next) => {
    try {
        // Token has been authorized in previous middleware
        const email = res.locals.user.email; 

        const query = `
            SELECT id, firstname, lastname, role 
            FROM public."user"
            WHERE email = $1`;

        const { rows } = await employee_pool.query(query, [email]);

        if (rows.length !== 1) {
            return res.status(404).json({ message: "User not found" });
        }

        if (rows[0].role !== "employee") {
            return res.status(403).json({ message: "User not authorized as employee" }); 
        }
        req.user = rows[0];

        next();

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
