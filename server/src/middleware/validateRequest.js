// const { body, validationResult, ExpressValidator } = require('express-validator');
import { body, validationResult } from 'express-validator';

export const validateRegister = [
   body('firstname').trim().notEmpty().escape().withMessage('Firstname is required'),
   body('lastname').trim().notEmpty().escape().withMessage('Lastname is required'),
   body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email address'),
   body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

   (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      next();
   }
];

export const validateLogin = [
   body('email').isEmail().withMessage('Invalid email address'),
   body('password').notEmpty().withMessage('Password required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      //  .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/).withMessage('Password must be at least 6 characters, with at least one letter and one number')
 
   (req, res, next) => {
 
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      next();
   }
];

export const validateProfile = [
   body('firstname').trim().notEmpty().escape().withMessage('Firstname is required'),
   body('lastname').trim().notEmpty().escape().withMessage('Lastname is required'),
   body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email address'),
   body('password').optional().notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
 
   (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      next();
   }
];
 