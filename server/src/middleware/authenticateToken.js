import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { setAppCurrentUser, resetAppCurrentUser } from '../util/rlsProtectedQuery.js';
import { fetchUser } from '../util/fetchUser.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {  throw new Error("Missing JWT_SECRET environment variable"); }

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: `Unauthorized. authheader: ${JSON.stringify(authHeader)}` });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const email = decoded.email;

        if (!email || typeof email !== "string" || !email.includes("@")) {   return res.status(400).json({ message: "Invalid email in token" });   }
 
        await setAppCurrentUser(email);
        const user = await fetchUser(email);
        if (user.length === 0) {    return res.status(404).json({ message: "User not found" });   }

        req.user = user[0];
        res.locals.user = decoded; // Store user info for further middleware use
        res.locals.response = {}; 

        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(403).json({ message: "Invalid token" });
    } finally {
        resetAppCurrentUser();
    }
};
