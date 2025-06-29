import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Player {
  id: string;
  name: string;
  handicap: number;
  totalScore: number;
  gamesPlayed: number;
  createdAt: string;
}

export const Players: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerHandicap, setNewPlayerHandicap] = useState(0);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
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
      fetchPlayers();
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-golf-green" />
        <h1 className="text-3xl font-bold text-white font-golf">Players</h1>
      </div>

      {/* Add Player Form */}
      <div className="golf-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Player</h2>
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

      {/* Players List */}
      <div className="golf-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">All Players</h2>
        {players.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No players yet. Add your first player above!</p>
        ) : (
          <div className="grid gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{player.name}</h3>
                  <div className="flex gap-6 text-sm text-gray-600 mt-1">
                    <span>Handicap: {player.handicap}</span>
                    <span>Games: {player.gamesPlayed}</span>
                    <span>Total Score: {player.totalScore}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:text-golf-green">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 