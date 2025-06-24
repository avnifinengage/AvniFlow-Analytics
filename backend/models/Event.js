const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Event identification
  eventId: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  
  // Event type and category
  eventType: {
    type: String,
    required: true,
    enum: [
      'wallet_connect',
      'wallet_disconnect', 
      'transaction_start',
      'transaction_complete',
      'transaction_failed',
      'page_view',
      'button_click',
      'form_submit',
      'custom_event'
    ]
  },
  
  // User identification
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Session tracking
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  
  // Website/App identification
  websiteId: {
    type: String,
    required: true,
    index: true
  },
  
  // Wallet information
  walletAddress: {
    type: String,
    lowercase: true,
    index: true
  },
  
  walletType: {
    type: String,
    enum: ['metamask', 'walletconnect', 'coinbase', 'phantom', 'other']
  },
  
  // Transaction details (for transaction events)
  transaction: {
    hash: String,
    from: String,
    to: String,
    value: String,
    gasUsed: String,
    gasPrice: String,
    network: String,
    status: {
      type: String,
      enum: ['pending', 'success', 'failed']
    }
  },
  
  // Page/Component information
  page: {
    url: String,
    title: String,
    path: String
  },
  
  // Element information (for clicks, form submissions)
  element: {
    id: String,
    className: String,
    tagName: String,
    text: String
  },
  
  // Custom event data
  customData: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // User agent and device info
  userAgent: String,
  deviceInfo: {
    browser: String,
    browserVersion: String,
    os: String,
    deviceType: String,
    screenResolution: String
  },
  
  // Geolocation
  location: {
    country: String,
    city: String,
    ip: String
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Performance metrics
  performance: {
    loadTime: Number,
    domContentLoaded: Number,
    firstContentfulPaint: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ websiteId: 1, timestamp: -1 });
eventSchema.index({ userId: 1, timestamp: -1 });
eventSchema.index({ eventType: 1, timestamp: -1 });
eventSchema.index({ walletAddress: 1, timestamp: -1 });

module.exports = mongoose.model('Event', eventSchema); 