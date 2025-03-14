import { param, validationResult } from 'express-validator';

export const validateProductIdParam = [
   param("id").trim().notEmpty().matches(/^\d+$/).withMessage("Product ID is required")
   .matches(/^\d+$/).withMessage("Product ID must contain only numbers"),

   (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      next();
   }
];