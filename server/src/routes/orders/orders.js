import { customer_pool, employee_pool } from '../../config/db.js';
import { setAppCurrentUser, resetAppCurrentUser } from '../../util/rlsProtectedQuery.js';

export const updateOrderStatus = async (transaction_id, newStatus) => {
    try {
        const params = [newStatus, transaction_id]; 
        const sqlQuery = `
            UPDATE public."order"
            SET status = $1
            WHERE transaction_id = $2
            RETURNING id;  -- Return updated row for confirmation
        `;

        const { rows } = await employee_pool.query(sqlQuery, params);

        if (rows.length > 0) {
            return rows[0];  // Return the updated order
        }
        return null;  // Return null if no row was updated
        
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;  // Rethrow for better error handling
    }
};


export const addOrderPending = async (req, res, next) => {
    try {
        // Assuming you have some logic to create an order, e.g.:
        let { amount, currency, transaction_id } = req.body;

        amount = parseFloat((amount / 100).toFixed(2)); // Convert currency to a float with two decimals
        
        setAppCurrentUser(req.user.email);

        // Set the params for the query
        const params = [req.user.id, currency, amount, transaction_id]; 
        
        // Insert the order into the database
        const sqlQuery = `
            INSERT INTO public."order" (user_id, currency, total_price, status, transaction_id) 
            VALUES ($1, $2, $3, 'pending', $4) 
            RETURNING id;`;  // Use RETURNING to get the id of the inserted order

        // Execute the query and get the result
        const { rows } = await customer_pool.query(sqlQuery, params);

        // Attach the order ID to the request body for the next middleware (processPayment)
        req.body.orderId = rows[0].id; // Access the id from the returned rows
        
        // Add success message
        res.locals.response.order = "Pending order successfully added";

        // Pass control to the next middleware
        return next();

    } catch (error) {
        // Handle errors and return a detailed message
        res.status(500).json({
            message: 'Failed to create order',
            error: error.message,
            user_id: req.user.id,
            body: req.body
        });
    }
};

export const loadOrders = async (req, res, next) => {
    // Assuming the user is already authenticated and user info is available
    const email = res.locals.user.email;
    const user_id = req.user.id;

    try {
        // Setting the current user (this function should be implemented elsewhere in the codebase)
        setAppCurrentUser(email);
        
        // Parameterized SQL query to fetch user orders
        const sqlQuery = `
            SELECT * FROM public."order"
            WHERE user_id = $1;`;

        const { rows } = await customer_pool.query(sqlQuery, [user_id]);

        res.locals.response.orders = rows;

        return next();
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch customer orders', details: err.message });
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