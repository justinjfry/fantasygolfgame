const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// In-memory data storage (in production, use a database)
let players = [];
let courses = [];
let games = [];

const adapter = new FileSync('boards.json');
const db = low(adapter);

db.defaults({ boards: {} }).write();

const USERS_FILE = './users.json';

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Sample golf courses
const sampleCourses = [
  {
    id: '1',
    name: 'Augusta National',
    holes: 18,
    par: 72,
    difficulty: 'Championship',
    description: 'Home of the Masters Tournament'
  },
  {
    id: '2',
    name: 'Pebble Beach',
    holes: 18,
    par: 72,
    difficulty: 'Championship',
    description: 'Stunning coastal golf course'
  },
  {
    id: '3',
    name: 'St. Andrews Old Course',
    holes: 18,
    par: 72,
    difficulty: 'Championship',
    description: 'The oldest golf course in the world'
  }
];

// Initialize sample data
courses = sampleCourses;

// API Routes

// Get all players
app.get('/api/players', (req, res) => {
  res.json(players);
});

// Create a new player
app.post('/api/players', (req, res) => {
  const { name, handicap } = req.body;
  const newPlayer = {
    id: uuidv4(),
    name,
    handicap: handicap || 0,
    totalScore: 0,
    gamesPlayed: 0,
    createdAt: new Date().toISOString()
  };
  players.push(newPlayer);
  res.status(201).json(newPlayer);
});

// Get all courses
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

// Get all games
app.get('/api/games', (req, res) => {
  res.json(games);
});

// Create a new game
app.post('/api/games', (req, res) => {
  const { courseId, playerIds } = req.body;
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const newGame = {
    id: uuidv4(),
    courseId,
    courseName: course.name,
    playerIds,
    players: playerIds.map(id => {
      const player = players.find(p => p.id === id);
      return {
        id: player.id,
        name: player.name,
        handicap: player.handicap,
        scores: new Array(18).fill(0),
        totalScore: 0
      };
    }),
    status: 'active',
    currentHole: 1,
    createdAt: new Date().toISOString()
  };

  games.push(newGame);
  res.status(201).json(newGame);
});

// Update game score
app.put('/api/games/:gameId/score', (req, res) => {
  const { gameId } = req.params;
  const { playerId, hole, score } = req.body;

  const game = games.find(g => g.id === gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    return res.status(404).json({ error: 'Player not found in game' });
  }

  player.scores[hole - 1] = score;
  player.totalScore = player.scores.reduce((sum, s) => sum + s, 0);

  res.json(game);
});

// Complete a game
app.put('/api/games/:gameId/complete', (req, res) => {
  const { gameId } = req.params;
  const game = games.find(g => g.id === gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  game.status = 'completed';
  game.completedAt = new Date().toISOString();

  // Update player statistics
  game.players.forEach(gamePlayer => {
    const player = players.find(p => p.id === gamePlayer.id);
    if (player) {
      player.gamesPlayed += 1;
      player.totalScore += gamePlayer.totalScore;
    }
  });

  res.json(game);
});

// Get game leaderboard
app.get('/api/games/:gameId/leaderboard', (req, res) => {
  const { gameId } = req.params;
  const game = games.find(g => g.id === gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const leaderboard = game.players
    .map(player => ({
      id: player.id,
      name: player.name,
      totalScore: player.totalScore,
      handicap: player.handicap,
      netScore: player.totalScore - player.handicap
    }))
    .sort((a, b) => a.netScore - b.netScore);

  res.json(leaderboard);
});

// Save or update a user's board (requires authentication)
app.post('/api/boards', requireAuth, (req, res) => {
  const { board } = req.body;
  const username = req.session.user;
  // Remove any old board for this user
  db.get('boards').remove({ username }).write();
  // Save new board for this user
  db.get('boards').push({ username, board }).write();
  res.json({ success: true });
});

// Get current user's board (requires authentication)
app.get('/api/boards/my', requireAuth, (req, res) => {
  const username = req.session.user;
  const board = db.get('boards').find({ username }).value();
  if (!board) return res.status(404).json({ error: 'Board not found' });
  res.json({ board: board.board });
});

// Get a specific user's board (public read-only access)
app.get('/api/boards/:username', (req, res) => {
  const { username } = req.params;
  const board = db.get('boards').find({ username }).value();
  if (!board) return res.status(404).json({ error: 'Board not found' });
  res.json({ board: board.board });
});

// Get all usernames who have saved boards (for leaderboard)
app.get('/api/boards', (req, res) => {
  const boards = db.get('boards').value() || [];
  const usernames = boards.map(board => board.username);
  res.json({ usernames });
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const users = loadUsers();
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  saveUsers(users);
  // Ensure file is written before responding
  setTimeout(() => {
    res.json({ success: true });
  }, 100);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid username or password' });
  req.session.user = username;
  res.json({ success: true, username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check if user is authenticated
app.get('/api/auth/check', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, username: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

app.listen(PORT, () => {
  console.log(`Fantasy Golf Backend running on port ${PORT}`);
}); 