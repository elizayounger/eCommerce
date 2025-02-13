// --------------------- IMPORTS ---------------------

import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// project imports:
// import getUserAccount from './src/routes/middleware.js';

// --------------------- CONFIG ---------------------

dotenv.config();
const app = express();
app.use(express.json()); 

// --------------------- DATABASE CONNECTION ---------------------

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database
pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error', err));

// --------------------- MIDDLEWARE ---------------------


// --------------------- ROUTES ---------------------

// Get Home
app.get('/', async (req,res,next) => {
   try {
      let sqlQuery = `SELECT id, name, description, price, stock_quantity FROM public.product;`;
      const result = await pool.query(sqlQuery);
      res.json(result.rows);

   } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
   }
});

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