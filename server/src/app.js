// --------------------- CONFIG ---------------------
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db.js'; // Import db config settings

dotenv.config();

const app = express();
app.use(express.json());
connectDB(); // connect to database

// --------------------- IMPORTS ---------------------

import { 
   validateRegister, 
   validateLogin, 
   validateProfile
   } from './middleware/validateRequest.js';     // middleware
import { authenticateToken } from './middleware/authenticateToken.js';  // middleware
import { saltHashPassword } from './middleware/saltHashPassword.js'; // middleware
import { checkPreExistingEmail } from './middleware/checkDuplicateEmail.js'; // middleware
import { checkProfileExists } from './middleware/profileExists.js' // middleware

import { loadProducts } from './routes/home.js'; 
import { registerUser } from './routes/register.js';
import { verifyUserCredentials } from './routes/login.js';
import { getProfile, updateProfile, deleteProfile } from './routes/profile.js';

// --------------------- ROUTES ---------------------

app.get('/', loadProducts);

app.post('/register', validateRegister, saltHashPassword, registerUser);

app.post('/login', validateLogin, verifyUserCredentials);

app.get('/profile', authenticateToken, getProfile);

app.put('/profile', authenticateToken, checkProfileExists, checkPreExistingEmail, validateProfile, saltHashPassword, updateProfile);

app.delete('/profile', authenticateToken, checkProfileExists, validateLogin, deleteProfile);

// --------------------- SERVER SETUP ---------------------

const PORT =  process.env.SERVER_PORT || 3000; 

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
