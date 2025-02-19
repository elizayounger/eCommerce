import { customer_pool } from '../config/db.js';
import { setAppCurrentUser, resetAppCurrentUser } from '../util/rlsProtectedQuery.js';

export const addToCart = async (req, res, next) => {
    const email = res.locals.user.email;

    try {
        setAppCurrentUser(email);
        
        // Using parameterized query to fetch user-specific cart items
        const sqlQuery = `
            SELECT product_name, quantity, cart_total 
            FROM customer_cart 
            WHERE user_id = $1
            ORDER BY 1;`;
        const result = await customer_pool.query(sqlQuery, [req.user.id]);

        // Send the cart data to the client
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load cart', details: err.message });
    } finally {
        resetAppCurrentUser();
    }
};

export const loadCart = async (req, res, next) => {
    const email = res.locals.user.email;

    try {
        setAppCurrentUser(email);
        
        // Using parameterized query to fetch user-specific cart items
        const sqlQuery = `
            SELECT product_name, quantity, cart_total 
            FROM customer_cart 
            WHERE user_id = $1
            ORDER BY 1;`;
        const result = await customer_pool.query(sqlQuery, [req.user.id]);

        // Send the cart data to the client
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load cart', details: err.message });
    } finally {
        resetAppCurrentUser();
    }
};