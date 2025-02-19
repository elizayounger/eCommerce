import { customer_pool } from '../config/db.js';

export const setAppCurrentUser = async (email) => {
    try {
        await customer_pool.query(`SELECT set_config('app.current_user', $1, false);`, [email]);
        console.log(`✅ PostgreSQL session set for user: ${email}`);
    } catch (error) {
        console.error("❌ Error setting PostgreSQL session variable:", error);
        throw error;
    }
};

export const resetAppCurrentUser = async () => {
    try {
        await customer_pool.query(`SELECT set_config('app.current_user', NULL, false);`);
    } catch (error) {
        console.error('❌ Error resetting app.current_user:', err);
        throw error;
    }
};
