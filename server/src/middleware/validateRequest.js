// const { body, validationResult, ExpressValidator } = require('express-validator');
import { body, validationResult } from 'express-validator';


export const validateProfile = [
   body('firstname').optional().trim().escape(),
   body('lastname').optional().trim().escape(),
   body('email').optional().trim().isEmail().normalizeEmail().withMessage('Invalid email address'),
   body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

   (req, res, next) => {
      const allowedFields = ['firstname', 'lastname', 'email', 'password']; // Check for extra fields in the body
      const extraFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));

      // Only send an error if there are extra fields
      if (extraFields.length > 0) {
         return res.status(400).json({ message: `Unrecognized field/s in request: ${extraFields.join(', ')}` });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      const { firstname, lastname, email, password } = req.body;
      if (!firstname && !lastname && !email && !password) {
         return res.status(400).json({ message: "Nothing was updated, please alter at least one field." });
      }

      next();
   }
];

export const validateLogin = [
   body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email address'),
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

export const validateRegister = [
   body('firstname').trim().notEmpty().escape().withMessage('Firstname is required'),
   body('lastname').trim().notEmpty().escape().withMessage('Lastname is required'),
   body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email address'),
   body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
   body('role').optional().isIn(['customer', 'employee']).withMessage("Role must be either 'customer' or 'employee'"),

   (req, res, next) => {
      req.user = req.body;
      console.log(`req.user: ${JSON.stringify(req.user)}`);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      next();
   }
];


