import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Flag, Users, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface GamePlayer {
  id: string;
  name: string;
  handicap: number;
  scores: number[];
  totalScore: number;
}

interface Game {
  id: string;
  courseId: string;
  courseName: string;
  playerIds: string[];
  players: GamePlayer[];
  status: string;
  currentHole: number;
  createdAt: string;
}

export const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedHole, setSelectedHole] = useState(1);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  const fetchGame = async () => {
    try {
      const response = await axios.get(`/api/games/${gameId}`);
      setGame(response.data);
      if (response.data.players.length > 0) {
        setSelectedPlayer(response.data.players[0].id);
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  const updateScore = async () => {
    if (!game || !selectedPlayer || score <= 0) return;

    try {
      await axios.put(`/api/games/${gameId}/score`, {
        playerId: selectedPlayer,
        hole: selectedHole,
        score: score
      });
      setScore(0);
      fetchGame();
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const completeGame = async () => {
    if (!game) return;

    try {
      await axios.put(`/api/games/${gameId}/complete`);
      fetchGame();
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  if (!game) {
    return (
      <div className="golf-card rounded-xl p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-green mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="golf-card rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-golf-green font-golf">{game.courseName}</h1>
            <p className="text-gray-600">Game ID: {game.id}</p>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              game.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {game.status}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {game.players.length} players
            </p>
          </div>
        </div>
      </div>

      {/* Score Entry */}
      {game.status === 'active' && (
        <div className="golf-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Enter Score</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Player</label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-golf-green"
              >
                {game.players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hole</label>
              <select
                value={selectedHole}
                onChange={(e) => setSelectedHole(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-golf-green"
              >
                {Array.from({ length: 18 }, (_, i) => i + 1).map((hole) => (
                  <option key={hole} value={hole}>
                    Hole {hole}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
              <input
                type="number"
                min="1"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-golf-green"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={updateScore}
                disabled={!selectedPlayer || score <= 0}
                className="golf-button text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                Update Score
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="golf-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Leaderboard</h2>
          {game.status === 'active' && (
            <button
              onClick={completeGame}
              className="golf-button text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Complete Game
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold">Player</th>
                <th className="text-center py-3 px-4 font-semibold">Handicap</th>
                <th className="text-center py-3 px-4 font-semibold">Total Score</th>
                <th className="text-center py-3 px-4 font-semibold">Net Score</th>
                <th className="text-center py-3 px-4 font-semibold">Position</th>
              </tr>
            </thead>
            <tbody>
              {game.players
                .map((player) => ({
                  ...player,
                  netScore: player.totalScore - player.handicap
                }))
                .sort((a, b) => a.netScore - b.netScore)
                .map((player, index) => (
                  <tr key={player.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{player.name}</td>
                    <td className="text-center py-3 px-4">{player.handicap}</td>
                    <td className="text-center py-3 px-4">{player.totalScore}</td>
                    <td className="text-center py-3 px-4">{player.netScore}</td>
                    <td className="text-center py-3 px-4">
                      {index === 0 && <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />}
                      {index !== 0 && <span className="text-gray-600">{index + 1}</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Details */}
      <div className="golf-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Score Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold">Player</th>
                {Array.from({ length: 18 }, (_, i) => (
                  <th key={i + 1} className="text-center py-2 px-1 font-semibold text-sm">
                    {i + 1}
                  </th>
                ))}
                <th className="text-center py-2 px-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {game.players.map((player) => (
                <tr key={player.id} className="border-b border-gray-100">
                  <td className="py-2 px-2 font-medium text-sm">{player.name}</td>
                  {player.scores.map((score, index) => (
                    <td key={index} className="text-center py-2 px-1 text-sm">
                      {score > 0 ? score : '-'}
                    </td>
                  ))}
                  <td className="text-center py-2 px-2 font-semibold">{player.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 