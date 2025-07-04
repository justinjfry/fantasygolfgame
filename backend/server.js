const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data storage (in production, use a database)
let players = [];
let courses = [];
let games = [];

const adapter = new FileSync('boards.json');
const db = low(adapter);

db.defaults({ boards: {} }).write();

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

// Save or update a user's board
app.post('/api/boards', (req, res) => {
  const { username, board } = req.body;
  console.log('Received save request:', req.body); // Debug log
  if (!username || !board) {
    console.log('Missing username or board in request'); // Debug log
    return res.status(400).json({ error: 'Missing username or board' });
  }
  db.get('boards').remove({ username }).write(); // Remove old board if exists
  db.get('boards').push({ username, board }).write();
  console.log('Board saved for', username); // Debug log
  res.json({ success: true });
});

// Get a user's board
app.get('/api/boards/:username', (req, res) => {
  const { username } = req.params;
  const board = db.get(`boards.${username}`).value();
  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }
  res.json({ board });
});

// Get all usernames (for leaderboard)
app.get('/api/boards', (req, res) => {
  const boards = db.get('boards').value() || {};
  const usernames = Object.keys(boards);
  res.json({ usernames });
});

app.listen(PORT, () => {
  console.log(`Fantasy Golf Backend running on port ${PORT}`);
}); 