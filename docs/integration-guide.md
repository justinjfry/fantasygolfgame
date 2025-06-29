# Integration Guide: Fantasy Golf Game to dfsboys.com

## Overview
This guide explains how to integrate the fantasy golf game into your existing dfsboys.com website.

## Option 1: Full Integration (Recommended)

### Backend Integration

#### 1. Add Golf Game Routes to Your Existing Server
```javascript
// Add to your existing Express server (e.g., app.js or server.js)

const golfRoutes = require('./golf-game/routes');
app.use('/api/golf', golfRoutes);

// Or integrate directly:
app.get('/api/golf/players', golfController.getPlayers);
app.post('/api/golf/players', golfController.createPlayer);
app.get('/api/golf/courses', golfController.getCourses);
app.post('/api/golf/games', golfController.createGame);
app.put('/api/golf/games/:gameId/score', golfController.updateScore);
```

#### 2. Database Integration
Replace in-memory storage with your existing database:

```javascript
// Example with MongoDB
const Player = require('./models/Player');
const Course = require('./models/Course');
const Game = require('./models/Game');

// Update the API endpoints to use your database
app.get('/api/golf/players', async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 3. User Authentication Integration
```javascript
// Add authentication middleware
app.use('/api/golf/*', authenticateUser);

// Update player creation to link with user accounts
app.post('/api/golf/players', authenticateUser, async (req, res) => {
  const { name, handicap } = req.body;
  const userId = req.user.id; // From your auth system
  
  const player = new Player({
    name,
    handicap,
    userId,
    totalScore: 0,
    gamesPlayed: 0
  });
  
  await player.save();
  res.status(201).json(player);
});
```

### Frontend Integration

#### 1. Add Golf Game to Your Navigation
```html
<!-- Add to your existing navigation -->
<li><a href="/golf">Fantasy Golf</a></li>
```

#### 2. Create Golf Game Page
```javascript
// Add to your existing React app or create a new page
// pages/golf.js or components/GolfGame.js

import { GolfGame } from '../components/golf/GolfGame';

export default function GolfPage() {
  return (
    <div className="golf-container">
      <h1>Fantasy Golf</h1>
      <GolfGame />
    </div>
  );
}
```

#### 3. Style Integration
```css
/* Add golf styles to your existing CSS */
@import './golf-game/styles.css';

/* Or integrate with your existing design system */
.golf-card {
  /* Use your existing card styles */
  @apply your-card-classes;
}
```

## Option 2: Subdomain Integration

### 1. Create Subdomain
```
golf.dfsboys.com
```

### 2. Deploy Separately
- Deploy the golf game as a separate application
- Use your existing domain's subdomain
- Share authentication via cookies or JWT tokens

### 3. Cross-Domain Communication
```javascript
// In your main site
window.open('https://golf.dfsboys.com', '_blank');

// Or embed in iframe
<iframe src="https://golf.dfsboys.com" width="100%" height="600px" />
```

## Option 3: Microservice Architecture

### 1. Separate Golf Service
```
golf-service.dfsboys.com/api
```

### 2. API Gateway Integration
```javascript
// In your main API gateway
app.use('/api/golf/*', proxy('http://golf-service:5000'));
```

## Database Schema Integration

### 1. Add Golf Tables to Your Database
```sql
-- PostgreSQL example
CREATE TABLE golf_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  handicap INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE golf_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  holes INTEGER DEFAULT 18,
  par INTEGER DEFAULT 72,
  difficulty VARCHAR(50),
  description TEXT
);

CREATE TABLE golf_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES golf_courses(id),
  status VARCHAR(50) DEFAULT 'active',
  current_hole INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE golf_game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES golf_games(id),
  player_id UUID REFERENCES golf_players(id),
  scores INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  total_score INTEGER DEFAULT 0
);
```

## Authentication Integration

### 1. Share User Sessions
```javascript
// In your golf game backend
const authenticateUser = (req, res, next) => {
  const token = req.cookies.session || req.headers.authorization;
  
  // Use your existing auth system
  verifyToken(token, (err, user) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  });
};
```

### 2. Single Sign-On
```javascript
// Redirect to main site for login
app.get('/golf/login', (req, res) => {
  res.redirect('/login?redirect=/golf');
});
```

## Deployment Options

### 1. Same Server Deployment
```bash
# Add golf game to your existing deployment
cp -r golf-game/* /var/www/dfsboys.com/golf/
# Update your nginx/apache config
```

### 2. Docker Deployment
```dockerfile
# Add to your existing docker-compose.yml
golf-game:
  build: ./golf-game
  ports:
    - "5001:5000"
  environment:
    - DATABASE_URL=${DATABASE_URL}
```

### 3. Cloud Deployment
- Deploy to same cloud provider as main site
- Use same database instance
- Share CDN and assets

## SEO and Analytics Integration

### 1. Add Golf Pages to Sitemap
```xml
<!-- Add to your sitemap.xml -->
<url>
  <loc>https://dfsboys.com/golf</loc>
  <lastmod>2024-01-01</lastmod>
</url>
```

### 2. Analytics Tracking
```javascript
// Add to golf game components
useEffect(() => {
  // Your existing analytics
  gtag('event', 'page_view', {
    page_title: 'Fantasy Golf',
    page_location: '/golf'
  });
}, []);
```

## Revenue Integration

### 1. Premium Features
```javascript
// Add premium golf features
const isPremiumUser = user.subscription?.includes('golf-premium');

if (isPremiumUser) {
  // Enable advanced features
  enableTournamentMode();
  enableAdvancedStats();
}
```

### 2. Subscription Integration
```javascript
// Integrate with your existing payment system
app.post('/api/golf/subscribe', authenticateUser, async (req, res) => {
  const subscription = await createSubscription(req.user.id, 'golf-premium');
  res.json(subscription);
});
```

## Testing Integration

### 1. End-to-End Tests
```javascript
// Add golf tests to your existing test suite
describe('Golf Game Integration', () => {
  test('User can create golf game', async () => {
    // Test integration with main site
  });
});
```

### 2. API Tests
```javascript
// Test golf API endpoints
describe('Golf API', () => {
  test('GET /api/golf/players', async () => {
    // Test with authenticated user
  });
});
```

## Monitoring and Maintenance

### 1. Add Golf Metrics
```javascript
// Add to your existing monitoring
app.use('/api/golf/*', (req, res, next) => {
  // Track golf API usage
  trackMetric('golf_api_calls', 1);
  next();
});
```

### 2. Error Handling
```javascript
// Integrate with your existing error handling
app.use('/api/golf/*', (error, req, res, next) => {
  // Log to your existing error tracking
  logError('golf_error', error);
  next(error);
});
```

## Next Steps

1. **Choose Integration Option** - Full integration recommended for better UX
2. **Database Planning** - Decide on shared vs separate database
3. **Authentication Strategy** - Single sign-on or separate auth
4. **Deployment Plan** - Same server or microservice approach
5. **Testing Strategy** - Integration tests with existing functionality
6. **Monitoring Setup** - Add golf metrics to existing monitoring

## Support

For integration help, refer to:
- Your existing codebase architecture
- Database schema documentation
- Authentication system documentation
- Deployment pipeline documentation 