const express = require('express');
const config = require('./config/config');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();

// Database connection
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error', err));

// JWT Token Example
const token = jwt.sign({ userId: 123 }, config.jwtSecret);
console.log('Generated Token:', token);

// Start server
app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});

// api-project/
// ├── src/
// │   ├── config/         # Configuration files (e.g., database, environment variables)
// │   │   └── config.js
// │   ├── controllers/    # Route controllers (logic for handling requests and responses)
// │   │   └── userController.js
// │   ├── middleware/     # Custom middleware functions
// │   │   └── authMiddleware.js
// │   ├── models/         # Database models (e.g., Mongoose schemas, Sequelize models)
// │   │   └── userModel.js
// │   ├── routes/         # API routes/endpoints
// │   │   └── userRoutes.js
// │   ├── services/       # Business logic and service layer
// │   │   └── userService.js
// │   ├── utils/          # Utility functions and helpers
// │   │   └── validator.js
// │   └── app.js          # Main application entry point
// ├── tests/              # Unit and integration tests
// │   └── userTests.js
// ├── .env                # Environment variables
// ├── .gitignore          # Git ignore file
// ├── package.json        # NPM dependencies and scripts
// └── README.md           # Project documentation
