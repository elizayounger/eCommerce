// --------------------- SESSION CONFIGURATION ---------------------

import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { pool } from './db.js';
import dotenv from 'dotenv';
dotenv.config();

const PgSession = pgSession(session);

export const sessionConfig = {
  store: new PgSession({
    pool,
    tableName: 'session', // Default is 'session'
  }),
  secret: process.env.SESSION_SECRET || 'secret-key', // Change this to a strong, secure key
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
};

// Export middleware for easy import in app.js
export const sessionMiddleware = session(sessionConfig);
