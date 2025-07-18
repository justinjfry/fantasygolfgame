const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { Pool } = require('pg');
const fetch = require('node-fetch');

const app = express();
app.set('trust proxy', 1); // trust first proxy for secure cookies on Render
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://fantasygolfgame-frontend.onrender.com', // your frontend URL
  credentials: true
}));
app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,         // Always true on Render (HTTPS)
    httpOnly: true,
    sameSite: 'none',     // Required for cross-site cookies
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

let boardsLocked = true; // Set to true to lock all boards

// Add lock status endpoint
app.get('/api/boards/lock-status', (req, res) => {
  res.json({ locked: boardsLocked });
});

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

// PostgreSQL pool setup - make it optional for development
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} catch (error) {
  console.log('Database connection not available, using fallback mode');
  pool = null;
}

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

// Current British Open leaderboard data as fallback
const currentLeaderboardData = [
  { name: "Matt Fitzpatrick", score: "-9", position: "1", total_score: -9, rounds: [], status: "15" },
  { name: "Brian Harman", score: "-8", position: "T2", total_score: -8, rounds: [], status: "F" },
  { name: "Haotong Li", score: "-8", position: "T2", total_score: -8, rounds: [], status: "F" },
  { name: "Scottie Scheffler", score: "-7", position: "4", total_score: -7, rounds: [], status: "11" },
  { name: "Rasmus Hojgaard", score: "-5", position: "T5", total_score: -5, rounds: [], status: "F" },
  { name: "Tyrrell Hatton", score: "-5", position: "T5", total_score: -5, rounds: [], status: "F" },
  { name: "Robert MacIntyre", score: "-5", position: "T5", total_score: -5, rounds: [], status: "F" },
  { name: "Harris English", score: "-5", position: "T5", total_score: -5, rounds: [], status: "F" },
  { name: "Chris Gotterup", score: "-5", position: "T5", total_score: -5, rounds: [], status: "F" },
  { name: "Tony Finau", score: "-4", position: "T10", total_score: -4, rounds: [], status: "F" },
  { name: "Nicolai Hojgaard", score: "-4", position: "T10", total_score: -4, rounds: [], status: "F" },
  { name: "Keegan Bradley", score: "-3", position: "T12", total_score: -3, rounds: [], status: "F" },
  { name: "Rory McIlroy", score: "-3", position: "T12", total_score: -3, rounds: [], status: "F" },
  { name: "Jordan Smith", score: "-3", position: "T12", total_score: -3, rounds: [], status: "F" },
  { name: "Lee Westwood", score: "-3", position: "T12", total_score: -3, rounds: [], status: "F" },
  { name: "Kristoffer Reitan", score: "-3", position: "T12", total_score: -3, rounds: [], status: "17" },
  { name: "JJ Spaun", score: "-3", position: "T12", total_score: -3, rounds: [], status: "12" },
  { name: "Christiaan Bezuidenhout", score: "-2", position: "T18", total_score: -2, rounds: [], status: "F" },
  { name: "Harry Hall", score: "-2", position: "T18", total_score: -2, rounds: [], status: "F" },
  { name: "Justin Rose", score: "-2", position: "T18", total_score: -2, rounds: [], status: "F" },
  { name: "Ludvig Aberg", score: "-2", position: "T18", total_score: -2, rounds: [], status: "F" },
  { name: "Matthew Jordan", score: "-2", position: "T18", total_score: -2, rounds: [], status: "F" },
  { name: "Sam Burns", score: "-2", position: "T18", total_score: -2, rounds: [], status: "14" },
  { name: "Xander Schauffele", score: "-2", position: "T18", total_score: -2, rounds: [], status: "13" },
  { name: "Marc Leishman", score: "-1", position: "T25", total_score: -1, rounds: [], status: "F" },
  { name: "Rickie Fowler", score: "-1", position: "T25", total_score: -1, rounds: [], status: "F" },
  { name: "Aaron Rai", score: "-1", position: "T25", total_score: -1, rounds: [], status: "F" },
  { name: "Justin Thomas", score: "-1", position: "T25", total_score: -1, rounds: [], status: "F" },
  { name: "Tommy Fleetwood", score: "-1", position: "T25", total_score: -1, rounds: [], status: "F" },
  { name: "Lucas Glover", score: "-1", position: "T25", total_score: -1, rounds: [], status: "F" },
  { name: "Jason Kokrak", score: "-1", position: "T25", total_score: -1, rounds: [], status: "F" },
  { name: "Jon Rahm", score: "-1", position: "T25", total_score: -1, rounds: [], status: "12" },
  { name: "Shane Lowry", score: "-1", position: "T25", total_score: -1, rounds: [], status: "12" },
  { name: "Sadom Kaewkanjana", score: "-1", position: "T25", total_score: -1, rounds: [], status: "8" },
  { name: "Matt Wallace", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Dean Burmester", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Sungjae Im", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Daniel Berger", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Romain Langasque", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Antoine Rozner", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Russell Henley", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Jordan Spieth", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Viktor Hovland", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Jhonattan Vegas", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Phil Mickelson", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Dustin Johnson", score: "E", position: "T35", total_score: 0, rounds: [], status: "F" },
  { name: "Sebastian Soderberg", score: "E", position: "T35", total_score: 0, rounds: [], status: "17" },
  { name: "Akshay Bhatia", score: "E", position: "T35", total_score: 0, rounds: [], status: "15" },
  { name: "Adrien Saddier", score: "E", position: "T35", total_score: 0, rounds: [], status: "17" },
  { name: "Sepp Straka", score: "E", position: "T35", total_score: 0, rounds: [], status: "15" },
  { name: "John Axelsen", score: "E", position: "T35", total_score: 0, rounds: [], status: "9" },
  { name: "Oliver Lindell", score: "E", position: "T35", total_score: 0, rounds: [], status: "8" },
  { name: "Francesco Molinari", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Jesper Svensson", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Sergio Garcia", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Andrew Novak", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "John Parry", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Justin Leonard", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Thriston Lawrence", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Maverick McNealy", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Bryson DeChambeau", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Nathan Kimsey", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Jacob Skov Olesen", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Thomas Detry", score: "+1", position: "T51", total_score: 1, rounds: [], status: "F" },
  { name: "Henrik Stenson", score: "+1", position: "T51", total_score: 1, rounds: [], status: "17" },
  { name: "Takumi Kanaya", score: "+1", position: "T51", total_score: 1, rounds: [], status: "16" },
  { name: "Hideki Matsuyama", score: "+1", position: "T51", total_score: 1, rounds: [], status: "15" },
  { name: "Ryggs Johnston", score: "+1", position: "T51", total_score: 1, rounds: [], status: "10" },
  { name: "Matteo Manassero", score: "+2", position: "T71", total_score: 2, rounds: [], status: "F" },
  { name: "Daniel Hillier", score: "+2", position: "T71", total_score: 2, rounds: [], status: "F" },
  { name: "Rikuya Hoshino", score: "+2", position: "T71", total_score: 2, rounds: [], status: "F" },
  { name: "Joaquin Niemann", score: "+2", position: "T71", total_score: 2, rounds: [], status: "F" },
  { name: "Jason Day", score: "+2", position: "T71", total_score: 2, rounds: [], status: "F" },
  { name: "Corey Conners", score: "+2", position: "T71", total_score: 2, rounds: [], status: "11" },
  { name: "Riki Kawamoto", score: "+2", position: "T71", total_score: 2, rounds: [], status: "8" },
  { name: "Jason Day", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Dustin Johnson", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Julien Guerrier", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Patrick Cantlay", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Sebastian Soderberg", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Justin Walters", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Akshay Bhatia", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "JJ Spaun", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Matti Schmid", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Justin Suh", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Matteo Manassero", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Connor Graham", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Davis Thompson", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Chris Kirk", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Brian Campbell", score: "+3", position: "T99", total_score: 3, rounds: [], status: "F" },
  { name: "Cameron Adam", score: "+3", position: "T99", total_score: 3, rounds: [], status: "17" },
  { name: "Curtis Knipes", score: "+3", position: "T99", total_score: 3, rounds: [], status: "16" },
  { name: "George Bloor", score: "+3", position: "T99", total_score: 3, rounds: [], status: "16" },
  { name: "Marco Penge", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Justin Hastings", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Lucas Herbert", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Cameron Young", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Hideki Matsuyama", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Ben Griffin", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Corey Conners", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Denny McCarthy", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Richard Teder", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Dylan Naidoo", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Laurie Canter", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Rikuya Hoshino", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Si Woo Kim", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Michael Kim", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Min Woo Lee", score: "+4", position: "T115", total_score: 4, rounds: [], status: "F" },
  { name: "Padraig Harrington", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Taylor Pendrith", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Darren Clarke", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Filip Jakubcik", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Henrik Stenson", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Ryan Fox", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Brooks Koepka", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Collin Morikawa", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Stewart Cink", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Ethan Fang", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Elvis Smylie", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Sahith Theegala", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Carlos Ortiz", score: "+5", position: "T128", total_score: 5, rounds: [], status: "F" },
  { name: "Byeong Hun An", score: "+6", position: "T134", total_score: 6, rounds: [], status: "F" },
  { name: "Wyndham Clark", score: "+6", position: "T134", total_score: 6, rounds: [], status: "F" },
  { name: "Daniel Brown", score: "+6", position: "T134", total_score: 6, rounds: [], status: "F" },
  { name: "Matthieu Pavon", score: "+6", position: "T134", total_score: 6, rounds: [], status: "F" },
  { name: "Shugo Imahira", score: "+6", position: "T134", total_score: 6, rounds: [], status: "F" },
  { name: "Sebastian Cave", score: "+6", position: "T134", total_score: 6, rounds: [], status: "F" },
  { name: "Louis Oosthuizen", score: "+7", position: "T144", total_score: 7, rounds: [], status: "F" },
  { name: "Guido Migliozzi", score: "+7", position: "T144", total_score: 7, rounds: [], status: "F" },
  { name: "Ryan Peake", score: "+7", position: "T144", total_score: 7, rounds: [], status: "F" },
  { name: "Niklas Norgaard", score: "+7", position: "T144", total_score: 7, rounds: [], status: "F" },
  { name: "Davis Riley", score: "+7", position: "T144", total_score: 7, rounds: [], status: "F" },
  { name: "Aldrich Potgieter", score: "+7", position: "T144", total_score: 7, rounds: [], status: "F" },
  { name: "Patrick Reed", score: "+7", position: "T144", total_score: 7, rounds: [], status: "F" },
  { name: "Sampson Zheng", score: "+7", position: "T144", total_score: 7, rounds: [], status: "F" },
  { name: "Nick Taylor", score: "+7", position: "T144", total_score: 7, rounds: [], status: "F" },
  { name: "Frazer Jones", score: "+7", position: "T144", total_score: 7, rounds: [], status: "17" },
  { name: "Max Greyserman", score: "+8", position: "T151", total_score: 8, rounds: [], status: "F" },
  { name: "Mikiya Akutsu", score: "+8", position: "T151", total_score: 8, rounds: [], status: "F" },
  { name: "Martin Couvra", score: "+8", position: "T151", total_score: 8, rounds: [], status: "F" },
  { name: "Darren Fichardt", score: "+8", position: "T151", total_score: 8, rounds: [], status: "F" },
  { name: "John Catlin", score: "+8", position: "T151", total_score: 8, rounds: [], status: "17" },
  { name: "Curtis Luck", score: "+8", position: "T151", total_score: 8, rounds: [], status: "16" },
  { name: "Daniel Van Tonder", score: "+9", position: "T157", total_score: 9, rounds: [], status: "F" },
  { name: "Kevin Yu", score: "+9", position: "T157", total_score: 9, rounds: [], status: "F" },
  { name: "Mackenzie Hughes", score: "+9", position: "T157", total_score: 9, rounds: [], status: "F" },
  { name: "K J Choi", score: "+11", position: "T160", total_score: 11, rounds: [], status: "F" },
  { name: "Tom Hoge", score: "+11", position: "T160", total_score: 11, rounds: [], status: "F" },
  { name: "Bryan Newman", score: "+12", position: "162", total_score: 12, rounds: [], status: "F" },
  { name: "Joaquin Niemann", score: "+2", position: "T71", total_score: 2, rounds: [], status: "F" }
];

// SportsRadar API proxy endpoint
app.get('/api/golf/leaderboard', async (req, res) => {
  try {
    const SPORTSRADAR_API_KEY = 'Y20xhFXST1FnsakFRq6Xsz4KlG9geeE2J8L4rHBs';
    const BRITISH_OPEN_TOURNAMENT_ID = '974fd177-eb3c-47fa-a632-b9cf5a57f134';
    
    const url = `https://api.sportradar.com/golf/trial/euro/v3/en/2025/tournaments/${BRITISH_OPEN_TOURNAMENT_ID}/leaderboard.json?api_key=${SPORTSRADAR_API_KEY}`;
    
    console.log('Backend fetching from SportsRadar:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Backend received response with keys:', Object.keys(data));
    console.log('Backend API response status:', response.status);
    console.log('Backend API response data:', JSON.stringify(data, null, 2));
    
    if (Array.isArray(data.leaderboard)) {
      const leaderboard = data.leaderboard.map(player => ({
        name: `${player.first_name} ${player.last_name}`,
        score: player.score ?? 'E',
        position: player.position ?? 'TBD',
        total_score: player.strokes ?? 0,
        rounds: player.rounds ?? [],
        status: player.status ?? ''
      }));
      
      console.log('Backend parsed leaderboard with', leaderboard.length, 'players');
      res.json(leaderboard);
    } else {
      console.log('Backend: No valid leaderboard data found, using current backup data');
      res.json(currentLeaderboardData);
    }
  } catch (error) {
    console.error('Backend SportsRadar API error:', error);
    console.log('Using current backup data due to API error');
    res.json(currentLeaderboardData);
  }
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
app.post('/api/boards', requireAuth, async (req, res) => {
  // Check if boards are locked
  if (boardsLocked) {
    return res.status(423).json({ error: 'Boards are currently locked. Tournament has started!' });
  }
  
  const { board } = req.body;
  const username = req.session.user;
  
  if (!pool) {
    // Fallback to file-based storage
    try {
      db.set(`boards.${username}`, board).write();
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving board:', err);
      res.status(500).json({ error: 'Failed to save board' });
    }
    return;
  }
  
  try {
    await pool.query(
      'INSERT INTO boards (username, board) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET board = EXCLUDED.board',
      [username, board]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving board:', err);
    res.status(500).json({ error: 'Failed to save board' });
  }
});

// Get current user's board (requires authentication)
app.get('/api/boards/my', requireAuth, async (req, res) => {
  const username = req.session.user;
  try {
    const result = await pool.query('SELECT board FROM boards WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Board not found' });
    res.json({ board: result.rows[0].board });
  } catch (err) {
    console.error('Error loading board:', err);
    res.status(500).json({ error: 'Failed to load board' });
  }
});

// Get a specific user's board (public read-only access)
app.get('/api/boards/:username', async (req, res) => {
  const { username } = req.params;
  console.log(`DEBUG: Requesting board for username: "${username}" (length: ${username.length})`);
  try {
    // Try exact match first
    let result = await pool.query('SELECT board FROM boards WHERE username = $1', [username]);
    console.log(`DEBUG: Exact query result for "${username}":`, result.rows.length, 'rows found');
    
    // If no exact match, try with trimmed whitespace
    if (result.rows.length === 0) {
      console.log(`DEBUG: Trying trimmed username search...`);
      result = await pool.query('SELECT board FROM boards WHERE TRIM(username) = $1', [username]);
      console.log(`DEBUG: Trimmed query result for "${username}":`, result.rows.length, 'rows found');
    }
    
    if (result.rows.length === 0) {
      console.log(`DEBUG: No board found for "${username}"`);
      return res.status(404).json({ error: 'Board not found' });
    }
    console.log(`DEBUG: Successfully returning board for "${username}"`);
    res.json({ board: result.rows[0].board });
  } catch (err) {
    console.error('Error loading board:', err);
    res.status(500).json({ error: 'Failed to load board' });
  }
});

// Get all usernames who have saved boards (for leaderboard)
app.get('/api/boards', async (req, res) => {
  try {
    const result = await pool.query('SELECT username FROM boards');
    const usernames = result.rows.map(row => row.username);
    console.log('DEBUG: All usernames in database:', usernames);
    
    // Add detailed logging for each username
    usernames.forEach((username, index) => {
      console.log(`DEBUG: Username ${index}: "${username}" (length: ${username.length})`);
      // Show the character codes to identify hidden characters
      const charCodes = Array.from(username).map(char => char.charCodeAt(0));
      console.log(`DEBUG: Username ${index} char codes:`, charCodes);
    });
    
    res.json({ usernames });
  } catch (err) {
    console.error('Error loading usernames:', err);
    res.status(500).json({ error: 'Failed to load usernames' });
  }
});

// TEMPORARY: Delete a user's board by username (for admin cleanup)
app.delete('/api/delete-board/:username', deleteBoardHandler);
app.get('/api/delete-board/:username', deleteBoardHandler);

// ADMIN: Delete user entirely (board + account)
app.delete('/api/delete-user/:username', deleteUserHandler);

async function deleteBoardHandler(req, res) {
  const { username } = req.params;
  try {
    await pool.query('DELETE FROM boards WHERE username = $1', [username]);
    res.json({ success: true, message: `Deleted board for user: ${username}` });
  } catch (err) {
    console.error('Error deleting board:', err);
    res.status(500).json({ error: 'Failed to delete board' });
  }
}

async function deleteUserHandler(req, res) {
  const { username } = req.params;
  try {
    // Delete board first
    await pool.query('DELETE FROM boards WHERE username = $1', [username]);
    
    // Then delete user account
    await pool.query('DELETE FROM users WHERE username = $1', [username]);
    
    console.log(`Deleted user entirely: ${username}`);
    res.json({ success: true, message: `Deleted user and board for: ${username}` });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  // Check if user already exists
  const existing = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  // Hash password and insert new user
  const hashed = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashed]);
  res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid username or password' });

  const user = result.rows[0];
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



// Get board lock status
app.get('/api/boards/lock-status', (req, res) => {
  res.json({ locked: boardsLocked });
});

app.listen(PORT, () => {
  console.log(`Fantasy Golf Backend running on port ${PORT}`);
}); 