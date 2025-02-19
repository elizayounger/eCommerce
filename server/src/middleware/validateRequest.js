import { body, validationResult } from 'express-validator';

export const validateAddToCart = [
   body().isArray().withMessage("Request body must be an array of products"),
   body("*.name").trim().escape().notEmpty().withMessage("Name is required"),
   body("*.description").trim().escape().notEmpty().withMessage("Description is required"),
   body("*.price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
   body("*.stock_quantity").isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),

   (req, res, next) => {
       const allowedFields = ["name", "description", "price", "stock_quantity"];

       const extraFields = req.body.flatMap((product, index) =>
           Object.keys(product).filter(key => !allowedFields.includes(key)).map(key => `Product ${index + 1}: ${key}`)
       );

       if (extraFields.length > 0) {  return res.status(400).json({ message: `Unrecognized field(s): ${extraFields.join(", ")}` });   }

       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return res.status(400).json({ errors: errors.array() });
       }

       next();
   }
];

export const validateDeleteProducts = [
   body().isArray().withMessage("Request body must be an array of products"),
   body("*.id").isInt({ min: 1 }).withMessage("Product ID must be a positive integer"),
   body("*.name").trim().escape().notEmpty().withMessage("Name cannot be empty"),

   (req, res, next) => {
       const allowedFields = ["id", "name"];

       const extraFields = req.body.flatMap((product, index) =>
           Object.keys(product).filter(key => !allowedFields.includes(key)).map(key => `Product ${index + 1}: ${key}`)
       );
       if (extraFields.length > 0) {  return res.status(400).json({ message: `Unrecognized field(s): ${extraFields.join(", ")}` });   }

       // Check for validation errors
       const errors = validationResult(req);
       if (!errors.isEmpty()) {   return res.status(400).json({ errors: errors.array() });   }

       next();
   }
];

export const validateUpdateProducts = [
    body().isArray().withMessage("Request body must be an array of products"),
    body("*.id").isInt({ min: 1 }).withMessage("Product ID must be a positive integer"),
    body("*.name").optional().trim().escape().notEmpty().withMessage("Name cannot be empty"),
    body("*.description").optional().trim().escape().notEmpty().withMessage("Description cannot be empty"),
    body("*.price").optional().isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
    body("*.stock_quantity").optional().isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),

    (req, res, next) => {
        const allowedFields = ["id", "name", "description", "price", "stock_quantity"];

        const extraFields = req.body.flatMap((product, index) =>
            Object.keys(product).filter(key => !allowedFields.includes(key)).map(key => `Product ${index + 1}: ${key}`)
        );
        if (extraFields.length > 0) {  return res.status(400).json({ message: `Unrecognized field(s): ${extraFields.join(", ")}` });   }

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {   return res.status(400).json({ errors: errors.array() });   }

        next();
    }
];

export const validateAddProducts = [
    body().isArray().withMessage("Request body must be an array of products"),

    body("*.name").trim().escape().notEmpty().withMessage("Name is required"),
    body("*.description").trim().escape().notEmpty().withMessage("Description is required"),
    body("*.price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
    body("*.stock_quantity").isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),

    (req, res, next) => {
        const allowedFields = ["name", "description", "price", "stock_quantity"];

        const extraFields = req.body.flatMap((product, index) =>
            Object.keys(product).filter(key => !allowedFields.includes(key)).map(key => `Product ${index + 1}: ${key}`)
        );

        if (extraFields.length > 0) {  return res.status(400).json({ message: `Unrecognized field(s): ${extraFields.join(", ")}` });   }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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


