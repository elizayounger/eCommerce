// config.js

// Load environment variables from a .env file into process.env
require('dotenv').config();

const config = {
  // Database configuration
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'your_db_user',
    password: process.env.DB_PASSWORD || 'your_db_password',
    database: process.env.DB_NAME || 'your_database',
  },
  // Server configuration
  server: {
    port: process.env.SERVER_PORT || 3000,
  },
  // JWT Secret Key for authentication
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
};

module.exports = config;
