const { body, validationResult } = require('express-validator');

// Validation rules for event tracking
const eventValidationRules = [
  body('eventType')
    .isIn([
      'wallet_connect',
      'wallet_disconnect', 
      'transaction_start',
      'transaction_complete',
      'transaction_failed',
      'page_view',
      'button_click',
      'form_submit',
      'custom_event'
    ])
    .withMessage('Invalid event type'),
  
  body('userId')
    .isString()
    .notEmpty()
    .withMessage('User ID is required'),
  
  body('sessionId')
    .isString()
    .notEmpty()
    .withMessage('Session ID is required'),
  
  body('page.url')
    .optional()
    .isURL()
    .withMessage('Invalid page URL'),
  
  body('page.title')
    .optional()
    .isString()
    .withMessage('Page title must be a string'),
  
  body('walletAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid wallet address format'),
  
  body('transaction.hash')
    .optional()
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid transaction hash format'),
  
  body('transaction.status')
    .optional()
    .isIn(['pending', 'success', 'failed'])
    .withMessage('Invalid transaction status'),
  
  body('element.id')
    .optional()
    .isString()
    .withMessage('Element ID must be a string'),
  
  body('customData')
    .optional()
    .isObject()
    .withMessage('Custom data must be an object'),
  
  body('performance.loadTime')
    .optional()
    .isNumeric()
    .withMessage('Load time must be a number'),
  
  body('performance.domContentLoaded')
    .optional()
    .isNumeric()
    .withMessage('DOM content loaded time must be a number'),
  
  body('performance.firstContentfulPaint')
    .optional()
    .isNumeric()
    .withMessage('First contentful paint time must be a number')
];

// Validation rules for website registration
const websiteValidationRules = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Website name is required and must be between 1-100 characters'),
  
  body('domain')
    .isString()
    .trim()
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)
    .withMessage('Invalid domain format'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('owner.name')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Owner name must be less than 100 characters'),
  
  body('owner.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('owner.walletAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid wallet address format'),
  
  body('settings.trackingEnabled')
    .optional()
    .isBoolean()
    .withMessage('Tracking enabled must be a boolean'),
  
  body('settings.trackEvents.walletConnections')
    .optional()
    .isBoolean()
    .withMessage('Wallet connections tracking must be a boolean'),
  
  body('settings.trackEvents.transactions')
    .optional()
    .isBoolean()
    .withMessage('Transactions tracking must be a boolean'),
  
  body('settings.trackEvents.pageViews')
    .optional()
    .isBoolean()
    .withMessage('Page views tracking must be a boolean'),
  
  body('settings.trackEvents.clicks')
    .optional()
    .isBoolean()
    .withMessage('Clicks tracking must be a boolean'),
  
  body('settings.trackEvents.customEvents')
    .optional()
    .isBoolean()
    .withMessage('Custom events tracking must be a boolean')
];

// Validation rules for analytics queries
const analyticsValidationRules = [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  body('eventTypes')
    .optional()
    .isArray()
    .withMessage('Event types must be an array'),
  
  body('eventTypes.*')
    .optional()
    .isString()
    .withMessage('Each event type must be a string'),
  
  body('groupBy')
    .optional()
    .isIn(['hour', 'day', 'week', 'month'])
    .withMessage('Group by must be hour, day, week, or month'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Sanitize and validate user agent
const sanitizeUserAgent = (req, res, next) => {
  if (req.body.userAgent) {
    req.body.userAgent = req.body.userAgent.substring(0, 500); // Limit length
  }
  next();
};

// Sanitize and validate IP address
const sanitizeIP = (req, res, next) => {
  if (req.body.location && req.body.location.ip) {
    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(req.body.location.ip)) {
      delete req.body.location.ip;
    }
  }
  next();
};

module.exports = {
  eventValidationRules,
  websiteValidationRules,
  analyticsValidationRules,
  handleValidationErrors,
  sanitizeUserAgent,
  sanitizeIP
}; 