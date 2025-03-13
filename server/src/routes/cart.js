import { customer_pool } from '../config/db.js';
import { setAppCurrentUser, resetAppCurrentUser } from '../util/rlsProtectedQuery.js';

export const addToCart = async (req, res, next) => {
    const email = res.locals.user.email;

    try {
        setAppCurrentUser(email);
        
        const sqlQuery = `
            SELECT product_name, quantity, cart_total 
            FROM customer_cart 
            WHERE user_id = $1;`;
        const rows = await customer_pool.query(sqlQuery, [req.user.id]);

        if (!rows.length > 0) {   return res.json({message: `No items in user cart`})  }
        
        return res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load cart', details: err.message });
    } finally {
        resetAppCurrentUser();
    }
};

export const loadCart = async (req, res, next) => {
    // middleware has already: authenticated token, fetched user and saved in req.user, initialised res.locals.response
    const email = res.locals.user.email;

    try {
        setAppCurrentUser(email);
        
        const sqlQuery = `
            SELECT product_name, quantity, cart_total 
            FROM customer_cart 
            WHERE user_id = $1;`;
        const { rows } = await customer_pool.query(sqlQuery, [req.user.id]);

        if (!rows.length > 0) {   return res.json({message: `No items in user cart`})  }
        
        res.locals.response.cart = rows;

        return next();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load cart', details: err.message });
    } finally {
        resetAppCurrentUser();
    }
};