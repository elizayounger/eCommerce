import { customer_pool } from '../config/db.js';
import { setAppCurrentUser, resetAppCurrentUser } from '../util/rlsProtectedQuery.js';

export const addOrderPending = async (req, res, next) => {
    try {
        // Assuming you have some logic to create an order, e.g.:
        const { amount, currency } = req.body;
        
        setAppCurrentUser(email);
        
        const params = [req.user.id, currency, amount]; 
        const sqlQuery = `
            INSERT INTO public."order" (user_id, currency, total_price, status) 
            VALUES ($1, $2, $3, 'pending');`;

        const { rows } = await customer_pool.query(sqlQuery, params);

        // Attach the order ID to the request body for the next middleware (processPayment)
        req.body.orderId = order.id;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
};


export const loadOrders = async (req, res, next) => {
    // middleware has already: authenticated token,
    const email = res.locals.user.email;
    const user_id = req.user.id;
    const product_id = req.params.id;

    try {
        setAppCurrentUser(email);
        
        const params = [user_id, product_id]; 
        const sqlQuery = `
            SELECT * FROM public."order";`;

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

export const addOrder = async (req, res, next) => {
    // middleware has already: authenticated token,
    const email = res.locals.user.email;
    const user_id = req.user.id;
    const product_id = req.params.id;

    try {
        setAppCurrentUser(email);
        
        const params = [user_id, product_id]; 
        const sqlQuery = `
            INSERT INTO public."order" (id, user_id, order_date, total_price)
            VALUES ();`;

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