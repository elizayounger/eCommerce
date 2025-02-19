// --------------------- CONFIG ---------------------
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db.js'; // Import db config settings

dotenv.config();

const app = express();
app.use(express.json());
connectDB(); // connect to database

// --------------------- IMPORTS ---------------------

import {                                                               // middleware
   validateRegister, 
   validateLogin, 
   validateProfile,
   validateAddProducts,
   validateUpdateProducts,
   validateDeleteProducts
} from './middleware/validateRequest.js';     
import { authenticateToken } from './middleware/authenticateToken.js';  // middleware
import { saltHashPassword } from './middleware/saltHashPassword.js'; // middleware
import { checkPreExistingEmail } from './middleware/checkDuplicateEmail.js'; // middleware
import { checkProductExists } from './middleware/productExists.js'; // middleware

import { loadProducts } from './routes/home.js'; 
import { registerUser } from './routes/register.js';
import { verifyUserCredentials } from './routes/login.js';
import { getProfile, updateProfile, deleteProfile } from './routes/profile.js';
import { addProducts, updateProducts, deleteProducts } from './routes/products.js';
import { loadCart, addToCart } from './routes/cart.js';

// --------------------- ROUTES ---------------------

app.get('/', loadProducts);

app.post('/register', validateRegister, saltHashPassword, registerUser);

app.post('/login', validateLogin, verifyUserCredentials);

app.get('/profile', authenticateToken, getProfile);

app.put('/profile', authenticateToken, checkPreExistingEmail, validateProfile, saltHashPassword, updateProfile);

app.delete('/profile', authenticateToken, validateLogin, deleteProfile);

//  TODO: Taken away authorise employee so need to do that check before doing these product endpoints
app.post('/products', authenticateToken, validateAddProducts, addProducts);

app.put('/products', authenticateToken, validateUpdateProducts, updateProducts);

app.delete('/products', authenticateToken, validateDeleteProducts, deleteProducts);

app.get('/cart', authenticateToken, loadCart);

app.post('/cart', authenticateToken, checkProductExists, addToCart);


// --------------------- SERVER SETUP ---------------------

const PORT =  process.env.SERVER_PORT || 3000; 

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
