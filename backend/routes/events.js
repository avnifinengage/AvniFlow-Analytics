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

// Add analytics endpoint for dashboard
router.get('/analytics', validateApiKey, async (req, res) => {
  try {
    // Aggregate event stats for the requesting website
    const website = req.website;
    const Event = require('../models/Event');
    const totalEvents = await Event.countDocuments({ websiteId: website.websiteId });
    const recentEvents = await Event.find({ websiteId: website.websiteId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    // Example: group by eventType for chart data
    const eventTypeCounts = await Event.aggregate([
      { $match: { websiteId: website.websiteId } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);
    res.json({
      success: true,
      totalEvents,
      recentEvents,
      eventTypeCounts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Analytics error', error: err.message });
  }
});

module.exports = router; 