# Fantasy Golf Game

A modern web-based fantasy golf game where you can create tournaments, manage players, and track scores in real-time.

## Features

- 🏌️ **Player Management** - Add players with handicaps and track their statistics
- 🏟️ **Golf Courses** - Multiple championship courses to choose from
- 🎮 **Real-time Scoring** - Enter scores hole by hole with live leaderboards
- 📊 **Statistics Tracking** - Monitor player performance and game history
- 🏆 **Leaderboards** - See who's winning with net score calculations
- 📱 **Responsive Design** - Works great on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **RESTful API** for data management
- **In-memory storage** (easily upgradable to database)

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fantasy_golf_game
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Manual Installation

If you prefer to install dependencies separately:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## How to Play

1. **Add Players** - Go to the Players page and add your golf buddies with their handicaps
2. **Start a Game** - From the home page, click "Start New Game" to begin a tournament
3. **Enter Scores** - Select a player, choose a hole, and enter their score
4. **Track Progress** - Watch the leaderboard update in real-time
5. **Complete Game** - Finish the round and see the final results

## API Endpoints

### Players
- `GET /api/players` - Get all players
- `POST /api/players` - Create a new player

### Courses
- `GET /api/courses` - Get all available courses

### Games
- `GET /api/games` - Get all games
- `POST /api/games` - Create a new game
- `PUT /api/games/:gameId/score` - Update a player's score
- `PUT /api/games/:gameId/complete` - Complete a game
- `GET /api/games/:gameId/leaderboard` - Get game leaderboard

## Project Structure

```
fantasy_golf_game/
├── backend/
│   ├── server.js          # Express server with API routes
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Home.tsx
│   │   │   ├── Players.tsx
│   │   │   ├── Courses.tsx
│   │   │   ├── Game.tsx
│   │   │   └── Navigation.tsx
│   │   ├── App.tsx        # Main app component
│   │   ├── index.tsx      # React entry point
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── assets/                # Game assets (images, etc.)
├── docs/                  # Documentation
└── package.json           # Root package.json
```

## Customization

### Adding New Courses
Edit the `sampleCourses` array in `backend/server.js` to add more golf courses.

### Styling
The app uses Tailwind CSS with custom golf-themed colors. Modify `frontend/tailwind.config.js` to change the color scheme.

### Database Integration
Replace the in-memory storage in `backend/server.js` with your preferred database (MongoDB, PostgreSQL, etc.).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Tournament brackets and elimination rounds
- [ ] Course visualization and hole layouts
- [ ] Mobile app version
- [ ] Social features and sharing
- [ ] Advanced statistics and analytics
- [ ] Weather integration for course conditions
- [ ] Multi-language support

---

**Enjoy your round of Fantasy Golf!** ⛳ 