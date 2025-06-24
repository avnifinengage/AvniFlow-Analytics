# Web3 Funnel Analytics 🚀

A comprehensive analytics platform designed specifically for Web3 companies to track customer behavior, optimize user experience, and improve conversion rates.

## 🌟 Features

### 📊 Event Tracking
- **Wallet Connections**: Track MetaMask, WalletConnect, and other wallet connections
- **Transaction Monitoring**: Monitor transaction starts, completions, and failures
- **Page Views**: Automatic page view tracking with performance metrics
- **User Interactions**: Button clicks, form submissions, and custom events
- **Session Management**: Complete user journey tracking across sessions

### 🔍 Analytics & Insights
- **Real-time Analytics**: Live dashboard with real-time event tracking
- **Funnel Analysis**: Track user progression through conversion funnels
- **Conversion Optimization**: Identify drop-off points and optimization opportunities
- **User Segmentation**: Segment users by wallet type, behavior, and demographics
- **Performance Metrics**: Page load times, user engagement, and technical performance

### 🛡️ Privacy & Security
- **GDPR Compliant**: Built with privacy regulations in mind
- **Data Anonymization**: Optional IP anonymization and data protection
- **Secure API**: Rate limiting, authentication, and validation
- **Domain Validation**: Ensure events only come from authorized domains

## 🚀 Quick Start

### 1. Deploy the Backend

The backend is already deployed on Render. You can also deploy it locally:

```bash
# Clone the repository
git clone <your-repo-url>
cd web3-funnel-backend-1

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI

# Start the server
npm run dev
```

### 2. Register Your Website

First, register your website to get an API key:

```bash
curl -X POST https://your-render-app.onrender.com/api/v1/websites/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Web3 App",
    "domain": "myapp.com",
    "description": "A decentralized application",
    "owner": {
      "name": "John Doe",
      "email": "john@myapp.com"
    }
  }'
```

### 3. Integrate the Widget

Add the tracking widget to your website:

```html
<!-- Add this to your HTML head -->
<script 
  src="https://your-render-app.onrender.com/widget.js"
  data-web3-funnel
  data-website-id="your-website-id"
  data-api-key="your-api-key">
</script>
```

### 4. Track Custom Events

Use the JavaScript API to track custom events:

```javascript
// Track wallet connection
Web3Funnel.trackWalletConnect('0x1234...', 'metamask');

// Track transaction
Web3Funnel.trackTransaction({
  hash: '0xabcd...',
  from: '0x1234...',
  to: '0x5678...',
  value: '1000000000000000000',
  network: 'ethereum'
});

// Track custom event
Web3Funnel.trackCustomEvent('nft_minted', {
  collection: 'Bored Apes',
  tokenId: 1234
});
```

## 📚 API Documentation

### Authentication

All API requests require an API key in the header:

```
X-API-Key: your-api-key-here
```

### Event Tracking Endpoints

#### Track Single Event
```http
POST /api/v1/events/track
Content-Type: application/json
X-API-Key: your-api-key

{
  "eventType": "wallet_connect",
  "userId": "user-123",
  "sessionId": "session-456",
  "walletAddress": "0x1234...",
  "walletType": "metamask"
}
```

#### Track Batch Events
```http
POST /api/v1/events/track/batch
Content-Type: application/json
X-API-Key: your-api-key

{
  "events": [
    {
      "eventType": "page_view",
      "userId": "user-123",
      "sessionId": "session-456"
    },
    {
      "eventType": "button_click",
      "userId": "user-123",
      "sessionId": "session-456"
    }
  ]
}
```

#### Get Events
```http
GET /api/v1/events/events?eventType=wallet_connect&startDate=2024-01-01&limit=50
X-API-Key: your-api-key
```

#### Get Event Statistics
```http
GET /api/v1/events/stats?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
X-API-Key: your-api-key
```

### Website Management Endpoints

#### Get Website Analytics
```http
GET /api/v1/websites/analytics?startDate=2024-01-01&endDate=2024-01-31
X-API-Key: your-api-key
```

#### Update Website Settings
```http
PUT /api/v1/websites/update
Content-Type: application/json
X-API-Key: your-api-key

{
  "settings": {
    "trackingEnabled": true,
    "trackEvents": {
      "walletConnections": true,
      "transactions": true,
      "pageViews": true
    }
  }
}
```

## 🎯 Event Types

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `page_view` | User visits a page | `userId`, `sessionId` |
| `wallet_connect` | User connects wallet | `userId`, `sessionId`, `walletAddress` |
| `wallet_disconnect` | User disconnects wallet | `userId`, `sessionId`, `walletAddress` |
| `transaction_start` | Transaction initiated | `userId`, `sessionId`, `transaction` |
| `transaction_complete` | Transaction completed | `userId`, `sessionId`, `transaction` |
| `transaction_failed` | Transaction failed | `userId`, `sessionId`, `transaction` |
| `button_click` | User clicks button | `userId`, `sessionId`, `element` |
| `form_submit` | User submits form | `userId`, `sessionId`, `element` |
| `custom_event` | Custom event | `userId`, `sessionId`, `customData` |

## 🔧 Configuration

### Environment Variables

```bash
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/web3funnel

# Server Configuration
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your-jwt-secret
```

### Widget Configuration

The widget can be configured with data attributes:

```html
<script 
  src="https://your-render-app.onrender.com/widget.js"
  data-web3-funnel
  data-website-id="your-website-id"
  data-api-key="your-api-key"
  data-batch-size="10"
  data-batch-timeout="5000">
</script>
```

## 📊 Analytics Dashboard

The platform provides comprehensive analytics including:

- **Real-time Events**: Live feed of user events
- **Conversion Funnels**: Track user progression through key steps
- **User Journey Maps**: Visualize user paths through your application
- **Performance Metrics**: Page load times and technical performance
- **Wallet Analytics**: Wallet type distribution and connection patterns
- **Transaction Analytics**: Success rates, gas usage, and network preferences

## 🔒 Security & Privacy

### Data Protection
- All data is encrypted in transit and at rest
- Optional IP anonymization for GDPR compliance
- Configurable data retention policies
- Secure API key management

### Rate Limiting
- 1000 events per minute per website
- 100 API calls per 15 minutes
- Configurable limits per website

### Domain Validation
- Events are only accepted from registered domains
- Automatic origin validation
- Protection against unauthorized tracking

## 🚀 Deployment

### Render Deployment
The application is already deployed on Render. To deploy your own instance:

1. Fork this repository
2. Connect to Render
3. Set environment variables
4. Deploy

### Local Development
```bash
npm install
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@web3funnel.com
- Documentation: https://docs.web3funnel.com

## 🔮 Roadmap

- [ ] Real-time dashboard
- [ ] Advanced funnel analysis
- [ ] A/B testing integration
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced segmentation
- [ ] Predictive analytics
- [ ] Integration marketplace

---

**Built with ❤️ for the Web3 community** 