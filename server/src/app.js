// --------------------- CONFIG ---------------------
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db.js'; // Import db config settings
// import pkg from 'cors';
// const { cors } = pkg;
// TODO: add cors
// TODO: add helmet
// TODO: add config.db controlling who db accepts connection requests from 
// TODO: change port number from default
// TODO: ensure csrf protected

dotenv.config();

const app = express();
app.use(express.json());
// app.use(cors());
connectDB(); // connect to database

// --------------------- IMPORTS ---------------------

import {                                                               // middleware
   validateRegister, 
   validateLogin, 
   validateProfile,
   validateAddProduct,
   validateUpdateProduct,
   validateDeleteProduct,
   validateAddToCart
} from './middleware/validateRequest.js';     
import { authenticateToken } from './middleware/authenticateToken.js';  // middleware
import { saltHashPassword } from './middleware/saltHashPassword.js'; // middleware
import { checkPreExistingEmail } from './middleware/checkDuplicateEmail.js'; // middleware
import { checkProductExists } from './util/productExists.js'; // middleware

import { loadProducts } from './routes/home.js'; 
import { registerUser } from './routes/register.js';
import { verifyUserCredentials } from './routes/login.js';
import { getProfile, updateProfile, deleteProfile } from './routes/profile.js';
import { addProduct, updateProduct, deleteProduct } from './routes/products.js';
import { loadCart, addToCart } from './routes/cart.js';
import { finalHandler } from './util/finalHandler.js';

// --------------------- ROUTES ---------------------
``
app.get('/', loadProducts);

app.post('/register', validateRegister, saltHashPassword, registerUser);

app.post('/login', validateLogin, verifyUserCredentials);

app.get('/profile', authenticateToken, getProfile); // TODO: '/:id'

app.put('/profile', authenticateToken, checkPreExistingEmail, validateProfile, saltHashPassword, updateProfile); // TODO: '/:id'

app.delete('/profile', authenticateToken, validateLogin, deleteProfile); // TODO: '/:id'

app.post('/products', authenticateToken, validateAddProduct, addProduct, finalHandler);

app.put('/products', authenticateToken, validateUpdateProduct, checkProductExists, updateProduct, finalHandler); // TODO: '/:id'

app.delete('/products', authenticateToken, validateDeleteProduct, checkProductExists, deleteProduct, finalHandler); // TODO: '/:id'

app.get('/cart/:id', authenticateToken, loadCart, finalHandler); // TODO: '/:id'

// app.post('/cart', authenticateToken, validateAddToCart, checkProductExists, addToCart, finalHandler);

// --------------------- SERVER SETUP ---------------------

const PORT =  process.env.SERVER_PORT || 3000; 

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
