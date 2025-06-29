#!/usr/bin/env node

/**
 * Integration Script for dfsboys.com
 * This script helps integrate the fantasy golf game with your existing website
 */

const fs = require('fs');
const path = require('path');

console.log('🏌️  Fantasy Golf Integration Script for dfsboys.com');
console.log('==================================================\n');

// Configuration
const config = {
  mainSitePath: process.env.DFSBOYS_PATH || '../dfsboys-website',
  golfGamePath: process.cwd(),
  integrationType: process.argv[2] || 'full', // 'full', 'subdomain', 'microservice'
};

function checkPrerequisites() {
  console.log('1. Checking prerequisites...');
  
  const requiredFiles = [
    'backend/server.js',
    'frontend/src/App.tsx',
    'package.json'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required files:', missingFiles);
    process.exit(1);
  }
  
  console.log('✅ All required files found\n');
}

function generateIntegrationFiles() {
  console.log('2. Generating integration files...');
  
  // Create database models
  const playerModel = `const mongoose = require('mongoose');

const golfPlayerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  handicap: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GolfPlayer', golfPlayerSchema);`;

  const courseModel = `const mongoose = require('mongoose');

const golfCourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  holes: {
    type: Number,
    default: 18
  },
  par: {
    type: Number,
    default: 72
  },
  difficulty: {
    type: String,
    enum: ['Amateur', 'Professional', 'Championship'],
    default: 'Amateur'
  },
  description: String
});

module.exports = mongoose.model('GolfCourse', golfCourseSchema);`;

  const gameModel = `const mongoose = require('mongoose');

const golfGameSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GolfCourse',
    required: true
  },
  courseName: String,
  playerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GolfPlayer'
  }],
  players: [{
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    handicap: Number,
    scores: [Number],
    totalScore: Number
  }],
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  currentHole: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('GolfGame', golfGameSchema);`;

  // Create integration routes
  const integrationRoutes = `const express = require('express');
const router = express.Router();
const GolfPlayer = require('../models/GolfPlayer');
const GolfCourse = require('../models/GolfCourse');
const GolfGame = require('../models/GolfGame');

// Middleware to authenticate user (integrate with your existing auth)
const authenticateUser = (req, res, next) => {
  // TODO: Replace with your existing authentication middleware
  // Example: req.user should be set by your auth system
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply auth to all golf routes
router.use(authenticateUser);

// Get all players for current user
router.get('/players', async (req, res) => {
  try {
    const players = await GolfPlayer.find({ userId: req.user.id });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new player
router.post('/players', async (req, res) => {
  try {
    const { name, handicap } = req.body;
    const player = new GolfPlayer({
      userId: req.user.id,
      name,
      handicap: handicap || 0
    });
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await GolfCourse.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all games for current user
router.get('/games', async (req, res) => {
  try {
    const games = await GolfGame.find({
      'players.id': { $in: await GolfPlayer.find({ userId: req.user.id }).select('_id') }
    }).populate('courseId');
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new game
router.post('/games', async (req, res) => {
  try {
    const { courseId, playerIds } = req.body;
    const course = await GolfCourse.findById(courseId);
    const players = await GolfPlayer.find({ _id: { $in: playerIds } });
    
    const game = new GolfGame({
      courseId,
      courseName: course.name,
      playerIds,
      players: players.map(p => ({
        id: p._id,
        name: p.name,
        handicap: p.handicap,
        scores: new Array(18).fill(0),
        totalScore: 0
      }))
    });
    
    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update game score
router.put('/games/:gameId/score', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId, hole, score } = req.body;
    
    const game = await GolfGame.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const player = game.players.find(p => p.id.toString() === playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found in game' });
    }
    
    player.scores[hole - 1] = score;
    player.totalScore = player.scores.reduce((sum, s) => sum + s, 0);
    
    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete a game
router.put('/games/:gameId/complete', async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await GolfGame.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    game.status = 'completed';
    game.completedAt = new Date();
    
    // Update player statistics
    for (const gamePlayer of game.players) {
      const player = await GolfPlayer.findById(gamePlayer.id);
      if (player) {
        player.gamesPlayed += 1;
        player.totalScore += gamePlayer.totalScore;
        await player.save();
      }
    }
    
    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`;

  // Create files
  const files = [
    { path: 'integration/models/GolfPlayer.js', content: playerModel },
    { path: 'integration/models/GolfCourse.js', content: courseModel },
    { path: 'integration/models/GolfGame.js', content: gameModel },
    { path: 'integration/routes/golf.js', content: integrationRoutes }
  ];

  files.forEach(file => {
    const dir = path.dirname(file.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file.path, file.content);
    console.log(`✅ Created ${file.path}`);
  });

  console.log('');
}

