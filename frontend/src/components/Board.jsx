import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const Board = forwardRef(function Board({ username, onBack }, ref) {
  const [selectedSquares, setSelectedSquares] = useState(new Set());
  const [boardContent, setBoardContent] = useState(Array(25).fill('Select Golfer'));
  const [draggedGolfer, setDraggedGolfer] = useState(null);
  const [usedGolfers, setUsedGolfers] = useState(new Set());

  const golfers = [
    { name: 'Robert Macintyre', salary: 10300 },
    { name: 'Ben Griffin', salary: 9700 },
    { name: 'Nick Dunlap', salary: 7000 },
    { name: 'Joe Highsmith', salary: 7100 },
    { name: 'Christiaan Bezuidenhout', salary: 7600 },
    { name: 'Viktor Hovland', salary: 11000 },
    { name: 'Sam Stevens', salary: 7600 },
    { name: 'Rickie Fowler', salary: 8400 },
    { name: 'Ryan Gerard', salary: 7700 },
    { name: 'Harris English', salary: 9000 },
    { name: 'Matt Fitzpatrick', salary: 8600 },
    { name: 'Tommy Fleetwood', salary: 10800 },
    { name: 'Ryan Fox', salary: 8300 },
    { name: 'Eric Cole', salary: 7300 },
    { name: 'Adam Scott', salary: 9100 },
    { name: 'Min Woo Lee', salary: 8400 },
    { name: 'Brian Harman', salary: 8700 },
    { name: 'Taylor Pendrith', salary: 9200 },
    { name: 'Thomas Detry', salary: 8000 },
    { name: 'Matti Schmid', salary: 7400 },
    { name: 'Adam Hadwin', salary: 7100 },
    { name: 'Tony Finau', salary: 8900 },
    { name: 'Mackenzie Hughes', salary: 8600 },
    { name: 'Keegan Bradley', salary: 10700 },
    { name: 'Rory McIlroy', salary: 12000 },
    { name: 'Justin Thomas', salary: 11200 },
    { name: 'Denny McCarthy', salary: 8500 },
    { name: 'Michael Kim', salary: 7700 },
    { name: 'Lucas Glover', salary: 7500 },
    { name: 'Andrew Novak', salary: 8200 },
    { name: 'Stephan Jaeger', salary: 7500 },
    { name: 'Cameron Davis', salary: 7200 },
    { name: 'Patrick Cantlay', salary: 11400 },
    { name: 'Tom Hoge', salary: 7900 },
    { name: 'Si Woo Kim', salary: 9300 },
    { name: 'Shane Lowry', salary: 9900 },
    { name: 'Alex Noren', salary: 7800 },
    { name: 'Sungjae Im', salary: 9000 },
    { name: 'Davis Thompson', salary: 8100 },
    { name: 'J.J. Spaun', salary: 10100 },
    { name: 'Matthieu Pavon', salary: 7200 },
    { name: 'Xander Schauffele', salary: 11800 },
    { name: 'J.T. Poston', salary: 8800 },
    { name: 'Jordan Spieth', salary: 10000 },
    { name: 'Jason Day', salary: 8800 },
    { name: 'Gary Woodland', salary: 7500 },
    { name: 'Scottie Scheffler', salary: 13600 },
    { name: 'Russell Henley', salary: 10600 },
    { name: 'Collin Morikawa', salary: 11600 },
    { name: 'Max Homa', salary: 7700 },
    { name: 'Nick Taylor', salary: 8000 },
    { name: 'Akshay Bhatia', salary: 8900 },
    { name: 'Brian Campbell', salary: 7000 },
    { name: 'Kevin Yu', salary: 7800 },
    { name: 'Corey Conners', salary: 10400 },
    { name: 'Maverick McNealy', salary: 9400 },
    { name: 'Harry Hall', salary: 8100 },
    { name: 'Austin Eckroat', salary: 7300 },
    { name: 'Ludvig Aberg', salary: 11500 },
    { name: 'Bud Cauley', salary: 8200 },
    { name: 'Daniel Berger', salary: 9600 },
    { name: 'Hideki Matsuyama', salary: 9500 },
    { name: 'Sam Burns', salary: 10500 },
    { name: 'Byeong Hun An', salary: 7600 },
    { name: 'Jhonattan Vegas', salary: 7500 },
    { name: 'Jacob Bridgeman', salary: 7400 },
    { name: 'Tom Kim', salary: 7900 },
    { name: 'Cameron Young', salary: 10200 },
    { name: 'Max Greyserman', salary: 8500 },
    { name: 'Luke Clanton', salary: 8700 },
    { name: 'Aaron Rai', salary: 9800 },
    { name: 'Wyndham Clark', salary: 8300 },
    { name: 'Sepp Straka', salary: 10900 },
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

  // Helper to get all bingo lines
  const getBingoLines = () => {
    const lines = [];
    // Rows
    for (let r = 0; r < 5; r++) lines.push(Array.from({ length: 5 }, (_, c) => r * 5 + c));
    // Columns
    for (let c = 0; c < 5; c++) lines.push(Array.from({ length: 5 }, (_, r) => r * 5 + c));
    // Diagonals
    lines.push([0, 6, 12, 18, 24]);
    lines.push([4, 8, 12, 16, 20]);
    return lines;
  };
  const bingoLines = getBingoLines();

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (!draggedGolfer || usedGolfers.has(draggedGolfer.name)) return;

    // Only apply the rule to green squares
    const isGreen = [12, 0, 4, 20, 24, 6, 8, 16, 18].includes(index);
    if (isGreen) {
      // Find all lines that would be completed by this drop
      const linesWithThisSquare = bingoLines.filter(line => line.includes(index));
      for (const line of linesWithThisSquare) {
        // If this drop would complete the line (all other squares filled)
        const otherSquares = line.filter(idx => idx !== index);
        const allOthersFilled = otherSquares.every(idx => boardContent[idx] && boardContent[idx].name);
        if (allOthersFilled) {
          // Calculate avg remaining salary for green squares
          const filledGreenSalaries = greenIndices
            .map(idx => boardContent[idx])
            .filter(golfer => golfer && golfer.name)
            .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
          const openGreenCount = greenIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;
          const avgGreenSalary = openGreenCount > 0 ? (90000 - filledGreenSalaries) / openGreenCount : 0;
          if (draggedGolfer.salary > avgGreenSalary) {
            alert('You can only complete a line if the last golfer is at or under the avg remaining salary!');
            return;
          }
        }
      }
    }

    // Only apply the rule to white squares
    const isWhite = !isGreen;
    if (isWhite) {
      // If this is the last open white square
      const openWhiteCount = whiteIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;
      if (openWhiteCount === 1 && (!boardContent[index] || !boardContent[index].name)) {
        const filledWhiteSalaries = whiteIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const avgWhiteSalary = (160000 - filledWhiteSalaries) / 1;
        if (draggedGolfer.salary > avgWhiteSalary) {
          alert('You can only fill the last white square if the golfer is at or under the avg remaining salary!');
          return;
        }
      }
    }

    const newBoardContent = [...boardContent];
    const previousGolfer = newBoardContent[index];
    if (previousGolfer && previousGolfer.name) {
      const newUsedGolfers = new Set(usedGolfers);
      newUsedGolfers.delete(previousGolfer.name);
      setUsedGolfers(newUsedGolfers);
    }
    newBoardContent[index] = draggedGolfer;
    setBoardContent(newBoardContent);
    setUsedGolfers(new Set([...usedGolfers, draggedGolfer.name]));
    setDraggedGolfer(null);
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
    if (currentContent && currentContent.name) {
      const newUsedGolfers = new Set(usedGolfers);
      newUsedGolfers.delete(currentContent.name);
      setUsedGolfers(newUsedGolfers);
    }
    // Clear the square content
    const newBoardContent = [...boardContent];
    newBoardContent[index] = null;
    setBoardContent(newBoardContent);
    // Also deselect the square if it was selected
    const newSelected = new Set(selectedSquares);
    newSelected.delete(index);
    setSelectedSquares(newSelected);
  };

  // Sort golfers by salary descending
  const sortedGolfers = [...golfers].sort((a, b) => b.salary - a.salary);

  // Helper to format salary
  const formatSalary = (salary) => `$${salary.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  // Indices of all green squares
  const greenIndices = [12, 0, 4, 20, 24, 6, 8, 16, 18];
  // Indices of all white squares
  const allIndices = Array.from({ length: 25 }, (_, i) => i);
  const whiteIndices = allIndices.filter(idx => !greenIndices.includes(idx));

  // Calculate total salary of filled green squares
  const filledGreenSalaries = greenIndices
    .map(idx => boardContent[idx])
    .filter(golfer => golfer && golfer.name)
    .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);

  // Count open green squares
  const openGreenCount = greenIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;

  // Calculate avg remaining salary for green squares
  const avgGreenSalary = openGreenCount > 0 ? (90000 - filledGreenSalaries) / openGreenCount : 0;

  // Calculate total salary of filled white squares
  const filledWhiteSalaries = whiteIndices
    .map(idx => boardContent[idx])
    .filter(golfer => golfer && golfer.name)
    .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);

  // Count open white squares
  const openWhiteCount = whiteIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;

  // Calculate avg remaining salary for white squares
  const avgWhiteSalary = openWhiteCount > 0 ? (160000 - filledWhiteSalaries) / openWhiteCount : 0;

  const renderSquare = (index, golferObj) => {
    const isSelected = selectedSquares.has(index);
    
    // Determine square color based on position
    let backgroundColor = 'white';
    let isGreen = false;
    if (isSelected) {
      backgroundColor = '#FFD600'; // Yellow when selected
    } else {
      if (index === 12) { backgroundColor = '#43A047'; isGreen = true; }
      else if ([0, 4, 20, 24].includes(index)) { backgroundColor = '#43A047'; isGreen = true; }
      else if ([6, 8, 16, 18].includes(index)) { backgroundColor = '#43A047'; isGreen = true; }
    }
    const isWhite = !isGreen;
    
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
          flexDirection: 'column',
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
        {golferObj && golferObj.name ? (
          <>
            <span>{golferObj.name}</span>
            <span style={{ fontSize: '0.85em', color: '#333', fontWeight: 'bold' }}>{formatSalary(golferObj.salary)}</span>
          </>
        ) : (
          isGreen ? (
            <>
              <span style={{ fontSize: '0.75em', color: '#0d47a1', fontWeight: 'bold' }}>avg remaining salary</span>
              <span style={{ fontSize: '1em', color: '#0d47a1', fontWeight: 'bold' }}>{formatSalary(avgGreenSalary)}</span>
            </>
          ) : isWhite ? (
            <>
              <span style={{ fontSize: '0.75em', color: '#0d47a1', fontWeight: 'bold' }}>avg remaining salary</span>
              <span style={{ fontSize: '1em', color: '#0d47a1', fontWeight: 'bold' }}>{formatSalary(avgWhiteSalary)}</span>
            </>
          ) : (isSelected ? 'Select Golfer' : '')
        )}
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
            {sortedGolfers.map((golfer, index) => {
              const isUsed = usedGolfers.has(golfer.name);
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
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
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
                  <span>{golfer.name}</span>
                  <span style={{ fontSize: '0.95em', color: '#333', fontWeight: 'bold' }}>{formatSalary(golfer.salary)}</span>
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