import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import golfApi from '../services/golfApi';

const Board = forwardRef(function Board({ username, onBack, onLeaderboardNav, onSave, readOnly = false, boardData }, ref) {
  const [selectedSquares, setSelectedSquares] = useState(new Set());
  const [boardContent, setBoardContent] = useState(Array(25).fill('Select Golfer'));
  const [draggedGolfer, setDraggedGolfer] = useState(null);
  const [usedGolfers, setUsedGolfers] = useState(new Set());
  const [saveStatus, setSaveStatus] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(true);
  const autoSaveTimeout = useRef();
  const saveStatusTimeout = useRef();

  const golfers = [
    { name: 'Scottie Scheffler', salary: 13900 },
    { name: 'Jon Rahm', salary: 11600 },
    { name: 'Bryson DeChambeau', salary: 11300 },
    { name: 'Rory McIlroy', salary: 11900 },
    { name: 'Tommy Fleetwood', salary: 11500 },
    { name: 'Xander Schauffele', salary: 11400 },
    { name: 'Tyrrell Hatton', salary: 11200 },
    { name: 'Ben Griffin', salary: 9700 },
    { name: 'Joaquin Niemann', salary: 10500 },
    { name: 'Viktor Hovland', salary: 10700 },
    { name: 'Sam Burns', salary: 9800 },
    { name: 'Robert Macintyre', salary: 10800 },
    { name: 'Justin Thomas', salary: 10600 },
    { name: 'Sepp Straka', salary: 9900 },
    { name: 'Jordan Spieth', salary: 10400 },
    { name: 'Collin Morikawa', salary: 11100 },
    { name: 'Patrick Cantlay', salary: 10100 },
    { name: 'Matt Fitzpatrick', salary: 9900 },
    { name: 'Keegan Bradley', salary: 9500 },
    { name: 'Ryan Fox', salary: 9400 },
    { name: 'Russell Henley', salary: 10200 },
    { name: 'Patrick Reed', salary: 9300 },
    { name: 'Ludvig Aberg', salary: 10900 },
    { name: 'Cameron Young', salary: 9600 },
    { name: 'Adam Scott', salary: 9800 },
    { name: 'Shane Lowry', salary: 11000 },
    { name: 'Harry Hall', salary: 9000 },
    { name: 'Corey Conners', salary: 9500 },
    { name: 'J.J. Spaun', salary: 9200 },
    { name: 'Harris English', salary: 8900 },
    { name: 'Jason Day', salary: 9700 },
    { name: 'Hideki Matsuyama', salary: 10000 },
    { name: 'Maverick McNealy', salary: 8700 },
    { name: 'Taylor Pendrith', salary: 8600 },
    { name: 'Max Greyserman', salary: 8600 },
    { name: 'Brooks Koepka', salary: 10300 },
    { name: 'Justin Rose', salary: 9600 },
    { name: 'Cameron Smith', salary: 9000 },
    { name: 'Nick Taylor', salary: 8200 },
    { name: 'Aaron Rai', salary: 8900 },
    { name: 'Kevin Yu', salary: 8200 },
    { name: 'Daniel Berger', salary: 8800 },
    { name: 'Bud Cauley', salary: 9300 },
    { name: 'Marco Penge', salary: 7800 },
    { name: 'Tony Finau', salary: 8600 },
    { name: 'Carlos Ortiz', salary: 9000 },
    { name: 'Kristoffer Reitan', salary: 7700 },
    { name: 'Rickie Fowler', salary: 8500 },
    { name: 'Matt Wallace', salary: 8300 },
    { name: 'Louis Oosthuizen', salary: 8700 },
    { name: 'Brian Harman', salary: 8800 },
    { name: 'Thorbjorn Olesen', salary: 8200 },
    { name: 'Akshay Bhatia', salary: 8300 },
    { name: 'Andrew Novak', salary: 8300 },
    { name: 'Chris Kirk', salary: 8100 },
    { name: 'Michael Kim', salary: 9100 },
    { name: 'Tom McKibbin', salary: 8300 },
    { name: 'Lucas Herbert', salary: 8400 },
    { name: 'Denny McCarthy', salary: 8100 },
    { name: 'Wyndham Clark', salary: 8200 },
    { name: 'Dean Burmester', salary: 8500 },
    { name: 'J.T. Poston', salary: 8100 },
    { name: 'Thomas Detry', salary: 8800 },
    { name: 'Thriston Lawrence', salary: 8400 },
    { name: 'Min Woo Lee', salary: 9200 },
    { name: 'Davis Thompson', salary: 8400 },
    { name: 'Dustin Johnson', salary: 7900 },
    { name: 'Antoine Rozner', salary: 7400 },
    { name: 'Tom Kim', salary: 8100 },
    { name: 'Sungjae Im', salary: 8900 },
    { name: 'Christiaan Bezuidenhout', salary: 7900 },
    { name: 'Matthew Jordan', salary: 7800 },
    { name: 'Byeong Hun An', salary: 8400 },
    { name: 'Jhonattan Vegas', salary: 7600 },
    { name: 'Tom Hoge', salary: 7600 },
    { name: 'Lucas Glover', salary: 7700 },
    { name: 'Marc Leishman', salary: 7900 },
    { name: 'Adrien Saddier', salary: 7500 },
    { name: 'Rasmus Hojgaard', salary: 8700 },
    { name: 'Aldrich Potgieter', salary: 7500 },
    { name: 'Sergio Garcia', salary: 8600 },
    { name: 'Matteo Manassero', salary: 7700 },
    { name: 'Mackenzie Hughes', salary: 7700 },
    { name: 'Niklas Norgaard Moller', salary: 8000 },
    { name: 'Jesper Svensson', salary: 8000 },
    { name: 'Laurie Canter', salary: 7400 },
    { name: 'Zach Johnson', salary: 7100 },
    { name: 'Daniel Hillier', salary: 7400 },
    { name: 'Stephan Jaeger', salary: 8000 },
    { name: 'Romain Langasque', salary: 7000 },
    { name: 'John Catlin', salary: 7100 },
    { name: 'Brian Campbell', salary: 7300 },
    { name: 'John Parry', salary: 7300 },
    { name: 'Shaun Norris', salary: 7200 },
    { name: 'Takumi Kanaya', salary: 7100 },
    { name: 'Sebastian Soderberg', salary: 7000 },
    { name: 'Sahith Theegala', salary: 7600 },
    { name: 'Rikuya Hoshino', salary: 7000 },
    { name: 'Phil Mickelson', salary: 7400 },
    { name: 'Martin Couvra', salary: 7800 },
    { name: 'Matthew McCarty', salary: 7500 },
    { name: 'Julien Guerrier', salary: 7100 },
    { name: 'Jason Kokrak', salary: 7000 },
    { name: 'Francesco Molinari', salary: 7000 },
    { name: 'Padraig Harrington', salary: 7500 },
    { name: 'Nicolas Echavarria', salary: 8000 },
    { name: 'Stewart Cink', salary: 7200 },
    { name: 'Jordan L. Smith', salary: 7900 },
    { name: 'Matthieu Pavon', salary: 7300 },
    { name: 'Hao-Tong Li', salary: 7600 },
    { name: 'Lee Westwood', salary: 7300 },
    { name: 'Nathan Kimsey', salary: 7000 },
    { name: 'Angel Hidalgo', salary: 7000 },
    { name: 'Henrik Stenson', salary: 7200 },
    { name: 'Justin Suh', salary: 7000 },
    { name: 'Jacob Skov Olesen', salary: 7200 },
    { name: 'Guido Migliozzi', salary: 7000 },
    { name: 'John Axelsen', salary: 7000 },
    { name: 'Curtis Luck', salary: 7000 },
    { name: 'Daniel Van Tonder', salary: 7000 },
    { name: 'Elvis Smylie', salary: 7000 },
    { name: 'Daniel Brown', salary: 7800 },
    { name: 'Riki Kawamoto', salary: 7000 },
    { name: 'Darren Fichardt', salary: 7000 },
    { name: 'Shugo Imahira', salary: 7000 },
    { name: 'Justin Hastings', salary: 7000 },
    { name: 'K.J. Choi', salary: 7000 },
    { name: 'Sebastian Cave', salary: 7000 },
    { name: 'Darren Clarke', salary: 7000 },
    { name: 'Ethan Fang', salary: 7000 },
    { name: 'Richard Teder', salary: 7000 },
    { name: 'Dylan Naidoo', salary: 7000 },
    { name: 'Justin Walters', salary: 7000 },
    { name: 'Sampson-yunhe Zheng', salary: 7000 },
    { name: 'Cameron Adam', salary: 7000 },
    { name: 'Connor Graham', salary: 7000 },
    { name: 'Filip Jakubcik', salary: 7000 },
    { name: 'Bryan Newman', salary: 7000 },
    { name: 'Sadom Kaewkanjana', salary: 7000 },
    { name: 'Justin Leonard', salary: 7000 },
    { name: 'Ryggs Johnston', salary: 7000 },
    { name: 'Younghan Song', salary: 7000 },
    { name: 'Curtis Knipes', salary: 7000 },
    { name: 'Frazer Jones', salary: 7000 },
    { name: 'Ryan Peake', salary: 7000 },
    { name: 'Chris Gotterup', salary: 9200 },
    { name: 'Si Woo Kim', salary: 8900 },
    { name: 'Nicolai Hojgaard', salary: 8400 },
    { name: 'Matti Schmid', salary: 7400 },
    { name: 'Davis Riley', salary: 7300 },
    { name: 'Jesper Sandborg', salary: 7000 },
    { name: 'Mikiya Akutsu', salary: 7000 },
    { name: 'Daniel Young', salary: 7000 },
    { name: 'George Bloor', salary: 7000 },
    { name: 'OJ Farrell', salary: 7000 },
    { name: 'Oliver Lindell', salary: 7000 }
  ];

  // On mount, initialize board from boardData if provided
  useEffect(() => {
    if (boardData) {
      setBoardContent(boardData.boardContent || Array(25).fill('Select Golfer'));
      setSelectedSquares(new Set(boardData.selectedSquares || []));
      setUsedGolfers(new Set(boardData.usedGolfers || []));
    } else {
      setBoardContent(Array(25).fill('Select Golfer'));
      setSelectedSquares(new Set());
      setUsedGolfers(new Set());
    }
  }, [boardData]);

  // Fetch leaderboard data on mount
  useEffect(() => {
    const fetchScores = async () => {
      try {
        setScoresLoading(true);
        const data = await golfApi.getCurrentLeaderboard();
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setScoresLoading(false);
      }
    };
    fetchScores();
  }, []);

  // Helper function to get player score
  const getPlayerScore = (playerName) => {
    if (!playerName) return 'E';
    console.log('Looking for player:', playerName);
    console.log('Available players:', leaderboardData.map(p => p.name));
    
    // Try exact match first
    let player = leaderboardData.find(p => 
      p.name.toLowerCase() === playerName.toLowerCase()
    );
    
    // If no exact match, try partial match
    if (!player) {
      player = leaderboardData.find(p => 
        p.name.toLowerCase().includes(playerName.toLowerCase()) ||
        playerName.toLowerCase().includes(p.name.toLowerCase())
      );
    }
    
    // If still no match, try common name variations
    if (!player) {
      const nameVariations = {
        'max greysermar': 'max greyserman',
        'matt wallace': 'matt wallace',
        'ludvig aberg': 'ludvig åberg',
        'nicolai hojgaard': 'nicolai højgaard',
        'max greyserman': 'max greyserman'
      };
      
      const normalizedName = playerName.toLowerCase();
      const variation = nameVariations[normalizedName];
      if (variation) {
        player = leaderboardData.find(p => 
          p.name.toLowerCase() === variation
        );
      }
    }
    
    console.log('Found player:', player);
    
    // Return formatted score
    if (player) {
      const score = player.score;
      // Backend already formats the score, so just return it as-is
      return score.toString();
    }
    
    return 'N/A';
  };

  // Calculate best lines for this board
  const calculateBestLines = () => {
    if (!leaderboardData.length || scoresLoading) return new Set();

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

    // Define all 12 bingo lines
    const bingoLines = [
      // Rows
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      // Columns
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
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
        totalScore: totalScore
      });
    });

    // Find the best (lowest) score
    if (lineScores.length === 0) return new Set();
    
    const bestScore = Math.min(...lineScores.map(line => line.totalScore));
    
    // Get all lines with the best score
    const bestLines = lineScores.filter(line => line.totalScore === bestScore);
    
    // Collect all indices from best lines
    const bestIndices = new Set();
    bestLines.forEach(line => {
      line.indices.forEach(index => bestIndices.add(index));
    });

    return bestIndices;
  };

  const bestLineIndices = calculateBestLines();

  // Debounced auto-save effect (backend only)
  useEffect(() => {
    if (readOnly || !username || typeof onSave !== 'function') return;
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(async () => {
      await onSave({
        boardContent,
        selectedSquares: Array.from(selectedSquares),
        usedGolfers: Array.from(usedGolfers),
        lastSaved: new Date().toISOString()
      });
      if (saveStatusTimeout.current) clearTimeout(saveStatusTimeout.current);
      saveStatusTimeout.current = setTimeout(() => setSaveStatus(null), 1500);
    }, 1000);
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
      if (saveStatusTimeout.current) clearTimeout(saveStatusTimeout.current);
    };
    // eslint-disable-next-line
  }, [boardContent, selectedSquares, usedGolfers, username, onSave, readOnly]);

  // If readOnly, disable all editing handlers
  const handleDragStart = readOnly ? undefined : (e, golfer) => {
    if (!usedGolfers.has(golfer)) {
      setDraggedGolfer(golfer);
    }
  };
  const handleDragOver = readOnly ? undefined : (e) => { if (e) e.preventDefault(); };
  const handleDrop = readOnly ? undefined : (e, index) => {
    if (e) e.preventDefault();
    if (!draggedGolfer || usedGolfers.has(draggedGolfer.name)) return;

    // Prevent dropping on a square that already has a golfer
    if (boardContent[index] && boardContent[index].name) {
      alert('Square already selected');
      return;
    }

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

    // Check if this drop would fill the last square of a color zone
    let isLastSquareOfColor = false;
    let colorName = '';
    
    if (isOrange) {
      const filledOrangeCount = orangeIndices.filter(idx => boardContent[idx] && boardContent[idx].name).length;
      isLastSquareOfColor = filledOrangeCount === 3; // This would be the 4th (last) orange square
      colorName = 'orange';
    } else if (isGreen) {
      const filledGreenCount = greenIndices.filter(idx => boardContent[idx] && boardContent[idx].name).length;
      isLastSquareOfColor = filledGreenCount === 4; // This would be the 5th (last) green square
      colorName = 'green';
    } else if (isBabyBlue) {
      const filledBabyBlueCount = babyBlueIndices.filter(idx => boardContent[idx] && boardContent[idx].name).length;
      isLastSquareOfColor = filledBabyBlueCount === 3; // This would be the 4th (last) baby blue square
      colorName = 'baby blue';
    } else if (isLightMagenta) {
      const filledLightMagentaCount = lightMagentaIndices.filter(idx => boardContent[idx] && boardContent[idx].name).length;
      isLastSquareOfColor = filledLightMagentaCount === 3; // This would be the 4th (last) light magenta square
      colorName = 'light magenta';
    } else if (isWhite) {
      const filledWhiteCount = whiteIndices.filter(idx => boardContent[idx] && boardContent[idx].name).length;
      isLastSquareOfColor = filledWhiteCount === 11; // This would be the 12th (last) white square
      colorName = 'white';
    }

    // If this drop would fill the last square of a color zone, check salary constraints
    if (isLastSquareOfColor) {
      if (isOrange) {
        // Calculate avg remaining salary for orange squares
        const filledOrangeSalaries = orangeIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const avgOrangeSalary = (40000 - filledOrangeSalaries) / 1; // Only 1 square left
        if (draggedGolfer.salary > avgOrangeSalary) {
          alert(`You can only fill the last ${colorName} square if the golfer is at or under the remaining salary budget of ${formatSalary(avgOrangeSalary)}!`);
          return;
        }
      } else if (isGreen) {
        // Calculate avg remaining salary for green squares
        const filledGreenSalaries = greenIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const avgGreenSalary = (50000 - filledGreenSalaries) / 1; // Only 1 square left
        if (draggedGolfer.salary > avgGreenSalary) {
          alert(`You can only fill the last ${colorName} square if the golfer is at or under the remaining salary budget of ${formatSalary(avgGreenSalary)}!`);
          return;
        }
      } else if (isBabyBlue) {
        // Calculate avg remaining salary for baby blue squares
        const filledBabyBlueSalaries = babyBlueIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const avgBabyBlueSalary = (40000 - filledBabyBlueSalaries) / 1; // Only 1 square left
        if (draggedGolfer.salary > avgBabyBlueSalary) {
          alert(`You can only fill the last ${colorName} square if the golfer is at or under the remaining salary budget of ${formatSalary(avgBabyBlueSalary)}!`);
          return;
        }
      } else if (isLightMagenta) {
        // Calculate avg remaining salary for light magenta squares
        const filledLightMagentaSalaries = lightMagentaIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const avgLightMagentaSalary = (40000 - filledLightMagentaSalaries) / 1; // Only 1 square left
        if (draggedGolfer.salary > avgLightMagentaSalary) {
          alert(`You can only fill the last ${colorName} square if the golfer is at or under the remaining salary budget of ${formatSalary(avgLightMagentaSalary)}!`);
          return;
        }
      } else if (isWhite) {
        // Calculate avg remaining salary for white squares
        const filledWhiteSalaries = whiteIndices
          .map(idx => boardContent[idx])
          .filter(golfer => golfer && golfer.name)
          .reduce((sum, golfer) => sum + (golfer.salary || 0), 0);
        const avgWhiteSalary = (80000 - filledWhiteSalaries) / 1; // Only 1 square left
        if (draggedGolfer.salary > avgWhiteSalary) {
          alert(`You can only fill the last ${colorName} square if the golfer is at or under the remaining salary budget of ${formatSalary(avgWhiteSalary)}!`);
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
    // Immediately save after a change
    if (typeof onSave === 'function') {
      onSave({
        boardContent: newBoardContent,
        selectedSquares: Array.from(selectedSquares),
        usedGolfers: Array.from(new Set([...usedGolfers, draggedGolfer.name])),
        lastSaved: new Date().toISOString()
      });
    }
  };

  const handleSquareClick = readOnly ? undefined : (index) => {
    const newSelected = new Set(selectedSquares);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSquares(newSelected);
  };

  const handleSquareClear = readOnly ? undefined : (index) => {
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

  const handleClearBoard = readOnly ? undefined : () => {
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

  // Helper to get all bingo lines
  const getBingoLines = () => {
    const lines = [];
    for (let r = 0; r < 5; r++) lines.push(Array.from({ length: 5 }, (_, c) => r * 5 + c));
    for (let c = 0; c < 5; c++) lines.push(Array.from({ length: 5 }, (_, r) => r * 5 + c));
    lines.push([0, 6, 12, 18, 24]);
    lines.push([4, 8, 12, 16, 20]);
    return lines;
  };
  const bingoLines = getBingoLines();

  // Helper to get dynamic font size for golfer names to fit in a fixed width, up to 2 lines, with capped max size
  const getNameFontSize = (name) => {
    if (name.length <= 12) return '0.75rem'; // cap max size
    if (name.length <= 16) return '0.70rem';
    if (name.length <= 20) return '0.60rem';
    if (name.length <= 24) return '0.50rem';
    if (name.length <= 28) return '0.42rem';
    if (name.length <= 34) return '0.36rem';
    return '0.26rem'; // for extremely long names
  };

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
    
    const disableInteractions = readOnly;
    return (
      <div
        key={index}
        onClick={disableInteractions ? undefined : (handleSquareClick ? () => handleSquareClick(index) : undefined)}
        onDoubleClick={disableInteractions ? undefined : (handleSquareClear ? () => handleSquareClear(index) : undefined)}
        onContextMenu={disableInteractions ? undefined : (handleSquareClear ? (e) => { e.preventDefault(); handleSquareClear(index); } : undefined)}
        onDragOver={disableInteractions ? undefined : (handleDragOver ? handleDragOver : undefined)}
        onDrop={disableInteractions ? undefined : (handleDrop ? (e) => handleDrop(e, index) : undefined)}
        style={{
          width: '80px',
          height: '80px',
          border: isFilled ? '4px solid #0d47a1' : '3px solid #0d47a1',
          backgroundColor: backgroundColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disableInteractions ? 'default' : 'pointer',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          color: isSelected ? '#0d47a1' : '#333',
          transition: 'all 0.2s ease',
          borderRadius: '8px',
          textAlign: 'center',
          padding: '4px',
          position: 'relative',
          boxShadow: isFilled ? '0 4px 12px rgba(13, 71, 161, 0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
          transform: isFilled ? 'scale(1.02)' : 'scale(1)',
          pointerEvents: disableInteractions ? 'none' : 'auto',
          opacity: 1,
        }}
        title={disableInteractions ? undefined : "Left click to select, Right click or Double click to clear"}
      >
        {golferObj && golferObj.name ? (
          <>
            {/* Red check mark in top right when filled, but not when board is full */}
            {!isBoardFull && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '8px',
                  color: '#ff0000', // force strong red
                  fontSize: '1.3em',
                  zIndex: 2,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  fontWeight: 'bold',
                  filter: 'none',
                  textShadow: 'none',
                  // @ts-ignore
                  ...(typeof document !== 'undefined' ? { color: '#ff0000 !important' } : {}),
                }}
                title="Filled"
              >
                ✔️
              </span>
            )}
            
            {/* Blue check mark for best line squares */}
            {bestLineIndices.has(index) && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '8px',
                  color: '#0d47a1',
                  fontSize: '1.1em',
                  zIndex: 3,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                }}
                title="Best Line"
              >
                ✓
              </span>
            )}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start', // align content to top, more room for name
              height: '100%',
              width: '100%',
              paddingTop: 0,
              position: 'relative',
            }}>
              {/* Score to par */}
              <div style={{ height: '1em', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '-0.1em' }}>
                <span style={{
                  fontSize: '0.85em',
                  color: (() => {
                    const score = getPlayerScore(golferObj.name);
                    // Check if score is under par (negative number or starts with '-')
                    if (score && (score.toString().startsWith('-') || (typeof score === 'number' && score < 0))) {
                      return '#ff0000'; // RED for under par
                    }
                    return '#0d47a1'; // Default blue
                  })(),
                  fontWeight: 'bold',
                  minHeight: '16px',
                  display: 'block',
                }}>
                  {scoresLoading ? '...' : getPlayerScore(golferObj.name)}
                </span>
              </div>
              {/* Name with increased height and less margin, centered between score and salary */}
              <div style={{
                height: '2.8em', // increased height for up to 2 lines
                width: '100%',
                display: 'flex',
                alignItems: 'center', // center vertically
                justifyContent: 'center',
                margin: '0.15em 0 0.05em 0', // less top/bottom margin
                overflow: 'hidden',
              }}>
                <span style={{
                  fontSize: getNameFontSize(golferObj.name),
                  color: '#0d47a1',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  maxWidth: '95%',
                  lineHeight: 1.1,
                  letterSpacing: '0.01em',
                  whiteSpace: 'normal', // allow wrapping
                  overflow: 'hidden',
                  display: 'block',
                }}>{golferObj.name}</span>
              </div>
              {/* Salary moved to bottom of square */}
              <div style={{
                position: 'absolute',
                bottom: '4px',
                left: 0,
                width: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                marginTop: 0,
              }}>
                <span style={{
                  fontSize: '0.7em',
                  color: '#0d47a1',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  minHeight: '16px',
                  marginBottom: 0,
                }}>{formatSalary(golferObj.salary)}</span>
              </div>
            </div>
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

  // Expose getCurrentBoardState and flushSave to parent via ref
  useImperativeHandle(ref, () => ({
    getCurrentBoardState: () => ({
      boardContent,
      selectedSquares: Array.from(selectedSquares),
      usedGolfers: Array.from(usedGolfers),
      lastSaved: new Date().toISOString()
    }),
    flushSave: async () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
        autoSaveTimeout.current = null;
      }
      if (typeof onSave === 'function' && username) {
        await onSave({
          boardContent,
          selectedSquares: Array.from(selectedSquares),
          usedGolfers: Array.from(usedGolfers),
          lastSaved: new Date().toISOString()
        });
      }
    }
  }));

  const isOwnBoard = typeof onSave === 'function';

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
      {/* Fixed-position Rules Box - Only show when not readOnly (boards not locked) */}
      {!readOnly && (
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
              <li style={{ marginBottom: '0.7rem' }}><b>1.</b> Drag players to fill squares on your board. *Double click a square to remove players</li>
              <li style={{ marginBottom: '0.7rem' }}><b>2.</b> Stay under salary budget for each color zone.</li>
              <li style={{ marginBottom: '0.7rem' }}><b>3.</b> Fill all 25 spaces to complete your board.</li>
            </ol>
            
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #0d47a1' }}>
              <h4 style={{ color: '#0d47a1', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
                How to win:
              </h4>
              <ol style={{ color: '#333', fontSize: '1rem', paddingLeft: '1.2rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Half the pot goes to the best combined score of five golfers in a row (bingo line).</li>
                <li style={{ marginBottom: '0.5rem' }}>The other half is split between anyone who has the winning golfer on their board.</li>
              </ol>
            </div>
          </div>
      )}
      {/* Header with absolutely positioned Leaderboard Button */}
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: '0.25rem' }}>
        <h1 style={{ color: '#FFD600', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 0, display: 'inline-block' }}>
          {username}'s Board
        </h1>
        
        {(isOwnBoard || !readOnly) && (
          <button
            onClick={async () => {
              if (autoSaveTimeout.current) {
                clearTimeout(autoSaveTimeout.current);
                autoSaveTimeout.current = null;
              }
              if (!readOnly && typeof onSave === 'function' && username) {
                await onSave({
                  boardContent,
                  selectedSquares: Array.from(selectedSquares),
                  usedGolfers: Array.from(usedGolfers),
                  lastSaved: new Date().toISOString()
                });
              }
              if (typeof onLeaderboardNav === 'function') {
                onLeaderboardNav();
              }
            }}
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
        )}
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
          {!readOnly && (
            <div style={{ 
              color: 'white', 
              fontSize: '0.9rem', 
              fontWeight: 'bold',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              backdropFilter: 'blur(10px)',
              marginTop: '-1.4rem'
            }}>
              Filled: {boardContent.filter(content => content && content.name).length} / 25 squares
            </div>
          )}
          
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
          {!readOnly && (
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
          )}
        </div>

        {/* Golfer List */}
        {!readOnly && (
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
              marginTop: '1rem',
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
        )}
      </div>


    </div>
  );
});

export default Board; 