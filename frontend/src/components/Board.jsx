import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const Board = forwardRef(function Board({ username, onBack, onLeaderboardClick, onSave, readOnly = false, boardData }, ref) {
  const [selectedSquares, setSelectedSquares] = useState(new Set());
  const [boardContent, setBoardContent] = useState(Array(25).fill('Select Golfer'));
  const [draggedGolfer, setDraggedGolfer] = useState(null);
  const [usedGolfers, setUsedGolfers] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const autoSaveTimeout = useRef();
  const saveStatusTimeout = useRef();

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

  // On mount, initialize board from boardData if provided
  useEffect(() => {
    if (boardData) {
      setBoardContent(boardData.boardContent || Array(25).fill('Select Golfer'));
      setSelectedSquares(new Set(boardData.selectedSquares || []));
      setUsedGolfers(new Set(boardData.usedGolfers || []));
    }
  }, [boardData]);

  // Debounced auto-save effect (backend only)
  useEffect(() => {
    if (readOnly || !username || typeof onSave !== 'function') return;
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    setIsSaving(true);
    setSaveStatus('saving');
    autoSaveTimeout.current = setTimeout(async () => {
      await onSave({
        boardContent,
        selectedSquares: Array.from(selectedSquares),
        usedGolfers: Array.from(usedGolfers),
        lastSaved: new Date().toISOString()
      });
      setIsSaving(false);
      setSaveStatus('saved');
      if (saveStatusTimeout.current) clearTimeout(saveStatusTimeout.current);
      saveStatusTimeout.current = setTimeout(() => setSaveStatus(null), 1500);
    }, 1000);
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
      if (saveStatusTimeout.current) clearTimeout(saveStatusTimeout.current);
    };
    // eslint-disable-next-line
  }, [boardContent, selectedSquares, usedGolfers, username, onSave, readOnly]);

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

    // Check if this is an orange square
    const isOrange = [0, 4, 20, 24].includes(index);
    // Check if this is a green square (excluding orange squares)
    const isGreen = [12, 6, 8, 16, 18].includes(index);
    // Check if this is a baby blue square
    const isBabyBlue = [2, 7, 17, 22].includes(index);
    // Check if this is a light magenta square
    const isLightMagenta = [10, 11, 13, 14].includes(index);
    // Check if this is a white square
    const isWhite = !isOrange && !isGreen && !isBabyBlue && !isLightMagenta;

    // Check if this drop would complete any line
    const linesWithThisSquare = bingoLines.filter(line => line.includes(index));
    let wouldCompleteLine = false;
    
    for (const line of linesWithThisSquare) {
      // If this drop would complete the line (all other squares filled)
      const otherSquares = line.filter(idx => idx !== index);
      const allOthersFilled = otherSquares.every(idx => boardContent[idx] && boardContent[idx].name);
      if (allOthersFilled) {
        wouldCompleteLine = true;
        break;
      }
    }

    // If this drop would complete a line, check salary constraints
    if (wouldCompleteLine) {
      if (isOrange) {
        // Calculate avg remaining salary for orange squares
        const filledOrangeSalaries = orangeIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const openOrangeCount = orangeIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;
        const avgOrangeSalary = openOrangeCount > 0 ? (40000 - filledOrangeSalaries) / openOrangeCount : 0;
        if (draggedGolfer.salary > avgOrangeSalary) {
          alert('You can only complete a line if the last golfer is at or under the avg remaining salary for orange squares!');
          return;
        }
      } else if (isGreen) {
        // Calculate avg remaining salary for green squares
        const filledGreenSalaries = greenIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const openGreenCount = greenIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;
        const avgGreenSalary = openGreenCount > 0 ? (50000 - filledGreenSalaries) / openGreenCount : 0;
        if (draggedGolfer.salary > avgGreenSalary) {
          alert('You can only complete a line if the last golfer is at or under the avg remaining salary for green squares!');
          return;
        }
      } else if (isBabyBlue) {
        // Calculate avg remaining salary for baby blue squares
        const filledBabyBlueSalaries = babyBlueIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const openBabyBlueCount = babyBlueIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;
        const avgBabyBlueSalary = openBabyBlueCount > 0 ? (40000 - filledBabyBlueSalaries) / openBabyBlueCount : 0;
        if (draggedGolfer.salary > avgBabyBlueSalary) {
          alert('You can only complete a line if the last golfer is at or under the avg remaining salary for baby blue squares!');
          return;
        }
      } else if (isLightMagenta) {
        // Calculate avg remaining salary for light magenta squares
        const filledLightMagentaSalaries = lightMagentaIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const openLightMagentaCount = lightMagentaIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;
        const avgLightMagentaSalary = openLightMagentaCount > 0 ? (40000 - filledLightMagentaSalaries) / openLightMagentaCount : 0;
        if (draggedGolfer.salary > avgLightMagentaSalary) {
          alert('You can only complete a line if the last golfer is at or under the avg remaining salary for light magenta squares!');
          return;
        }
      } else if (isWhite) {
        // Calculate avg remaining salary for white squares
        const filledWhiteSalaries = whiteIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const openWhiteCount = whiteIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;
        const avgWhiteSalary = openWhiteCount > 0 ? (160000 - filledWhiteSalaries) / openWhiteCount : 0;
        if (draggedGolfer.salary > avgWhiteSalary) {
          alert('You can only complete a line if the last golfer is at or under the avg remaining salary for white squares!');
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

  const handleClearBoard = () => {
    if (window.confirm('Are you sure you want to clear the entire board? This will remove all placed golfers.')) {
      // Reset board to initial state
      setBoardContent(Array(25).fill('Select Golfer'));
      setSelectedSquares(new Set());
      setUsedGolfers(new Set());
    }
  };

  // Sort golfers by salary descending
  const sortedGolfers = [...golfers].sort((a, b) => b.salary - a.salary);

  // Helper to format salary
  const formatSalary = (salary) => `$${salary.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  // Indices of orange corner squares (orange squares)
  const orangeIndices = [0, 4, 20, 24];
  
  // Indices of green squares (excluding orange squares)
  const greenIndices = [12, 6, 8, 16, 18];
  
  // Indices of baby blue squares
  const babyBlueIndices = [2, 7, 17, 22];
  
  // Indices of light magenta squares
  const lightMagentaIndices = [10, 11, 13, 14];
  
  // Indices of all white squares
  const allIndices = Array.from({ length: 25 }, (_, i) => i);
  const whiteIndices = allIndices.filter(idx => !greenIndices.includes(idx) && !orangeIndices.includes(idx) && !babyBlueIndices.includes(idx) && !lightMagentaIndices.includes(idx));

  // Calculate total salary of filled orange squares
  const filledOrangeSalaries = orangeIndices
    .map(idx => boardContent[idx])
    .filter(golfer => golfer && golfer.name)
    .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);

  // Count open orange squares
  const openOrangeCount = orangeIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;

  // Calculate avg remaining salary for orange squares
  const avgOrangeSalary = openOrangeCount > 0 ? (40000 - filledOrangeSalaries) / openOrangeCount : 0;

  // Calculate total salary of filled baby blue squares
  const filledBabyBlueSalaries = babyBlueIndices
    .map(idx => boardContent[idx])
    .filter(golfer => golfer && golfer.name)
    .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);

  // Count open baby blue squares
  const openBabyBlueCount = babyBlueIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;

  // Calculate avg remaining salary for baby blue squares
  const avgBabyBlueSalary = openBabyBlueCount > 0 ? (40000 - filledBabyBlueSalaries) / openBabyBlueCount : 0;

  // Calculate total salary of filled light magenta squares
  const filledLightMagentaSalaries = lightMagentaIndices
    .map(idx => boardContent[idx])
    .filter(golfer => golfer && golfer.name)
    .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);

  // Count open light magenta squares
  const openLightMagentaCount = lightMagentaIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;

  // Calculate avg remaining salary for light magenta squares
  const avgLightMagentaSalary = openLightMagentaCount > 0 ? (40000 - filledLightMagentaSalaries) / openLightMagentaCount : 0;

  // Calculate total salary of filled green squares
  const filledGreenSalaries = greenIndices
    .map(idx => boardContent[idx])
    .filter(golfer => golfer && golfer.name)
    .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);

  // Count open green squares
  const openGreenCount = greenIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;

  // Calculate avg remaining salary for green squares
  const avgGreenSalary = openGreenCount > 0 ? (50000 - filledGreenSalaries) / openGreenCount : 0;

  // Calculate total salary of filled white squares
  const filledWhiteSalaries = whiteIndices
    .map(idx => boardContent[idx])
    .filter(golfer => golfer && golfer.name)
    .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);

  // Count open white squares
  const openWhiteCount = whiteIndices.filter(idx => !boardContent[idx] || !boardContent[idx].name).length;

  // Calculate avg remaining salary for white squares
  const avgWhiteSalary = openWhiteCount > 0 ? (80000 - filledWhiteSalaries) / openWhiteCount : 0;

  const isBoardFull = boardContent.filter(content => content && content.name).length === 25;

  const renderSquare = (index, golferObj) => {
    const isSelected = selectedSquares.has(index);
    const isFilled = golferObj && golferObj.name;
    let backgroundColor = 'white';
    let isGreen = false;
    let isOrange = false;
    let isBabyBlue = false;
    let isLightMagenta = false;
    if (isBoardFull) {
      backgroundColor = '#FFD600';
    } else {
      if (index === 12) { backgroundColor = '#66BB6A'; isGreen = true; }
      else if ([0, 4, 20, 24].includes(index)) { backgroundColor = '#FFA726'; isOrange = true; }
      else if ([6, 8, 16, 18].includes(index)) { backgroundColor = '#66BB6A'; isGreen = true; }
      else if ([2, 7, 17, 22].includes(index)) { backgroundColor = '#87CEEB'; isBabyBlue = true; }
      else if ([10, 11, 13, 14].includes(index)) { backgroundColor = '#DDA0DD'; isLightMagenta = true; }
    }
    const isWhite = !isGreen && !isOrange && !isBabyBlue && !isLightMagenta;
    
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
          border: isFilled ? '4px solid #2E7D32' : '3px solid #0d47a1',
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
          boxShadow: isFilled ? '0 4px 12px rgba(46, 125, 50, 0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
          transform: isFilled ? 'scale(1.02)' : 'scale(1)',
        }}
        title="Left click to select, Right click or Double click to clear"
      >
        {golferObj && golferObj.name ? (
          <>
            <div style={{ 
              position: 'absolute', 
              top: '2px', 
              right: '2px', 
              background: '#FFD600', // yellow
              color: '#0d47a1', // dark blue for contrast
              borderRadius: '50%', 
              width: '16px', 
              height: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              ✓
            </div>
            <span style={{ 
              fontSize: '0.75rem', 
              color: '#2E7D32', 
              fontWeight: 'bold',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>{golferObj.name}</span>
            <span style={{ 
              fontSize: '0.8em', 
              color: '#1B5E20', 
              fontWeight: 'bold',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>{formatSalary(golferObj.salary)}</span>
          </>
                  ) : (
            isOrange ? (
              <>
                <span style={{ fontSize: '0.75em', color: '#0d47a1', fontWeight: 'bold' }}>avg remaining salary</span>
                <span style={{ fontSize: '1em', color: '#0d47a1', fontWeight: 'bold' }}>{formatSalary(avgOrangeSalary)}</span>
              </>
            ) : isGreen ? (
              <>
                <span style={{ fontSize: '0.75em', color: '#0d47a1', fontWeight: 'bold' }}>avg remaining salary</span>
                <span style={{ fontSize: '1em', color: '#0d47a1', fontWeight: 'bold' }}>{formatSalary(avgGreenSalary)}</span>
              </>
            ) : isBabyBlue ? (
              <>
                <span style={{ fontSize: '0.75em', color: '#0d47a1', fontWeight: 'bold' }}>avg remaining salary</span>
                <span style={{ fontSize: '1em', color: '#0d47a1', fontWeight: 'bold' }}>{formatSalary(avgBabyBlueSalary)}</span>
              </>
            ) : isLightMagenta ? (
              <>
                <span style={{ fontSize: '0.75em', color: '#0d47a1', fontWeight: 'bold' }}>avg remaining salary</span>
                <span style={{ fontSize: '1em', color: '#0d47a1', fontWeight: 'bold' }}>{formatSalary(avgLightMagentaSalary)}</span>
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
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Fixed-position Rules Box */}
      <div
        style={{
          position: 'fixed',
          top: '120px',
          left: '40px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '15px',
          padding: '1.5rem',
          minWidth: '220px',
          maxWidth: '260px',
          boxShadow: '0 4px 24px rgba(33,150,243,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          zIndex: 10,
        }}
      >
        <h3 style={{ color: '#0d47a1', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Rules
        </h3>
        <ol style={{ color: '#333', fontSize: '1.05rem', paddingLeft: '1.2rem' }}>
          <li style={{ marginBottom: '0.7rem' }}><b>1.</b> Drag players to fill squares on your board.</li>
          <li style={{ marginBottom: '0.7rem' }}><b>2.</b> Stay under salary budget for each color zone.</li>
          <li style={{ marginBottom: '0.7rem' }}><b>3.</b> Fill all 25 spaces to complete your board.</li>
        </ol>
      </div>
      {/* Header with absolutely positioned Leaderboard Button */}
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: '0.25rem' }}>
        <h1 style={{ color: '#FFD600', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'inline-block' }}>
          {username}'s Board
        </h1>
        <button
          onClick={() => typeof onLeaderboardClick === 'function' && onLeaderboardClick()}
          style={{
            position: 'absolute',
            left: 545,
            top: '48%',
            transform: 'translateY(-50%)',
            background: '#FFD600',
            color: '#0d47a1',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: '1rem',
            padding: '0.5rem 1.5rem',
            cursor: 'pointer',
          }}
        >
          Leaderboard
        </button>
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

      {/* Auto-save status indicator with reserved space */}
      <div style={{ height: '1.5em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {saveStatus === 'saving' && (
          <span style={{ color: '#FFD600', fontWeight: 'bold' }}>Saving...</span>
        )}
        {saveStatus === 'saved' && (
          <span style={{ color: '#FFD600', fontWeight: 'bold' }}>Saved!</span>
        )}
      </div>
      {/* Main Content Container */}
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
        {/* Bingo Board */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          {/* Filled Status Text */}
          <div style={{ 
            color: 'white', 
            fontSize: '0.9rem', 
            fontWeight: 'bold',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            Filled: {boardContent.filter(content => content && content.name).length} / 25 squares
          </div>
          
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
          
          {/* Clear Board Button */}
          <button
            onClick={handleClearBoard}
            style={{
              background: '#f44336',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '1rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#d32f2f';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(244, 67, 54, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f44336';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.3)';
            }}
          >
            Clear Board
          </button>
        </div>

        {/* Golfer List */}
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '15px',
            padding: '1.5rem',
            minWidth: '280px',
            boxShadow: '0 4px 24px rgba(33,150,243,0.15)',
            position: 'absolute',
            right: '160px',
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
                    padding: '0.5rem',
                    marginBottom: '0.3rem',
                    cursor: isUsed ? 'not-allowed' : 'grab',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    color: isUsed ? '#999' : '#0d47a1',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    opacity: isUsed ? 0.6 : 1,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
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
                  <span style={{ fontSize: '0.85em', color: '#333', fontWeight: 'bold' }}>{formatSalary(golfer.salary)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>


    </div>
  );
});

export default Board; 