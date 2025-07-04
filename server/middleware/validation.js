
import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array() 
    });
  }
  next();
};

export const validateRoute = [
  body('start').isString().trim().isLength({ min: 1, max: 100 }).escape(),
  body('end').isString().trim().isLength({ min: 1, max: 100 }).escape(),
  body('fare').isFloat({ min: 0 }),
  handleValidationErrors
];

export const validateBus = [
  body('name').isString().trim().isLength({ min: 1, max: 100 }).escape(),
  body('route').isMongoId(),
  body('capacity').isInt({ min: 1, max: 500 }),
  handleValidationErrors
];

export const validateStation = [
  body('routeId').isMongoId(),
  body('busId').isMongoId(),
  body('name').isString().trim().isLength({ min: 1, max: 100 }).escape(),
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('fare').isFloat({ min: 0 }),
  body('location').optional().isString().trim().isLength({ max: 200 }).escape(),
  handleValidationErrors
];

export const validateTrip = [
  body('userId').isString().trim(),
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  handleValidationErrors
];

export const validateObjectId = [
  param('id').isMongoId(),
  handleValidationErrors
];
