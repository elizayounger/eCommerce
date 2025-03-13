const { query, validationResult } = require('express-validator');

export const validateUserIdQuery = [
  query('id').isInt({ min: 1 }).withMessage('Page must be an integer greater than or equal to 1'),

  (req,res,next) => {
    const errors = validationResult(req);
    // TODO: make sure req.user.id === req.query.id;

    if (!errors.isEmpty()) {
        return res.json(400).json({ errors: errors.array() });
    }
  }
];


