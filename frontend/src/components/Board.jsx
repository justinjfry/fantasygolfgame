import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const Board = forwardRef(function Board({ username, onBack }, ref) {
  const [selectedSquares, setSelectedSquares] = useState(new Set());
  const [boardContent, setBoardContent] = useState(Array(25).fill('Select Golfer'));
  const [draggedGolfer, setDraggedGolfer] = useState(null);
  const [usedGolfers, setUsedGolfers] = useState(new Set());

  const golfers = [
    'Tiger Woods',
    'Rory McIlroy',
    'Jon Rahm',
    'Scottie Scheffler',
    'Viktor Hovland',
    'Xander Schauffele',
    'Patrick Cantlay',
    'Collin Morikawa',
    'Justin Thomas',
    'Jordan Spieth',
    'Dustin Johnson',
    'Brooks Koepka',
    'Bryson DeChambeau',
    'Hideki Matsuyama',
    'Sungjae Im',
    'Tommy Fleetwood',
    'Shane Lowry',
    'Justin Rose',
    'Adam Scott',
    'Louis Oosthuizen'
  ];

  // Explicit load/save functions
  const loadBoardState = () => {
    if (!username) return;
    const savedState = localStorage.getItem(`board_${username}`);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setBoardContent(parsedState.boardContent || Array(25).fill('Select Golfer'));
        setSelectedSquares(new Set(parsedState.selectedSquares || []));
        setUsedGolfers(new Set(parsedState.usedGolfers || []));
      } catch (error) {
        console.error('Error loading saved board state:', error);
      }
    }
  };

  const saveBoardState = () => {
    if (!username) return;
    const stateToSave = {
      boardContent,
      selectedSquares: Array.from(selectedSquares),
      usedGolfers: Array.from(usedGolfers),
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(`board_${username}`, JSON.stringify(stateToSave));
    console.log('Manually saved board for', username, stateToSave);
  };

  // Expose saveBoardState to parent via ref
  useImperativeHandle(ref, () => ({
    saveBoardState
  }));

  // Load board state when component mounts
  useEffect(() => {
    loadBoardState();
    // eslint-disable-next-line
  }, [username]);

  const handleDragStart = (e, golfer) => {
    // Only allow dragging if golfer hasn't been used yet
    if (!usedGolfers.has(golfer)) {
      setDraggedGolfer(golfer);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedGolfer && !usedGolfers.has(draggedGolfer)) {
      const newBoardContent = [...boardContent];
      const previousGolfer = newBoardContent[index];
      
      // Remove previous golfer from used list if it was a real golfer
      if (previousGolfer !== 'Select Golfer') {
        const newUsedGolfers = new Set(usedGolfers);
        newUsedGolfers.delete(previousGolfer);
        setUsedGolfers(newUsedGolfers);
      }
      
      // Add new golfer to board and used list
      newBoardContent[index] = draggedGolfer;
      setBoardContent(newBoardContent);
      setUsedGolfers(new Set([...usedGolfers, draggedGolfer]));
      setDraggedGolfer(null);
    }
  };

  const handleSquareClick = (index) => {
    const newSelected = new Set(selectedSquares);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSquares(newSelected);
  };

  const handleSquareClear = (index) => {
    const currentContent = boardContent[index];
    
    // If there's a golfer in this square, remove them from used list
    if (currentContent !== 'Select Golfer') {
      const newUsedGolfers = new Set(usedGolfers);
      newUsedGolfers.delete(currentContent);
      setUsedGolfers(newUsedGolfers);
    }
    
    // Clear the square content
    const newBoardContent = [...boardContent];
    newBoardContent[index] = 'Select Golfer';
    setBoardContent(newBoardContent);
    
    // Also deselect the square if it was selected
    const newSelected = new Set(selectedSquares);
    newSelected.delete(index);
    setSelectedSquares(newSelected);
  };

  const renderSquare = (index, content) => {
    const isSelected = selectedSquares.has(index);
    
    // Determine square color based on position
    let backgroundColor = 'white';
    if (isSelected) {
      backgroundColor = '#FFD600'; // Yellow when selected
    } else {
      // Center square (index 12 in 5x5 grid)
      if (index === 12) {
        backgroundColor = '#2E7D32'; // Dark green
      }
      // Corner squares (0, 4, 20, 24)
      else if ([0, 4, 20, 24].includes(index)) {
        backgroundColor = '#388E3C'; // Slightly darker green
      }
      // Middle diagonal squares (6, 8, 16, 18)
      else if ([6, 8, 16, 18].includes(index)) {
        backgroundColor = '#81C784'; // Even lighter green
      }
    }
    
    return (
      <div
        key={index}
        onClick={() => handleSquareClick(index)}
        onDoubleClick={() => handleSquareClear(index)}
        onContextMenu={(e) => {
          e.preventDefault();
          handleSquareClear(index);
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        style={{
          width: '80px',
          height: '80px',
          border: '3px solid #0d47a1',
          backgroundColor: backgroundColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          color: isSelected ? '#0d47a1' : '#333',
          transition: 'all 0.2s ease',
          borderRadius: '8px',
          textAlign: 'center',
          padding: '4px',
          position: 'relative',
        }}
        title="Left click to select, Right click or Double click to clear"
      >
        {content !== 'Select Golfer' ? content : (isSelected ? content : '')}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#FFD600', fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {username}'s Board
        </h1>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
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
        }}
      >
        Back
      </button>

      {/* Main Content Container */}
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
        {/* Bingo Board */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 80px)',
            gridTemplateRows: 'repeat(5, 80px)',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          {boardContent.map((content, index) => renderSquare(index, content))}
        </div>

        {/* Golfer List */}
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '15px',
            padding: '1.5rem',
            minWidth: '200px',
            boxShadow: '0 4px 24px rgba(33,150,243,0.15)',
            position: 'absolute',
            right: '15%',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <h3 style={{ color: '#0d47a1', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
            Available Golfers
          </h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {golfers.map((golfer, index) => {
              const isUsed = usedGolfers.has(golfer);
              return (
                <div
                  key={index}
                  draggable={!isUsed}
                  onDragStart={(e) => handleDragStart(e, golfer)}
                  style={{
                    background: isUsed ? '#e0e0e0' : '#f8f9fa',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    cursor: isUsed ? 'not-allowed' : 'grab',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: isUsed ? '#999' : '#0d47a1',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    opacity: isUsed ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!isUsed) {
                      e.target.style.background = '#e3f2fd';
                      e.target.style.borderColor = '#2196f3';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isUsed) {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.borderColor = '#e9ecef';
                    }
                  }}
                >
                  {golfer}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'white', fontSize: '1.1rem' }}>
          Filled: {boardContent.filter(name => name !== 'Select Golfer').length} / 25 squares
        </p>
      </div>
    </div>
  );
});

export default Board; 