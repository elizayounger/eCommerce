import { customer_pool } from "../config/db.js";
import { setAppCurrentUser, resetAppCurrentUser } from "./rlsProtectedQuery.js";

export const assertCartItem = async (req, res, next) => {
    // middleware has authenticated token, validated request body, assertained product existence
    const email = res.locals.user.email;
    const user_id = req.user.id;
    const { id } = req.params; // TODO: ensure all cart routes use query instead of body

    try {
        setAppCurrentUser(email);

        const userQuery = `SELECT product_id, quantity FROM public.cart_item WHERE user_id = $1;`;

        const { rows, rowCount } = await customer_pool.query(userQuery, [user_id]);

        if (rowCount === 0) {   return res.status(404).json({   message: "User Cart empty, no item to update"   });     }

        let item_found = rows.some(cart_item => cart_item.product_id.toString() === id && cart_item.quantity > 0);

        if (!item_found) {   return res.status(404).json({ message: "User Cart item not found", rows: rows, product_id: id });   }

        next();

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        resetAppCurrentUser();
    }
};
