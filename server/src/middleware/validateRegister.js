// const { body, validationResult, ExpressValidator } = require('express-validator');
import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('firstname').notEmpty().escape().withMessage('Firstname is required'),
  body('lastname').notEmpty().withMessage('Lastname is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];