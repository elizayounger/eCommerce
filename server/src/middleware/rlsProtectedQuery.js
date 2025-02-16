import { customer_pool } from '../config/db.js';

export const setAppCurrentUser = async (email) => {
    try {
        await customer_pool.query(`SELECT set_config('app.current_user', $1, false);`, [email]);
    } catch (err) {
        console.error('Error setting app.current_user:', err);
        throw new Error('Failed to set current user session variable');
    }
};

export const resetAppCurrentUser = async () => {
    try {
        await customer_pool.query(`SELECT set_config('app.current_user', 'none', false);`);
    } catch (err) {
        console.error('Error resetting app.current_user:', err);
        throw new Error('Failed to reset current user session variable');
    }
};
