import { customer_pool } from '../config/db.js';
import { setAppCurrentUser, resetAppCurrentUser } from '../util/rlsProtectedQuery.js';

export const loadOrders = async (req, res, next) => {
    // middleware has already: authenticated token,
    const email = res.locals.user.email;
    const user_id = req.user.id;
    const product_id = req.params.id;

    try {
        setAppCurrentUser(email);
        
        const params = [user_id, product_id]; 
        const sqlQuery = `
            DELETE FROM public.cart_item 
            WHERE user_id = $1
            AND product_id = $2
            RETURNING *;`;

        const { rows } = await customer_pool.query(sqlQuery, params);

        if (!rows.length > 0) {   return res.json({message: `Unsuccessful deletion from cart`})  }
        
        res.locals.response.cart = rows;

        return next();

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete from cart', details: err.message });
    } finally {
        resetAppCurrentUser();
    }
};