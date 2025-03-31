import { customer_pool, employee_pool } from '../config/db.js';
import { setAppCurrentUser, resetAppCurrentUser } from '../util/rlsProtectedQuery.js';
import { sufficientStock } from '../util/sufficientStock.js';

export const clearCart = async (user_id) =>  {
    try { 
        const sqlQuery = `
            DELETE FROM public.cart_item 
            WHERE user_id = $1;`;
        
        const { rows } = employee_pool.query(sqlQuery, [user_id])

    } catch (error) {
        console.error('Clear cart unsuccessful');
    }
}

export const deleteCartItem = async (req, res, next) => {
    // middleware has already: authenticated token, fetched user and saved in req.user, initialised res.locals.response
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

export const updateCart = async (req, res, next) => {
    // middleware has: authenticated token, validated body & asserted product existence/details
    const email = res.locals.user.email;
    const user_id = req.user.id;
    const product_id = req.product.id;
    const product_stock = req.product.stock_quantity;
    const quantity = req.body.quantity;

    try {
        // Set the current user for context
        setAppCurrentUser(email);

        // Check for sufficient stock
        if (!sufficientStock(product_stock, quantity)) {
            return res.status(400).json({ message: 'Insufficient stock available' });
        }

        const params = [quantity, user_id, product_id]; 
        const sqlQuery = `
            UPDATE public.cart_item
            SET quantity = $1
            WHERE user_id = $2
            AND product_id = $3;`;

        // Execute the update query
        const { rowCount } = await customer_pool.query(sqlQuery, params);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Set success message in the response object
        res.locals.response = { message: 'Successfully updated cart item' };

        // Call the next middleware
        return next();

    } catch (err) {
        // Log the error (should consider using a logging framework)
        console.error('Error updating cart:', err);

        // Return a 500 error with message
        return res.status(500).json({ error: 'Failed to update cart', details: 'An unexpected error occurred' });

    } finally {
        // Reset current user context
        resetAppCurrentUser();
    }
};


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

        console.log(rows);

        if (!rows.rowCount > 0) {   return res.status(400).json({message: `Failed to add item to cart`})  }
        
        res.locals.response.cart = rows;

        return next();

    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ 
                error: 'Item already in cart, please update existing cart item quantity', 
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
            SELECT product_id, product_name, quantity, cart_total 
            FROM customer_cart 
            WHERE user_id = $1;`;
        const { rows } = await customer_pool.query(sqlQuery, [req.user.id]);

        if (!rows.length > 0) {   return res.json({message: `No items in user cart`})  }
        
        res.locals.response.cart = rows;
        req.user.cart = rows;

        return next();

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to load cart', details: err.message });
    } finally {
        resetAppCurrentUser();
    }
};