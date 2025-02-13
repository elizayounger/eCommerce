const express = require('express');
// const config = require('./src/config/config');
const { Pool } = require('pg');
// const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// const pool = new Pool({
//   host: "localhost",
//   port: 5432,
//   user: "elizayounger",
//   password: "broken-token",
//   database: "ecommerce",
// });

// Test route
app.get('/', (err,req,res) => {
  res.send('Hello, world!');
});

// Connect to the database
pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error', err));

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