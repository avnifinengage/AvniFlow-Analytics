const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const { validateApiKey, apiLimiter } = require('../middleware/auth');
const { 
  websiteValidationRules, 
  handleValidationErrors 
} = require('../middleware/validation');

// Register a new website (no auth required)
router.post('/register',
  apiLimiter,
  websiteValidationRules,
  handleValidationErrors,
  websiteController.registerWebsite
);

// Get website details (requires API key)
router.get('/details',
  validateApiKey,
  apiLimiter,
  websiteController.getWebsite
);

// Update website settings
router.put('/update',
  validateApiKey,
  apiLimiter,
  websiteController.updateWebsite
);

// Regenerate API key
router.post('/regenerate-api-key',
  validateApiKey,
  apiLimiter,
  websiteController.regenerateApiKey
);

// Get website analytics
router.get('/analytics',
  validateApiKey,
  apiLimiter,
  websiteController.getWebsiteAnalytics
);

// Delete website (soft delete)
router.delete('/delete',
  validateApiKey,
  apiLimiter,
  websiteController.deleteWebsite
);

module.exports = router; 