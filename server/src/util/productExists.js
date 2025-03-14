import { employee_pool } from "../config/db.js";

export const checkProductExists = async (req, res, next) => {
    // Assuming token authorization is handled in previous middleware
    const product_id = req.params.id;

    try {
        const userQuery = `SELECT * FROM public.product WHERE id = $1;`;
        const { rows } = await employee_pool.query(userQuery, [product_id]);

        if (rows.length === 0) {   return res.status(404).json({ message: 'Product not found' });   }

        const { id, name, description, price, stock_quantity } = rows[0];

        req.product = { id, name, description, price, stock_quantity };

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
