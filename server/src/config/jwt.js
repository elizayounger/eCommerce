import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const generateToken = (email) => {
    const token = jwt.sign( 
        { email: email },
        JWT_SECRET,
        { expiresIn: '1h' } 
    );
    return token;
};

export const generateRenewalToken = (email) => {
    const token = jwt.sign( 
        { email: email },
        JWT_SECRET,
        { expiresIn: '48h' } 
    );
    return token;
};
// TODO: maybe add renewal token