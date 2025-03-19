import { param, body, validationResult } from 'express-validator';
import { validateProductIdParam, validateOrderIdParam } from './validateParams.js';


export const validateGetOrder = [
   ...validateOrderIdParam,

   (req, res, next) => {
      // Validate required fields
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      next();
   }
];

export const validateCheckout = [
   body("paymentMethod").trim().notEmpty().withMessage("Payment method is required.")
      .isString().withMessage("Payment method must be a string."),
   body("amount").isFloat({ min: 0.01, max: 999999.99 }).withMessage("Amount must be a number greater than or equal to 0.01 and up to 2 decimal places.")
      .custom((value) => { // Ensure value has at most 2 decimal places
         if (!/^\d+(\.\d{1,2})?$/.test(value)) { 
            throw new Error("Amount can have up to 2 decimal places.");
         }
         return true;
      }),
   body("currency").trim().notEmpty().withMessage("3-letter currency is required.")
      .isLength({ min: 3, max: 3 }).withMessage("Currency must be exactly 3 letters."),

   (req, res, next) => {
      // const allowedFields = ["amount, currency"];

      // // Check for extra fields
      // const invalidKeys = Object.keys(req.body).filter(key => !allowedFields.includes(key));
      // if (invalidKeys.length > 0) {
      //    return res.status(400).json({ message: `Unrecognized field(s): ${invalidKeys.join(", ")}` });
      // }
      // Validate required fields
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      next();
   }
];

export const validateUpdateCart = [
   ...validateProductIdParam,
   body("quantity").isInt({ min: 1 }).withMessage("Item quantity must be a positive integer"),

   (req, res, next) => {
      const allowedFields = ["quantity"];

      // Check for extra fields
      const invalidKeys = Object.keys(req.body).filter(key => !allowedFields.includes(key));
      if (invalidKeys.length > 0) {
         return res.status(400).json({ message: `Unrecognized field(s): ${invalidKeys.join(", ")}` });
      }
      // Validate required fields
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      next();
   }
];

export const validateAddToCart = [
   body("product_id").trim().notEmpty().withMessage("Product ID is required"),
   body("quantity").isInt({ min: 1 }).withMessage("Item quantity must be a positive integer"),

   (req, res, next) => {
      const allowedFields = ["product_id", "quantity"];

      // Check for extra fields
      const invalidKeys = Object.keys(req.body).filter(key => !allowedFields.includes(key));
      if (invalidKeys.length > 0) {
         return res.status(400).json({ message: `Unrecognized field(s): ${invalidKeys.join(", ")}` });
      }

      // Validate required fields
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      next();
   }
];

export const validateDeleteProduct = [
   ...validateProductIdParam,
   body("name").trim().escape().notEmpty().withMessage("Name cannot be empty"),

   (req, res, next) => {
      const allowedFields = ["name"];
      const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
       
      if (req.user.role !== 'employee') {
         return res.status(401).json({ message: "Unauthorized. Employees only" });
      }
      if (extraFields.length > 0) {
         return res.status(400).json({ message: `Unrecognized field(s): ${extraFields.join(", ")}` });
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      next();
   }
];

export const validateUpdateProduct = [
   param("id").trim().notEmpty().matches(/^\d+$/).withMessage("Product ID is required")
   .matches(/^\d+$/).withMessage("Product ID must contain only numbers"),
   body("name").optional().trim().escape().notEmpty().withMessage("Name cannot be empty"),
   body("description").optional().trim().escape().notEmpty().withMessage("Description cannot be empty"),
   body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
   body("stock_quantity").optional().isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),

   (req, res, next) => {
      const allowedFields = ["name", "description", "price", "stock_quantity"];
      const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
      
      if (extraFields.length > 0) {   return res.status(400).json({ message: `Unrecognized field(s): ${extraFields.join(", ")}` });   } 
      if (req.user.role !== 'employee') {   return res.status(401).json({ message: "Unauthorized. Employees only" });  }
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {   return res.status(400).json({ errors: errors.array() });   }
      next();
   }
];

export const validateAddProduct = [
   body("name").trim().escape().notEmpty().withMessage("Name is required"),
   body("description").trim().escape().notEmpty().withMessage("Description is required"),
   body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
   body("stock_quantity").isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),

   (req, res, next) => {
      const allowedFields = ["name", "description", "price", "stock_quantity"];
       
      const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
       
      if (req.user.role !== 'employee') {   return res.status(401).json({ message: "Unauthorized. Employees only" });  }
       
      if (extraFields.length > 0) {   return res.status(400).json({ message: `Unrecognized field(s): ${extraFields.join(", ")}` });   }
       
      const errors = validationResult(req);
      if (!errors.isEmpty()) {   return res.status(400).json({ errors: errors.array() })   }
      
      next();
   }
];



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
   body('role').isIn(['customer', 'employee']).withMessage("Role must be either 'customer' or 'employee'"),

   (req, res, next) => {
      req.user = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      next();
   }
];


