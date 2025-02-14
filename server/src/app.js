// --------------------- CONFIG ---------------------

import express from 'express';
const app = express();
app.use(express.json()); 

// --------------------- DATABASE CONNECTION ---------------------

import { pool } from './config/db.js'; // import db config settings

pool.connect() // Connect to the database
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error', err));

// --------------------- IMPORTS ---------------------

import { loadProducts } from './routes/home.js';
import { registerUser } from './routes/register.js';

// --------------------- MIDDLEWARE ---------------------


// --------------------- ROUTES ---------------------

// Get Home
app.get('/', loadProducts);

app.post('/register', registerUser);

// --------------------- SERVER SETUP ---------------------

// Start server
const PORT =  3000; 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);  // Use the PORT variable here
});

// --------------------- ARCHIVE ---------------------

// const PORT = config?.server?.port || 3000; // Default to 3000 if not specified in config

// JWT Token Example
// const token = jwt.sign({ userId: 123 }, config.jwtSecret);
// console.log('Generated Token:', token);


// app.listen(config.server.port, () => {
//   console.log(`Server running on port ${config.server.port}`);
// });