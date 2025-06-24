const Website = require('../models/Website');
const Event = require('../models/Event');

// Register a new website
const registerWebsite = async (req, res) => {
  try {
    const {
      name,
      domain,
      description,
      owner,
      settings
    } = req.body;

    // Check if domain already exists
    const existingWebsite = await Website.findOne({ domain });
    if (existingWebsite) {
      return res.status(409).json({
        success: false,
        message: 'Website with this domain already exists'
      });
    }

    // Create new website
    const website = new Website({
      name,
      domain,
      description,
      owner,
      settings
    });

    await website.save();

    res.status(201).json({
      success: true,
      message: 'Website registered successfully',
      data: {
        websiteId: website.websiteId,
        name: website.name,
        domain: website.domain,
        apiKey: website.apiKey,
        status: website.status
      }
    });

  } catch (error) {
    console.error('Website registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register website',
      error: error.message
    });
  }
};

// Get website details
const getWebsite = async (req, res) => {
  try {
    const website = req.website;

    res.json({
      success: true,
      data: {
        websiteId: website.websiteId,
        name: website.name,
        domain: website.domain,
        description: website.description,
        owner: website.owner,
        settings: website.settings,
        status: website.status,
        stats: website.stats,
        createdAt: website.createdAt,
        updatedAt: website.updatedAt
      }
    });

  } catch (error) {
    console.error('Get website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve website details',
      error: error.message
    });
  }
};

// Update website settings
const updateWebsite = async (req, res) => {
  try {
    const {
      name,
      description,
      owner,
      settings,
      status
    } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (owner) updateData.owner = owner;
    if (settings) updateData.settings = settings;
    if (status) updateData.status = status;

    const website = await Website.findByIdAndUpdate(
      req.website._id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Website updated successfully',
      data: {
        websiteId: website.websiteId,
        name: website.name,
        domain: website.domain,
        description: website.description,
        owner: website.owner,
        settings: website.settings,
        status: website.status,
        updatedAt: website.updatedAt
      }
    });

  } catch (error) {
    console.error('Update website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update website',
      error: error.message
    });
  }
};

// Regenerate API key
const regenerateApiKey = async (req, res) => {
  try {
    const crypto = require('crypto');
    const newApiKey = crypto.randomBytes(32).toString('hex');

    const website = await Website.findByIdAndUpdate(
      req.website._id,
      { apiKey: newApiKey },
      { new: true }
    );

    res.json({
      success: true,
      message: 'API key regenerated successfully',
      data: {
        websiteId: website.websiteId,
        newApiKey: website.apiKey
      }
    });

  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate API key',
      error: error.message
    });
  }
};

// Get website analytics overview
const getWebsiteAnalytics = async (req, res) => {
  try {
    const {
      startDate,
      endDate
    } = req.query;

    const websiteId = req.website.websiteId;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Get basic stats
    const totalEvents = await Event.countDocuments({ websiteId, ...dateFilter });
    const uniqueUsers = await Event.distinct('userId', { websiteId, ...dateFilter });
    const uniqueSessions = await Event.distinct('sessionId', { websiteId, ...dateFilter });

    // Get event type breakdown
    const eventTypeBreakdown = await Event.aggregate([
      { $match: { websiteId, ...dateFilter } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get wallet connection stats
    const walletConnections = await Event.countDocuments({
      websiteId,
      eventType: 'wallet_connect',
      ...dateFilter
    });

    // Get transaction stats
    const transactions = await Event.countDocuments({
      websiteId,
      eventType: { $in: ['transaction_complete', 'transaction_failed'] },
      ...dateFilter
    });

    // Get conversion rate (wallet connections to transactions)
    const conversionRate = walletConnections > 0 
      ? ((transactions / walletConnections) * 100).toFixed(2)
      : 0;

    // Get recent activity (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = await Event.countDocuments({
      websiteId,
      timestamp: { $gte: last24Hours }
    });

    // Get top pages
    const topPages = await Event.aggregate([
      { 
        $match: { 
          websiteId, 
          eventType: 'page_view',
          ...dateFilter 
        } 
      },
      {
        $group: {
          _id: '$page.url',
          count: { $sum: 1 },
          title: { $first: '$page.title' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalEvents,
          uniqueUsers: uniqueUsers.length,
          uniqueSessions: uniqueSessions.length,
          walletConnections,
          transactions,
          conversionRate: parseFloat(conversionRate),
          recentEvents
        },
        eventTypeBreakdown,
        topPages
      }
    });

  } catch (error) {
    console.error('Get website analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve website analytics',
      error: error.message
    });
  }
};

// Delete website (soft delete)
const deleteWebsite = async (req, res) => {
  try {
    // Soft delete by setting status to suspended
    await Website.findByIdAndUpdate(
      req.website._id,
      { status: 'suspended' }
    );

    res.json({
      success: true,
      message: 'Website deleted successfully'
    });

  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete website',
      error: error.message
    });
  }
};

module.exports = {
  registerWebsite,
  getWebsite,
  updateWebsite,
  regenerateApiKey,
  getWebsiteAnalytics,
  deleteWebsite
}; 