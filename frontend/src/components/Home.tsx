import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, MapPin, Trophy, Plus } from 'lucide-react';
import axios from 'axios';

interface Player {
  id: string;
  name: string;
  handicap: number;
  totalScore: number;
  gamesPlayed: number;
}

interface Course {
  id: string;
  name: string;
  holes: number;
  par: number;
  difficulty: string;
  description: string;
}

interface Game {
  id: string;
  courseName: string;
  status: string;
  players: Player[];
  createdAt: string;
}

export const Home: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerHandicap, setNewPlayerHandicap] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, coursesRes, gamesRes] = await Promise.all([
        axios.get('/api/players'),
        axios.get('/api/courses'),
        axios.get('/api/games')
      ]);
      setPlayers(playersRes.data);
      setCourses(coursesRes.data);
      setGames(gamesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const createPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    try {
      await axios.post('/api/players', {
        name: newPlayerName,
        handicap: newPlayerHandicap
      });
      setNewPlayerName('');
      setNewPlayerHandicap(0);
      fetchData();
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  const createGame = async () => {
    if (players.length === 0 || courses.length === 0) return;

    try {
      const response = await axios.post('/api/games', {
        courseId: courses[0].id,
        playerIds: players.map(p => p.id)
      });
      window.location.href = `/game/${response.data.id}`;
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 font-golf">
          British Open Golf
        </h1>
        <p className="text-xl text-white/90 mb-8">
          Create your dream golf tournament and compete with friends
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="golf-card rounded-xl p-6 text-center">
          <Users className="h-12 w-12 text-golf-green mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Players</h3>
          <p className="text-gray-600 mb-4">{players.length} registered</p>
          <Link
            to="/players"
            className="golf-button text-white px-6 py-2 rounded-lg inline-block"
          >
            Manage Players
          </Link>
        </div>

        <div className="golf-card rounded-xl p-6 text-center">
          <MapPin className="h-12 w-12 text-golf-green mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Courses</h3>
          <p className="text-gray-600 mb-4">{courses.length} available</p>
          <Link
            to="/courses"
            className="golf-button text-white px-6 py-2 rounded-lg inline-block"
          >
            View Courses
          </Link>
        </div>

        <div className="golf-card rounded-xl p-6 text-center">
          <Trophy className="h-12 w-12 text-golf-green mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Games</h3>
          <p className="text-gray-600 mb-4">{games.length} total</p>
          <button
            onClick={createGame}
            disabled={players.length === 0 || courses.length === 0}
            className="golf-button text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            Start New Game
          </button>
        </div>
      </div>

      {/* Add Player Form */}
      <div className="golf-card rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Add New Player</h2>
        <form onSubmit={createPlayer} className="flex gap-4">
          <input
            type="text"
            placeholder="Player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-golf-green"
          />
          <input
            type="number"
            placeholder="Handicap"
            value={newPlayerHandicap}
            onChange={(e) => setNewPlayerHandicap(Number(e.target.value))}
            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-golf-green"
          />
          <button
            type="submit"
            className="golf-button text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Player
          </button>
        </form>
      </div>

      {/* Recent Games */}
      {games.length > 0 && (
        <div className="golf-card rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Games</h2>
          <div className="space-y-3">
            {games.slice(0, 5).map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{game.courseName}</h3>
                  <p className="text-sm text-gray-600">
                    {game.players.length} players • {game.status}
                  </p>
                </div>
                <Link
                  to={`/game/${game.id}`}
                  className="text-golf-green hover:underline"
                >
                  View Game
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 