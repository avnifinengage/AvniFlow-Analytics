/**
 * Web3 Funnel Analytics Widget
 * Version: 1.0.0
 * 
 * This widget automatically tracks Web3 events on your website
 * including wallet connections, transactions, page views, and more.
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    API_BASE_URL: window.location.protocol + '//' + window.location.host + '/api/v1',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    BATCH_SIZE: 10,
    BATCH_TIMEOUT: 5000, // 5 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  };

  // State management
  let state = {
    websiteId: null,
    apiKey: null,
    userId: null,
    sessionId: null,
    isInitialized: false,
    eventQueue: [],
    batchTimer: null,
    retryCount: 0
  };

  // Utility functions
  const utils = {
    // Generate unique ID
    generateId: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },

    // Get user agent info
    getUserAgent: () => {
      const ua = navigator.userAgent;
      const browser = {
        name: 'Unknown',
        version: 'Unknown',
        os: 'Unknown',
        deviceType: 'desktop'
      };

      // Detect browser
      if (ua.includes('Chrome')) {
        browser.name = 'Chrome';
        browser.version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
      } else if (ua.includes('Firefox')) {
        browser.name = 'Firefox';
        browser.version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
      } else if (ua.includes('Safari')) {
        browser.name = 'Safari';
        browser.version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
      } else if (ua.includes('Edge')) {
        browser.name = 'Edge';
        browser.version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
      }

      // Detect OS
      if (ua.includes('Windows')) {
        browser.os = 'Windows';
      } else if (ua.includes('Mac')) {
        browser.os = 'macOS';
      } else if (ua.includes('Linux')) {
        browser.os = 'Linux';
      } else if (ua.includes('Android')) {
        browser.os = 'Android';
        browser.deviceType = 'mobile';
      } else if (ua.includes('iOS')) {
        browser.os = 'iOS';
        browser.deviceType = 'mobile';
      }

      return browser;
    },

    // Get performance metrics
    getPerformanceMetrics: () => {
      if (!window.performance || !window.performance.timing) {
        return {};
      }

      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;

      return {
        loadTime: timing.loadEventEnd - navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
        firstContentfulPaint: window.performance.getEntriesByType('paint')
          .find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      };
    },

    // Get page info
    getPageInfo: () => {
      return {
        url: window.location.href,
        title: document.title,
        path: window.location.pathname
      };
    },

    // Get element info
    getElementInfo: (element) => {
      if (!element) return {};
      
      return {
        id: element.id || '',
        className: element.className || '',
        tagName: element.tagName || '',
        text: element.textContent?.substring(0, 100) || ''
      };
    }
  };

  // API communication
  const api = {
    // Send event to server
    async sendEvent(eventData) {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/events/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': state.apiKey
          },
          body: JSON.stringify(eventData)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to send event:', error);
        throw error;
      }
    },

    // Send batch events
    async sendBatchEvents(events) {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/events/track/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': state.apiKey
          },
          body: JSON.stringify({ events })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to send batch events:', error);
        throw error;
      }
    }
  };

  // Event tracking
  const tracker = {
    // Initialize tracking
    init(websiteId, apiKey) {
      if (state.isInitialized) {
        console.warn('Web3 Funnel already initialized');
        return;
      }

      state.websiteId = websiteId;
      state.apiKey = apiKey;
      state.userId = utils.generateId();
      state.sessionId = utils.generateId();
      state.isInitialized = true;

      // Start session
      this.trackPageView();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Set up batch processing
      this.setupBatchProcessing();

      console.log('Web3 Funnel Analytics initialized');
    },

    // Track page view
    trackPageView() {
      const eventData = {
        eventType: 'page_view',
        userId: state.userId,
        sessionId: state.sessionId,
        page: utils.getPageInfo(),
        performance: utils.getPerformanceMetrics(),
        deviceInfo: utils.getUserAgent(),
        timestamp: new Date().toISOString()
      };

      this.queueEvent(eventData);
    },

    // Track wallet connection
    trackWalletConnect(walletAddress, walletType = 'other') {
      const eventData = {
        eventType: 'wallet_connect',
        userId: state.userId,
        sessionId: state.sessionId,
        walletAddress,
        walletType,
        timestamp: new Date().toISOString()
      };

      this.queueEvent(eventData);
    },

    // Track wallet disconnect
    trackWalletDisconnect(walletAddress) {
      const eventData = {
        eventType: 'wallet_disconnect',
        userId: state.userId,
        sessionId: state.sessionId,
        walletAddress,
        timestamp: new Date().toISOString()
      };

      this.queueEvent(eventData);
    },

    // Track transaction
    trackTransaction(transactionData) {
      const eventData = {
        eventType: 'transaction_start',
        userId: state.userId,
        sessionId: state.sessionId,
        transaction: transactionData,
        timestamp: new Date().toISOString()
      };

      this.queueEvent(eventData);
    },

    // Track transaction completion
    trackTransactionComplete(transactionData) {
      const eventData = {
        eventType: 'transaction_complete',
        userId: state.userId,
        sessionId: state.sessionId,
        transaction: transactionData,
        timestamp: new Date().toISOString()
      };

      this.queueEvent(eventData);
    },

    // Track transaction failure
    trackTransactionFailed(transactionData, error) {
      const eventData = {
        eventType: 'transaction_failed',
        userId: state.userId,
        sessionId: state.sessionId,
        transaction: transactionData,
        customData: { error: error?.message || 'Unknown error' },
        timestamp: new Date().toISOString()
      };

      this.queueEvent(eventData);
    },

    // Track button click
    trackButtonClick(element, customData = {}) {
      const eventData = {
        eventType: 'button_click',
        userId: state.userId,
        sessionId: state.sessionId,
        element: utils.getElementInfo(element),
        customData,
        timestamp: new Date().toISOString()
      };

      this.queueEvent(eventData);
    },

    // Track form submission
    trackFormSubmit(form, customData = {}) {
      const eventData = {
        eventType: 'form_submit',
        userId: state.userId,
        sessionId: state.sessionId,
        element: utils.getElementInfo(form),
        customData,
        timestamp: new Date().toISOString()
      };

      this.queueEvent(eventData);
    },

    // Track custom event
    trackCustomEvent(eventName, customData = {}) {
      const eventData = {
        eventType: 'custom_event',
        userId: state.userId,
        sessionId: state.sessionId,
        customData: {
          eventName,
          ...customData
        },
        timestamp: new Date().toISOString()
      };

      this.queueEvent(eventData);
    },

    // Queue event for batch processing
    queueEvent(eventData) {
      state.eventQueue.push(eventData);

      // Send immediately if queue is full
      if (state.eventQueue.length >= CONFIG.BATCH_SIZE) {
        this.processBatch();
      }
    },

    // Process batch of events
    async processBatch() {
      if (state.eventQueue.length === 0) return;

      const events = state.eventQueue.splice(0, CONFIG.BATCH_SIZE);
      
      try {
        await api.sendBatchEvents(events);
        state.retryCount = 0;
      } catch (error) {
        // Re-queue events on failure
        state.eventQueue.unshift(...events);
        state.retryCount++;

        if (state.retryCount < CONFIG.RETRY_ATTEMPTS) {
          setTimeout(() => this.processBatch(), CONFIG.RETRY_DELAY * state.retryCount);
        }
      }
    },

    // Set up event listeners
    setupEventListeners() {
      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.processBatch();
        }
      });

      // Track before unload
      window.addEventListener('beforeunload', () => {
        this.processBatch();
      });

      // Auto-detect wallet connections (basic detection)
      this.setupWalletDetection();
    },

    // Set up wallet detection
    setupWalletDetection() {
      // Detect MetaMask
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            this.trackWalletConnect(accounts[0], 'metamask');
          } else {
            this.trackWalletDisconnect();
          }
        });
      }

      // Detect WalletConnect
      if (window.WalletConnect) {
        // WalletConnect event listeners would go here
      }
    },

    // Set up batch processing
    setupBatchProcessing() {
      // Process batch periodically
      setInterval(() => {
        if (state.eventQueue.length > 0) {
          this.processBatch();
        }
      }, CONFIG.BATCH_TIMEOUT);
    }
  };

  // Auto-initialization
  const initScript = document.querySelector('script[data-web3-funnel]');
  if (initScript) {
    const websiteId = initScript.getAttribute('data-website-id');
    const apiKey = initScript.getAttribute('data-api-key');
    
    if (websiteId && apiKey) {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          tracker.init(websiteId, apiKey);
        });
      } else {
        tracker.init(websiteId, apiKey);
      }
    }
  }

  // Expose tracker to global scope
  window.Web3Funnel = tracker;

})(); 