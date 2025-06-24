const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateApiKey, eventTrackingLimiter } = require('../middleware/auth');
const { 
  eventValidationRules, 
  handleValidationErrors,
  sanitizeUserAgent,
  sanitizeIP 
} = require('../middleware/validation');

// Track a single event
router.post('/track', 
  validateApiKey,
  eventTrackingLimiter,
  eventValidationRules,
  handleValidationErrors,
  sanitizeUserAgent,
  sanitizeIP,
  eventController.trackEvent
);

// Track multiple events in batch
router.post('/track/batch',
  validateApiKey,
  eventTrackingLimiter,
  sanitizeUserAgent,
  sanitizeIP,
  eventController.trackBatchEvents
);

// Get events with filtering
router.get('/events',
  validateApiKey,
  eventController.getEvents
);

// Get event statistics
router.get('/stats',
  validateApiKey,
  eventController.getEventStats
);

module.exports = router; 