import { customer_pool } from "../config/db.js";

export const fetchUser = async (email) => {
    try {
        const result = await customer_pool.query(`SELECT * FROM public."user" WHERE email = $1`, [email]);
        return result.rows; 
    } catch (error) {
        console.log('❌ Error fetching user:', error); 
        throw error; 
    }
};
