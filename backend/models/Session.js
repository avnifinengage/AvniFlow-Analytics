const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // Session identification
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  
  // Website identification
  websiteId: {
    type: String,
    required: true,
    index: true
  },
  
  // User identification
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Session details
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  endTime: {
    type: Date
  },
  
  duration: {
    type: Number, // in seconds
    default: 0
  },
  
  // User information
  userInfo: {
    walletAddress: String,
    walletType: String,
    isReturningUser: {
      type: Boolean,
      default: false
    },
    firstVisitAt: Date
  },
  
  // Session journey
  journey: {
    entryPage: {
      url: String,
      title: String
    },
    exitPage: {
      url: String,
      title: String
    },
    pagesVisited: [{
      url: String,
      title: String,
      timestamp: Date,
      timeSpent: Number // in seconds
    }],
    totalPages: {
      type: Number,
      default: 0
    }
  },
  
  // Events in this session
  events: [{
    eventId: String,
    eventType: String,
    timestamp: Date
  }],
  
  // Funnel progression
  funnelProgress: {
    currentStep: String,
    completedSteps: [String],
    conversionGoal: String,
    isConverted: {
      type: Boolean,
      default: false
    }
  },
  
  // Device and location
  deviceInfo: {
    userAgent: String,
    browser: String,
    os: String,
    deviceType: String,
    screenResolution: String
  },
  
  location: {
    country: String,
    city: String,
    ip: String
  },
  
  // Session status
  status: {
    type: String,
    enum: ['active', 'ended', 'abandoned'],
    default: 'active'
  },
  
  // Engagement metrics
  engagement: {
    totalClicks: { type: Number, default: 0 },
    totalTransactions: { type: Number, default: 0 },
    walletConnections: { type: Number, default: 0 },
    timeOnSite: { type: Number, default: 0 } // in seconds
  }
}, {
  timestamps: true
});

// Indexes
sessionSchema.index({ websiteId: 1, startTime: -1 });
sessionSchema.index({ userId: 1, startTime: -1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ 'userInfo.walletAddress': 1 });

// Method to end session
sessionSchema.methods.endSession = function() {
  this.endTime = new Date();
  this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  this.status = 'ended';
  return this.save();
};

// Method to update engagement metrics
sessionSchema.methods.updateEngagement = function(eventType) {
  switch(eventType) {
    case 'button_click':
      this.engagement.totalClicks++;
      break;
    case 'transaction_complete':
      this.engagement.totalTransactions++;
      break;
    case 'wallet_connect':
      this.engagement.walletConnections++;
      break;
  }
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema); 