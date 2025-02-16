import { pool } from "../config/db";

export const saltHashPassword = async (req, res, next) => {

    const { email } = req.body; // user details

    if (!email) return next();

    

    next();
}