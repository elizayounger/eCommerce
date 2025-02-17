import { employee_pool } from "../config/db.js";

export const checkProductExists = async (req, res, next) => {
    // previous middlware has ensured: token authorized 
    let errors = []

    try {
        let params = [];
        const userQuery = `SELECT * FROM public.product WHERE id = $1;`;
        const { rows } = await employee_pool.query(userQuery);

        if (rows.length === 0) {    return res.status(404).json({ message: 'User not found' });   };

        const product = rows[0];

        if (!product.name) {
            // TODO: add error to list and send altogether to user when finished
        };

        req.user = {id: profile.id, firstname: profile.firstname, lastname: profile.lastname, email: profile.email};

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
