const validator = require('express-validator');

const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validateRegister = [
  validator.body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),
  validator.body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  validator.body('phone')
    .custom((value) => {
      if (!validatePhone(value)) {
        throw new Error('Please provide a valid 10-digit phone number');
      }
      return true;
    }),
  validator.body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  validator.body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  validator.body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateBus = [
  validator.body('operatorName')
    .trim()
    .notEmpty()
    .withMessage('Operator name is required'),
  validator.body('busType')
    .isIn(['AC', 'Non-AC', 'Sleeper', 'Seater'])
    .withMessage('Invalid bus type'),
  validator.body('source')
    .trim()
    .notEmpty()
    .withMessage('Source city is required'),
  validator.body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination city is required'),
  validator.body('totalSeats')
    .isInt({ min: 10, max: 60 })
    .withMessage('Total seats must be between 10 and 60'),
  validator.body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
];

const validationErrorHandler = (req, res, next) => {
  const errors = validator.validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateBus,
  validationErrorHandler,
  validateEmail,
  validatePhone
};
