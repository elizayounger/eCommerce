import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// ------------------- CUSTOMER CONNECTION -------------------
export const config = {
   customer_db: {
     host: process.env.DB_HOST || 'localhost',
     port: process.env.DB_PORT || 5432,
     user: process.env.DB_USER || 'your_db_user',
     password: process.env.DB_PASSWORD || 'your_db_password',
     database: process.env.DB_NAME || 'your_database',
   },
   employee_db: {
     host: process.env.DB_HOST || 'localhost',
     port: process.env.DB_PORT || 5432,
     user: process.env.EMPLOYEE_DB_USER || 'employee_db_user',
     password: process.env.EMPLOYEE_DB_PASSWORD || 'employee_db_password',
     database: process.env.DB_NAME || 'your_database',
   },
   server: {
      port: process.env.SERVER_PORT || 3000,
   },
   jwtSecret: process.env.JWT_SECRET || 'your_secret_key', 
};

// Initialize the pools
export const customer_pool = new Pool(config.customer_db); 
export const employee_pool = new Pool(config.employee_db); 

export const connectDB = async () => { 
  customerConnectDB();
  employeeConnectDB();
};

export const customerConnectDB = async () => { 
  try {
     await customer_pool.connect();
     console.log('Connected to the database ✅');
  } catch (err) {
     console.error('Database connection error ❌ : ', err);
     process.exit(1); 
  }
};

export const employeeConnectDB = async () => { 
  try {
     await employee_pool.connect();
     console.log('Employee database Connection Running ✅ \n');
  } catch (err) {
     console.error('Employee database connection error ❌ : ', err);
     process.exit(1); 
  }
};


