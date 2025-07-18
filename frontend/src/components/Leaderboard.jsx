import React, { useEffect, useState } from 'react';
import api from '../api';
import Board from './Board';
import golfApi from '../services/golfApi';

// Utility function to calculate bingo line scores
const calculateBingoLines = (boardContent, leaderboardData) => {
  if (!boardContent || !leaderboardData) return null;
  
  // Helper function to get player score as number
  const getPlayerScoreAsNumber = (playerName) => {
    if (!playerName || !playerName.name) return null;
    
    const player = leaderboardData.find(p => 
      p.name.toLowerCase() === playerName.name.toLowerCase()
    );
    
    if (!player) return null;
    
    const score = player.score;
    if (score === 0 || score === 'E') return 0;
    if (typeof score === 'number') return score;
    if (typeof score === 'string') {
      if (score.startsWith('+')) return parseInt(score.substring(1));
      if (score.startsWith('-')) return parseInt(score);
      return parseInt(score) || 0;
    }
    return 0;
  };

  // Define all 12 bingo lines (5 rows + 5 columns + 2 diagonals)
  const bingoLines = [
    // Rows (0-4, 5-9, 10-14, 15-19, 20-24)
    [0, 1, 2, 3, 4],     // Row 1
    [5, 6, 7, 8, 9],     // Row 2
    [10, 11, 12, 13, 14], // Row 3
    [15, 16, 17, 18, 19], // Row 4
    [20, 21, 22, 23, 24], // Row 5
    
    // Columns
    [0, 5, 10, 15, 20],  // Column 1
    [1, 6, 11, 16, 21],  // Column 2
    [2, 7, 12, 17, 22],  // Column 3
    [3, 8, 13, 18, 23],  // Column 4
    [4, 9, 14, 19, 24],  // Column 5
    
    // Diagonals
    [0, 6, 12, 18, 24],  // Diagonal top-left to bottom-right
    [4, 8, 12, 16, 20]   // Diagonal top-right to bottom-left
  ];

  const lineScores = [];

  bingoLines.forEach((line, index) => {
    const scores = line.map(index => getPlayerScoreAsNumber(boardContent[index]));
    
    // Skip lines with any null scores (empty squares)
    if (scores.some(score => score === null)) {
      return;
    }
    
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    lineScores.push({
      lineIndex: index,
      indices: line,
      scores: scores,
      totalScore: totalScore
    });
  });

  // Find the best (lowest) line score
  if (lineScores.length === 0) return null;
  
  const bestLine = lineScores.reduce((best, current) => 
    current.totalScore < best.totalScore ? current : best
  );

  return bestLine;
};

export default function Leaderboard({ onSelectUser, viewedUsername, viewedBoard, onBack, onBackToMyBoard }) {
  const [usernames, setUsernames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userBoards, setUserBoards] = useState({});
  const [bestScores, setBestScores] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch usernames
        const res = await api.get('/api/boards');
        const usernamesList = res.data.usernames || [];
        setUsernames(usernamesList);

        // Fetch leaderboard data
        const leaderboard = await golfApi.getCurrentLeaderboard();
        setLeaderboardData(leaderboard);

        // Fetch each user's board
        const boards = {};
        for (const username of usernamesList) {
          try {
            const boardRes = await api.get(`/api/boards/${username}`);
            boards[username] = boardRes.data.board;
          } catch (err) {
            console.log(`Could not fetch board for ${username}`);
          }
        }
        setUserBoards(boards);

        // Calculate best scores for each board
        const scores = {};
        Object.keys(boards).forEach(username => {
          const board = boards[username];
          if (board && board.boardContent) {
            const bestLine = calculateBingoLines(board.boardContent, leaderboard);
            scores[username] = bestLine;
          }
        });
        setBestScores(scores);

      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setUsernames([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (viewedUsername) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)', padding: '2rem' }}>
        <button
          onClick={onBack}
          style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 1000, marginBottom: '1rem', background: '#FFD600', color: '#0d47a1', fontWeight: 'bold', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.5rem', cursor: 'pointer' }}
        >
          Back
        </button>
        {viewedBoard ? <Board username={viewedUsername} boardData={viewedBoard} readOnly /> : <div>Loading...</div>}
      </div>
    );
  }

  // Find the golfer with the lowest score in the tournament
  const lowestScoringGolfer = leaderboardData.length > 0 ? leaderboardData.reduce((lowest, current) => {
    const currentScore = typeof current.total_score === 'number' ? current.total_score : 0;
    const lowestScore = typeof lowest.total_score === 'number' ? lowest.total_score : 0;
    return currentScore < lowestScore ? current : lowest;
  }) : null;

  // Check which users have the lowest scoring golfer
  const usersWithLowestGolfer = new Set();
  if (lowestScoringGolfer) {
    Object.keys(userBoards).forEach(username => {
      const board = userBoards[username];
      if (board && board.boardContent) {
        const hasLowestGolfer = board.boardContent.some(square => 
          square && square.name && square.name.toLowerCase() === lowestScoringGolfer.name.toLowerCase()
        );
        if (hasLowestGolfer) {
          usersWithLowestGolfer.add(username);
        }
      }
    });
  }

  // Sort usernames by their best score (lowest first)
  const sortedUsernames = [...usernames].sort((a, b) => {
    const scoreA = bestScores[a]?.totalScore ?? Infinity;
    const scoreB = bestScores[b]?.totalScore ?? Infinity;
    return scoreA - scoreB;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)', padding: '2rem', position: 'relative' }}>
      <button
        onClick={onBackToMyBoard}
        style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 1000, marginBottom: '1rem', background: '#FFD600', color: '#0d47a1', fontWeight: 'bold', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.5rem', cursor: 'pointer' }}
      >
        Back to My Board
      </button>
      <h2 style={{ color: '#FFD600', fontWeight: 'bold', fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center', width: '100%', marginTop: '0.5rem' }}>Leaderboard</h2>
      {loading ? (
        <div style={{ color: 'white', textAlign: 'center', fontSize: '1.2rem' }}>Loading...</div>
      ) : sortedUsernames.length === 0 ? (
        <div style={{ color: 'white', textAlign: 'center', fontSize: '1.2rem' }}>No users yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sortedUsernames.map((username, index) => {
            const bestScore = bestScores[username];
            const hasValidScore = bestScore && bestScore.totalScore !== undefined;
            
            return (
              <li key={username} style={{ marginBottom: '1rem' }}>
                <button
                  onClick={() => onSelectUser(username)}
                  style={{
                    background: '#FFD600',
                    color: '#0d47a1',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    border: 'none',
                    borderRadius: '1rem',
                    padding: '0.5rem 1.5rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      color: index === 0 ? '#FF8C00' : '#0d47a1',
                      minWidth: '2rem',
                      display: 'block',
                      ...(index === 0 && {
                        background: '#FF8C00',
                        color: 'white',
                        borderRadius: '50%',
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      })
                    }}>
                      {index + 1}
                    </span>
                    <span>
                      {usersWithLowestGolfer.has(username) && '🏆 '}
                      {username}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 'bold',
                    color: '#0d47a1'
                  }}>
                    {hasValidScore ? `Best Lineup: ${bestScore.totalScore}` : 'No complete lines'}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
} 