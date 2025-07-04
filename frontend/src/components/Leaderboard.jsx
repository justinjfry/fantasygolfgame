import React, { useEffect, useState } from 'react';
import api from '../api';
import Board from './Board';

export default function Leaderboard({ onSelectUser, viewedUsername, viewedBoard, onBack, onBackToMyBoard }) {
  const [usernames, setUsernames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsernames() {
      try {
        const res = await api.get('/api/boards');
        setUsernames(res.data.usernames || []);
      } catch (err) {
        setUsernames([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsernames();
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
        <div>Loading...</div>
      ) : usernames.length === 0 ? (
        <div>No users yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {usernames.map(username => (
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
                }}
              >
                {username}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 