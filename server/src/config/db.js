import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'your_db_user',
    password: process.env.DB_PASSWORD || 'your_db_password',
    database: process.env.DB_NAME || 'your_database',
  },
  server: {
    port: process.env.SERVER_PORT || 3000,
  },
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key', // JWT Secret Key for authentication
};

export const pool = new Pool(config.db); // Initialize the pool 

export const connectDB = async () => { // Function to connect to the database and log success or failure
  try {
    await pool.connect();
    console.log('Connected to the database ✅ \n');
  } catch (err) {
    console.error('Database connection error ❌ : ', err);
    process.exit(1); 
  }
};
