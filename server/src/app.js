// --------------------- CONFIG ---------------------
import dotenv from 'dotenv';
import express from 'express';
import { pool, connectDB } from './config/db.js';                    // Import db config settings

dotenv.config();

const app = express();
app.use(express.json());
connectDB(); // connect to database

// --------------------- IMPORTS ---------------------

import { validateRegister } from './middleware/validateRequest.js';     // middleware
import { validateLogin } from './middleware/validateRequest.js';        // middleware
import { authenticateToken } from './middleware/authenticateToken.js';  // middleware

import { loadProducts } from './routes/home.js'; 
import { registerUser } from './routes/register.js';
import { loginUser } from './routes/login.js';



// --------------------- ROUTES ---------------------

// Get Home
app.get('/', loadProducts);

app.post('/register', validateRegister, registerUser);

app.post('/login', validateLogin, loginUser);

// --------------------- SERVER SETUP ---------------------

const PORT =  process.env.SERVER_PORT || 3000; 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --------------------- ARCHIVE ---------------------

// const PORT = config?.server?.port || 3000; // Default to 3000 if not specified in config

// JWT Token Example
// const token = jwt.sign({ userId: 123 }, config.jwtSecret);
// console.log('Generated Token:', token);


// app.listen(config.server.port, () => {
//   console.log(`Server running on port ${config.server.port}`);
// });