function generateFrontendIntegration() {
  console.log('3. Generating frontend integration...');
  
  const golfPage = `import React from 'react';
import { GolfGame } from '../components/golf/GolfGame';

export default function GolfPage() {
  return (
    <div className="golf-page">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Fantasy Golf</h1>
        <GolfGame />
      </div>
    </div>
  );
}`;

  const navigationUpdate = `// Add this to your existing navigation component
const navItems = [
  // ... your existing nav items
  {
    path: '/golf',
    label: 'Fantasy Golf',
    icon: 'GolfIcon', // Replace with your icon component
    requiresAuth: true
  }
];`;

  const files = [
    { path: 'integration/frontend/pages/GolfPage.js', content: golfPage },
    { path: 'integration/frontend/NavigationUpdate.js', content: navigationUpdate }
  ];

  files.forEach(file => {
    const dir = path.dirname(file.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file.path, file.content);
    console.log(`✅ Created ${file.path}`);
  });

  console.log('');
}

function generateDeploymentConfig() {
  console.log('4. Generating deployment configuration...');
  
  const nginxConfig = `# Add to your existing nginx configuration
location /golf {
    alias /var/www/dfsboys.com/golf/frontend/build;
    try_files $uri $uri/ /golf/index.html;
}

location /api/golf {
    proxy_pass http://localhost:5001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}`;

  const dockerCompose = `# Add to your existing docker-compose.yml
golf-game:
  build: ./golf-game
  ports:
    - "5001:5000"
  environment:
    - NODE_ENV=production
    - DATABASE_URL=${DATABASE_URL}
  depends_on:
    - database
  volumes:
    - ./golf-game:/app
    - /app/node_modules`;

  const files = [
    { path: 'integration/deployment/nginx-golf.conf', content: nginxConfig },
    { path: 'integration/deployment/docker-compose-golf.yml', content: dockerCompose }
  ];

  files.forEach(file => {
    const dir = path.dirname(file.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file.path, file.content);
    console.log(`✅ Created ${file.path}`);
  });

  console.log('');
}

function generateIntegrationGuide() {
  console.log('5. Generating step-by-step integration guide...');
  
  const steps = `# Step-by-Step Integration Guide

## Phase 1: Backend Integration

1. **Copy Models** (integration/models/) to your main project
2. **Add Golf Routes** to your Express server:
   \`\`\`javascript
   const golfRoutes = require('./routes/golf');
   app.use('/api/golf', golfRoutes);
   \`\`\`
3. **Update Authentication** - Replace the placeholder auth in golf routes
4. **Test API Endpoints** - Ensure all golf endpoints work with your auth

## Phase 2: Frontend Integration

1. **Copy Golf Components** from frontend/src/components/ to your React app
2. **Add Golf Page** - Create /golf route in your router
3. **Update Navigation** - Add golf link to your main navigation
4. **Style Integration** - Merge golf styles with your existing CSS
5. **Test Frontend** - Ensure golf game works in your app

## Phase 3: Database Setup

1. **Run Migrations** - Add golf tables to your database
2. **Seed Data** - Add sample golf courses
3. **Test Database** - Verify all golf operations work

## Phase 4: Deployment

1. **Update Build Process** - Include golf game in your build
2. **Update Server Config** - Add golf routes to nginx/apache
3. **Deploy** - Deploy to your production server
4. **Test Production** - Verify everything works in production

## Phase 5: Monitoring & Analytics

1. **Add Golf Metrics** to your monitoring
2. **Update Analytics** to track golf usage
3. **Add Error Tracking** for golf-specific errors

## Troubleshooting

- **Auth Issues**: Ensure your auth middleware works with golf routes
- **CORS Issues**: Update CORS settings to include golf endpoints
- **Database Issues**: Check database connections and permissions
- **Build Issues**: Ensure all golf dependencies are included`;

  fs.writeFileSync('integration/INTEGRATION_STEPS.md', steps);
  console.log('✅ Created integration/INTEGRATION_STEPS.md');
  console.log('');
}

function main() {
  try {
    checkPrerequisites();
    generateIntegrationFiles();
    generateFrontendIntegration();
    generateDeploymentConfig();
    generateIntegrationGuide();
    
    console.log('🎉 Integration files generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated files in the integration/ folder');
    console.log('2. Follow the step-by-step guide in integration/INTEGRATION_STEPS.md');
    console.log('3. Customize the integration for your specific setup');
    console.log('4. Test thoroughly before deploying to production');
    console.log('\nFor detailed instructions, see docs/integration-guide.md');
    
  } catch (error) {
    console.error('❌ Integration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, config }; 