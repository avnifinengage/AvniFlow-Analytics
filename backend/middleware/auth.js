const Website = require('../models/Website');

// Middleware to validate API key
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }

    // Find website by API key
    const website = await Website.findOne({ 
      apiKey: apiKey,
      status: 'active'
    });

    if (!website) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key or website is inactive'
      });
    }

    // Attach website info to request
    req.website = website;
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to validate domain origin
const validateOrigin = async (req, res, next) => {
  try {
    const origin = req.headers.origin || req.headers.referer;
    
    if (!origin) {
      return res.status(400).json({
        success: false,
        message: 'Origin header is required'
      });
    }

    // Extract domain from origin
    const domain = new URL(origin).hostname;
    
    // Check if domain matches the website's domain
    if (domain !== req.website.domain && !domain.endsWith('.' + req.website.domain)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid origin domain'
      });
    }

    next();
  } catch (error) {
    console.error('Origin validation error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid origin format'
    });
  }
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limiters
const eventTrackingLimiter = createRateLimiter(60 * 1000, 1000); // 1000 events per minute
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 API calls per 15 minutes

module.exports = {
  validateApiKey,
  validateOrigin,
  createRateLimiter,
  eventTrackingLimiter,
  apiLimiter
}; 