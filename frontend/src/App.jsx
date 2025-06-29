import React, { useState, useRef } from 'react';
import Board from './components/Board';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'board'
  const boardRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send the username and password to your backend
    setSubmitted(true);
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

  // If we're on the board page, render the Board component
  if (currentPage === 'board') {
    console.log('=== RENDERING BOARD ===');
    console.log('Current username:', username);
    console.log('Username type:', typeof username);
    return <Board ref={boardRef} username={username} onBack={handleBackToLogin} />;
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
              Join Now
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
