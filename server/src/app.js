const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
   res.send('Hello World!');
});

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`);
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
