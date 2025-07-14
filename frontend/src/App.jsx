import React, { useState, useRef, useCallback, useEffect } from 'react';
import Board from './components/Board';
import api from './api';
import Leaderboard from './components/Leaderboard';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'board', 'leaderboard', 'viewBoard'
  const [viewedBoard, setViewedBoard] = useState(null);
  const [viewedUsername, setViewedUsername] = useState('');
  const boardRef = useRef();
  const [userBoardData, setUserBoardData] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [boardsLocked, setBoardsLocked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegister) {
        const res = await api.post('/api/register', { username, password });
        if (res.data.success) {
          // Wait briefly before logging in
          setTimeout(async () => {
            const loginRes = await api.post('/api/login', { username, password });
            if (loginRes.data.success) {
              setSubmitted(true);
              setCurrentPage('board');
            } else {
              setAuthError('Registration succeeded but login failed.');
            }
          }, 200);
        }
      } else {
        const res = await api.post('/api/login', { username, password });
        if (res.data.success) {
          setSubmitted(true);
          setCurrentPage('board');
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setAuthError('Invalid username or password.');
      } else if (err.response && err.response.status === 409) {
        setAuthError('Username already exists.');
      } else {
        setAuthError('Authentication failed.');
      }
    }
  };

  const handleHomeClick = () => {
    if (boardRef.current && boardRef.current.saveBoardState) {
      boardRef.current.saveBoardState();
    }
    setCurrentPage('login');
    setPassword('');
  };

  const handleMyBoard = () => {
    setCurrentPage('board');
  };

  const handleBackToLogin = () => {
    if (boardRef.current && boardRef.current.saveBoardState) {
      boardRef.current.saveBoardState();
    }
    setCurrentPage('login');
  };



  // Save board to backend (uses session authentication)
  const handleBoardSave = useCallback(async (boardContent) => {
    try {
      const res = await api.post('/api/boards', { board: boardContent });
      // Optionally handle save status
    } catch (err) {
      if (err.response && err.response.status === 423) {
        // Boards are locked
        alert('Boards are currently locked! Tournament has started.');
      } else {
        console.error('Save error:', err);
      }
    }
  }, []);



  // Load current user's board from backend (uses session authentication)
  const loadMyBoardFromBackend = async () => {
    try {
      const res = await api.get('/api/boards/my');
      return res.data.board;
    } catch (err) {
      return null;
    }
  };

  // Load any user's board from backend (public read-only access)
  const loadBoardFromBackend = async (user) => {
    try {
      const res = await api.get(`/api/boards/${user}`);
      return res.data.board;
    } catch (err) {
      return null;
    }
  };

  // Handle viewing another user's board
  const handleSelectUser = async (user) => {
    setViewedUsername(user);
    setViewedBoard(null);
    setCurrentPage('leaderboard');
    const board = await loadBoardFromBackend(user);
    setViewedBoard(board);
  };

  // Load the user's board from backend when currentPage changes to 'board'
  useEffect(() => {
    const fetchBoard = async () => {
      if (currentPage === 'board') {
        const board = await loadMyBoardFromBackend();
        if (board) {
          setUserBoardData(board);
        } else {
          // Initialize a fresh board for new users
          setUserBoardData({
            boardContent: Array(25).fill('Select Golfer'),
            selectedSquares: [],
            usedGolfers: [],
            lastSaved: null
          });
        }
      }
    };
    fetchBoard();
    // eslint-disable-next-line
  }, [currentPage]);

  // Dedicated function to go to the user's own board
  const goToMyBoard = () => {
    setViewedUsername('');
    setViewedBoard(null);
    setCurrentPage('board');
  };

  // Add a logout handler
  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUsername('');
    setPassword('');
    setSubmitted(false);
    setCurrentPage('login');
    setUserBoardData(null); // Clear board state on logout
  };

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/api/auth/check');
        if (res.data.authenticated) {
          setUsername(res.data.username);
          setSubmitted(true);
          setCurrentPage('board');
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
    
    // Check if boards are locked
    const checkLockStatus = async () => {
      try {
        const res = await api.get('/api/boards/lock-status');
        setBoardsLocked(res.data.locked);
      } catch (err) {
        console.error('Error checking lock status:', err);
      }
    };
    checkLockStatus();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)',
      }}>
        <div style={{ color: '#FFD600', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Loading...
        </div>
      </div>
    );
  }

  // If we're on the board page, render the Board component
  if (currentPage === 'board') {
    console.log('=== RENDERING BOARD ===');
    console.log('Current username:', username);
    console.log('Username type:', typeof username);
    return <Board
      key={username} // Force remount on user change
      ref={boardRef}
      username={username}
      onBack={handleBackToLogin}
      onSave={handleBoardSave}
      loadBoard={loadBoardFromBackend}
      onLeaderboardNav={() => setCurrentPage('leaderboard')}
      boardData={userBoardData}
      boardsLocked={boardsLocked}
    />;
  }
  if (currentPage === 'leaderboard') {
    return (
      <Leaderboard
        onSelectUser={handleSelectUser}
        viewedUsername={viewedUsername}
        viewedBoard={viewedBoard}
        onBack={() => {
          setViewedUsername('');
          setViewedBoard(null);
        }}
        onBackToMyBoard={() => {
          setViewedUsername('');
          setViewedBoard(null);
          setCurrentPage('board');
        }}
      />
    );
  }
  if (currentPage === 'viewBoard') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)', padding: '2rem' }}>
        <button onClick={() => setCurrentPage('leaderboard')} style={{ marginBottom: '1rem', background: '#FFD600', color: '#0d47a1', fontWeight: 'bold', border: 'none', borderRadius: '1rem', padding: '0.5rem 1.5rem', cursor: 'pointer' }}>Back to Leaderboard</button>
        <h2 style={{ color: '#FFD600', fontWeight: 'bold', fontSize: '2rem', marginBottom: '1rem' }}>{viewedUsername}'s Board</h2>
        {viewedBoard ? <Board username={viewedUsername} boardData={viewedBoard} readOnly /> : <div>Loading...</div>}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)',
        paddingTop: '10vh',
        position: 'relative',
      }}
    >
      {/* Home Button */}
      <button
        onClick={handleHomeClick}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          background: '#FFD600',
          color: '#0d47a1',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          padding: '0.5rem 1.5rem',
          borderRadius: '1.5rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseOver={e => {
          e.target.style.background = '#fff';
          e.target.style.color = '#0d47a1';
        }}
        onMouseOut={e => {
          e.target.style.background = '#FFD600';
          e.target.style.color = '#0d47a1';
        }}
      >
        Home
      </button>
      {/* Log Out Button */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: '#FFD600',
          color: '#0d47a1',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          padding: '0.5rem 1.5rem',
          borderRadius: '1.5rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseOver={e => {
          e.target.style.background = '#fff';
          e.target.style.color = '#0d47a1';
        }}
        onMouseOut={e => {
          e.target.style.background = '#FFD600';
          e.target.style.color = '#0d47a1';
        }}
      >
        Log Out
      </button>
      
      <h1
        style={{
          color: '#FFD600',
          fontSize: '4rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 8px #000',
          letterSpacing: '2px',
          marginBottom: '2.7rem',
        }}
      >
        British Open Golf
      </h1>
      <div
        style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 24px rgba(33,150,243,0.15)',
          padding: '2.5rem 2rem',
          minWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '0.7rem',
        }}
      >
        {submitted ? (
          <>
            <div style={{ color: '#0d47a1', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '2rem' }}>
              Welcome back, {username}! You're logged in.
            </div>
            <button
              onClick={handleMyBoard}
              style={{
                background: '#FFD600',
                color: '#0d47a1',
                fontWeight: 'bold',
                fontSize: '1.3rem',
                padding: '0.75rem 2.5rem',
                borderRadius: '2rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              My Board
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="username" style={{ color: '#0d47a1', fontWeight: 'bold', fontSize: '1.1rem' }}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #2196f3',
                  fontSize: '1.1rem',
                  outline: 'none',
                }}
                placeholder="Enter your username"
              />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="password" style={{ color: '#0d47a1', fontWeight: 'bold', fontSize: '1.1rem' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #2196f3',
                  fontSize: '1.1rem',
                  outline: 'none',
                }}
                placeholder="Create a password"
              />
            </div>
            {authError && (
              <div style={{ color: authError.includes('successful') ? 'green' : 'red', fontWeight: 'bold', marginBottom: '1rem' }}>{authError}</div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                background: '#FFD600',
                color: '#0d47a1',
                fontWeight: 'bold',
                fontSize: '1.3rem',
                padding: '0.75rem',
                borderRadius: '2rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseOver={e => {
                e.target.style.background = '#fff';
                e.target.style.color = '#0d47a1';
              }}
              onMouseOut={e => {
                e.target.style.background = '#FFD600';
                e.target.style.color = '#0d47a1';
              }}
            >
              {isRegister ? 'Sign Up' : 'Sign In'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.7rem' }}>
              {isRegister ? (
                <button type="button" onClick={() => setIsRegister(false)} style={{ background: 'none', border: 'none', color: '#0d47a1', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem' }}>
                  Already have an account? Sign In
                </button>
              ) : (
                <button type="button" onClick={() => setIsRegister(true)} style={{ background: 'none', border: 'none', color: '#0d47a1', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem' }}>
                  New user? Sign Up
                </button>
              )}
            </div>
          </form>
        )}
      </div>
      
      
    </div>
  );
}
