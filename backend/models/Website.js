const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  // Website identification
  websiteId: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  
  // Basic information
  name: {
    type: String,
    required: true
  },
  
  domain: {
    type: String,
    required: true,
    unique: true
  },
  
  description: String,
  
  // Owner information
  owner: {
    name: String,
    email: String,
    walletAddress: String
  },
  
  // API credentials
  apiKey: {
    type: String,
    required: true,
    unique: true,
    default: () => require('crypto').randomBytes(32).toString('hex')
  },
  
  // Settings and configuration
  settings: {
    trackingEnabled: {
      type: Boolean,
      default: true
    },
    
    // Event types to track
    trackEvents: {
      walletConnections: { type: Boolean, default: true },
      transactions: { type: Boolean, default: true },
      pageViews: { type: Boolean, default: true },
      clicks: { type: Boolean, default: true },
      customEvents: { type: Boolean, default: true }
    },
    
    // Privacy settings
    privacy: {
      anonymizeIPs: { type: Boolean, default: false },
      respectDNT: { type: Boolean, default: true },
      cookieConsent: { type: Boolean, default: true }
    },
    
    // Custom tracking configuration
    customTracking: {
      funnelSteps: [String],
      conversionGoals: [String],
      excludedPaths: [String]
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Usage statistics
  stats: {
    totalEvents: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    lastEventAt: Date,
    createdAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Indexes
websiteSchema.index({ domain: 1 });
websiteSchema.index({ apiKey: 1 });
websiteSchema.index({ status: 1 });

module.exports = mongoose.model('Website', websiteSchema); 