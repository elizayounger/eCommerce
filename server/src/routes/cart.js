import { customer_pool } from '../config/db.js';
import { setAppCurrentUser, resetAppCurrentUser } from '../util/rlsProtectedQuery.js';
import { sufficientStock } from '../util/sufficientStock.js';

export const addToCart = async (req, res, next) => {
    // middleware has: authenticated token, validated body & asserted product existence/details
    const email = res.locals.user.email;
    const user_id = req.user.id;
    const product_id = req.product.id;
    const product_stock = req.product.stock_quantity;
    const quantity = req.body.quantity;

    try {
        setAppCurrentUser(email);

        if ( !sufficientStock(product_stock, quantity) ) {   return res.json({message: `Insufficient stock`});   }

        const params = [user_id, product_id, quantity];
        const sqlQuery = `
            INSERT INTO public.cart_item (user_id, product_id, quantity)
            VALUES ($1, $2, $3);`;
        
        const rows = await customer_pool.query(sqlQuery, params);

        if (!rows.rowCount > 0) {   return res.status(400).json({message: `Failed to add item to cart`})  }
        
        res.locals.response.cart = rows;

        return next();

    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ 
                error: 'Item already in cart, please update existing', 
                details: err.message 
            });
        }
        return res.status(500).json({ error: 'Failed to add to cart', details: err.message });
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
        return res.status(500).json({ error: 'Failed to load cart', details: err.message });
    } finally {
        resetAppCurrentUser();
    }
};