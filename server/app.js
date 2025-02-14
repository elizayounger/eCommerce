// --------------------- CONFIG ---------------------

import express from 'express';
const app = express();
app.use(express.json()); 

// --------------------- DATABASE CONNECTION ---------------------

import { pool } from './src/config/db.js'; // import db config settings

pool.connect() // Connect to the database
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error', err));

// --------------------- IMPORTS ---------------------

import { loadProducts } from './src/routes/home.js';

// --------------------- MIDDLEWARE ---------------------


// --------------------- ROUTES ---------------------

// Get Home
app.get('/', loadProducts);

// --------------------- SERVER SETUP ---------------------

// Start server
const PORT =  3000; 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);  // Use the PORT variable here
});

// --------------------- ARCHIVE ---------------------
// const pool = new Pool({
//   host: config.db.host,
//   port: config.db.port,
//   user: config.db.user,
//   password: config.db.password,
//   database: config.db.database,
// });

// const PORT = config?.server?.port || 3000; // Default to 3000 if not specified in config

// JWT Token Example
// const token = jwt.sign({ userId: 123 }, config.jwtSecret);
// console.log('Generated Token:', token);


// app.listen(config.server.port, () => {
//   console.log(`Server running on port ${config.server.port}`);
// });