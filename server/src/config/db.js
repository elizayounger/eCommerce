import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// ------------------- DATABASE CONFIGURATION -------------------
export const config = {
   customer_db: {
     host: process.env.DB_HOST || 'localhost',
     port: process.env.DB_PORT || 5432,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME,
   },
   employee_db: {
     host: process.env.DB_HOST || 'localhost',
     port: process.env.DB_PORT || 5432,
     user: process.env.EMPLOYEE_DB_USER,
     password: process.env.EMPLOYEE_DB_PASSWORD,
     database: process.env.EMPLOYEE_DB_NAME, // 🛠 FIXED: Use a separate database name
   },
   server: {
      port: process.env.SERVER_PORT || 3000,
   },
   jwtSecret: process.env.JWT_SECRET, 
};

// Validate required env variables
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'EMPLOYEE_DB_USER', 'EMPLOYEE_DB_PASSWORD', 'EMPLOYEE_DB_NAME', 'JWT_SECRET'];
requiredEnvVars.forEach((key) => {
   if (!process.env[key]) {
      console.error(`❌ Missing environment variable: ${key}`);
      process.exit(1);
   }
});

// Initialize the pools
export const customer_pool = new Pool(config.customer_db); 
export const employee_pool = new Pool(config.employee_db); 

// ------------------- DATABASE CONNECTION TEST -------------------
export const connectDB = async () => { 
  await customerConnectDB();
  await employeeConnectDB();
};

export const customerConnectDB = async () => { 
  try {
     const res = await customer_pool.query('SELECT 1');
     console.log('✅ Connected to the Customer database');
  } catch (err) {
     console.error('❌ Customer Database connection error:', err);
     process.exit(1); 
  }
};

export const employeeConnectDB = async () => { 
  try {
     const res = await employee_pool.query('SELECT 1');
     console.log('✅ Employee Database Connection Running');
  } catch (err) {
     console.error('❌ Employee Database connection error:', err);
     process.exit(1); 
  }
};

// ------------------- GRACEFUL SHUTDOWN -------------------
process.on('SIGINT', async () => {
  console.log('\n🔻 Closing database connections...');
  await customer_pool.end();
  await employee_pool.end();
  console.log('✅ Database connections closed.');
  process.exit(0);
});
