// --------------------- CONFIG ---------------------
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db.js'; // Import db config settings
import { Server } from "socket.io";
import cors from 'cors';
import helmet from 'helmet';

// --------------------- SERVER SETUP ---------------------

dotenv.config();

const app = express();
connectDB(); // connect to database

// app.use(express.json());
app.use(cors());
app.use(helmet());

const PORT =  process.env.SERVER_PORT || 3000; 
const server = app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
const io = new Server(server);
// Export io to make it accessible in other files
export { io };

// TODO: add config.db controlling who db accepts connection requests from 
// TODO: change port number from default
// TODO: ensure csrf protected

// --------------------- IMPORTS ---------------------

import {                                                               // middleware
   validateRegister, 
   validateLogin, 
   validateProfile,
   validateAddProduct,
   validateUpdateProduct,
   validateDeleteProduct,
   validateAddToCart,
   validateUpdateCart,
   validateCheckout,
   validateGetOrder
} from './middleware/validateRequest.js';     
import { authenticateToken } from './middleware/authenticateToken.js';  // middleware
import { saltHashPassword } from './middleware/saltHashPassword.js'; // middleware
import { checkPreExistingEmail } from './middleware/checkDuplicateEmail.js'; // middleware
import { checkProductExists } from './util/productExists.js'; // middleware
import { assertCartItem } from './util/checkUserCart.js'; // middleware
import { validateProductIdParam } from './middleware/validateParams.js'; // middleware
import { processPayment, webhookConfirmation } from './routes/checkout/payment.js';

import { registerUser } from './routes/register.js';
import { verifyUserCredentials } from './routes/login.js';
import { getProfile, updateProfile, deleteProfile } from './routes/profile.js';
import { loadProduct, loadProducts, addProduct, updateProduct, deleteProduct } from './routes/products.js';
import { loadCart, addToCart, updateCart, deleteCartItem } from './routes/cart.js';
import { addOrderPending, loadOrders, loadOrder } from './routes/orders/orders.js';
import { finalHandler } from './util/finalHandler.js';


// --------------------- ROUTES ---------------------

app.post('/register', express.json(), validateRegister, saltHashPassword, registerUser);

app.post('/login', express.json(), validateLogin, verifyUserCredentials);

// ------                PROFILE                 -----

app.get('/profile', express.json(), authenticateToken, getProfile); 

app.put('/profile', express.json(), authenticateToken, checkPreExistingEmail, validateProfile, saltHashPassword, updateProfile); 

app.delete('/profile', express.json(), authenticateToken, validateLogin, deleteProfile); 

// ------                PRODUCTS                 -----

app.get('/products/:id', express.json(), validateProductIdParam, loadProduct);

app.get('/products', express.json(), loadProducts);

app.post('/products', express.json(), authenticateToken, validateAddProduct, addProduct, finalHandler);

app.put('/products/:id', express.json(), authenticateToken, validateUpdateProduct, checkProductExists, updateProduct, finalHandler); 

app.delete('/products/:id', express.json(), authenticateToken, validateDeleteProduct, checkProductExists, deleteProduct, finalHandler); 

// ------                 CART                  -----

app.get('/cart', express.json(), authenticateToken, loadCart, finalHandler); 

app.post('/cart', express.json(), authenticateToken, validateAddToCart, checkProductExists, addToCart, finalHandler);

app.put('/cart/:id', express.json(), authenticateToken, validateUpdateCart, checkProductExists, assertCartItem, updateCart, finalHandler);

app.delete('/cart/:id', express.json(), authenticateToken, validateProductIdParam, checkProductExists, assertCartItem, deleteCartItem, finalHandler);

// ------                CHECKOUT                 -----

app.post('/checkout', express.json(), authenticateToken, validateCheckout, processPayment, loadCart, addOrderPending, finalHandler); 

app.post('/webhook', express.raw({ type: "application/json" }), webhookConfirmation); // this route is for Stripe to use when payment status update

// ------                ORDERS                 -----

app.get('/orders', express.json(), authenticateToken, loadOrders, finalHandler);

app.get('/orders/:id', express.json(), authenticateToken, validateGetOrder, loadOrder, finalHandler);

// auth, user, product, cart, order, and payment 