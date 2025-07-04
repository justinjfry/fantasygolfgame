import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Leaderboard({ onSelectUser }) {
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

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', minWidth: 300 }}>
      <h2 style={{ color: '#0d47a1', fontWeight: 'bold', fontSize: '2rem', marginBottom: '1rem' }}>Leaderboard</h2>
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