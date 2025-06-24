const Event = require('../models/Event');
const Session = require('../models/Session');
const Website = require('../models/Website');

// Track a new event
const trackEvent = async (req, res) => {
  try {
    const {
      eventType,
      userId,
      sessionId,
      walletAddress,
      walletType,
      transaction,
      page,
      element,
      customData,
      performance,
      deviceInfo,
      location
    } = req.body;

    const websiteId = req.website.websiteId;

    // Create the event
    const event = new Event({
      eventType,
      userId,
      sessionId,
      websiteId,
      walletAddress,
      walletType,
      transaction,
      page,
      element,
      customData,
      performance,
      deviceInfo,
      location,
      userAgent: req.headers['user-agent']
    });

    await event.save();

    // Update session engagement metrics
    try {
      const session = await Session.findOne({ sessionId });
      if (session) {
        await session.updateEngagement(eventType);
      }
    } catch (sessionError) {
      console.error('Session update error:', sessionError);
    }

    // Update website stats
    try {
      await Website.findByIdAndUpdate(
        req.website._id,
        {
          $inc: { 'stats.totalEvents': 1 },
          $set: { 'stats.lastEventAt': new Date() }
        }
      );
    } catch (statsError) {
      console.error('Stats update error:', statsError);
    }

    res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
      data: {
        eventId: event.eventId,
        timestamp: event.timestamp
      }
    });

  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event',
      error: error.message
    });
  }
};

// Track multiple events in batch
const trackBatchEvents = async (req, res) => {
  try {
    const { events } = req.body;
    const websiteId = req.website.websiteId;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Events array is required and must not be empty'
      });
    }

    if (events.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 events allowed per batch'
      });
    }

    const eventPromises = events.map(eventData => {
      const event = new Event({
        ...eventData,
        websiteId,
        userAgent: req.headers['user-agent']
      });
      return event.save();
    });

    const savedEvents = await Promise.all(eventPromises);

    // Update website stats
    await Website.findByIdAndUpdate(
      req.website._id,
      {
        $inc: { 'stats.totalEvents': events.length },
        $set: { 'stats.lastEventAt': new Date() }
      }
    );

    res.status(201).json({
      success: true,
      message: `${events.length} events tracked successfully`,
      data: {
        eventIds: savedEvents.map(event => event.eventId),
        count: events.length
      }
    });

  } catch (error) {
    console.error('Batch event tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track batch events',
      error: error.message
    });
  }
};

// Get events with filtering and pagination
const getEvents = async (req, res) => {
  try {
    const {
      eventType,
      userId,
      sessionId,
      walletAddress,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    const websiteId = req.website.websiteId;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { websiteId };

    if (eventType) {
      filter.eventType = eventType;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (sessionId) {
      filter.sessionId = sessionId;
    }

    if (walletAddress) {
      filter.walletAddress = walletAddress.toLowerCase();
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve events',
      error: error.message
    });
  }
};

// Get event statistics
const getEventStats = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      groupBy = 'day'
    } = req.query;

    const websiteId = req.website.websiteId;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Get event type counts
    const eventTypeStats = await Event.aggregate([
      { $match: { websiteId, ...dateFilter } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get time-based aggregation
    let timeGroupFormat;
    switch (groupBy) {
      case 'hour':
        timeGroupFormat = { $dateToString: { format: '%Y-%m-%d-%H', date: '$timestamp' } };
        break;
      case 'day':
        timeGroupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
        break;
      case 'week':
        timeGroupFormat = { $dateToString: { format: '%Y-%U', date: '$timestamp' } };
        break;
      case 'month':
        timeGroupFormat = { $dateToString: { format: '%Y-%m', date: '$timestamp' } };
        break;
      default:
        timeGroupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
    }

    const timeStats = await Event.aggregate([
      { $match: { websiteId, ...dateFilter } },
      {
        $group: {
          _id: timeGroupFormat,
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get unique users count
    const uniqueUsers = await Event.distinct('userId', { websiteId, ...dateFilter });

    // Get unique sessions count
    const uniqueSessions = await Event.distinct('sessionId', { websiteId, ...dateFilter });

    // Get wallet connection stats
    const walletStats = await Event.aggregate([
      { 
        $match: { 
          websiteId, 
          eventType: 'wallet_connect',
          ...dateFilter 
        } 
      },
      {
        $group: {
          _id: '$walletType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        eventTypeStats,
        timeStats,
        uniqueUsers: uniqueUsers.length,
        uniqueSessions: uniqueSessions.length,
        walletStats,
        totalEvents: eventTypeStats.reduce((sum, stat) => sum + stat.count, 0)
      }
    });

  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event statistics',
      error: error.message
    });
  }
};

module.exports = {
  trackEvent,
  trackBatchEvents,
  getEvents,
  getEventStats
}; 