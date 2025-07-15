const { spawn } = require('child_process');
const fetch = require('node-fetch');

console.log('Starting backend server test...');

// Start the backend server
const server = spawn('node', ['server.js'], { 
  cwd: './backend',
  stdio: 'pipe'
});

server.stdout.on('data', (data) => {
  console.log('Server output:', data.toString());
  
  // If server started successfully, test the endpoint
  if (data.toString().includes('Fantasy Golf Backend running')) {
    console.log('Server started successfully! Testing endpoint...');
    
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:5000/api/golf/leaderboard');
        const data = await response.json();
        console.log('✅ API endpoint working!');
        console.log('Response status:', response.status);
        console.log('Number of players:', data.length);
        console.log('First player:', data[0]);
        
        // Kill the server
        server.kill();
        process.exit(0);
      } catch (error) {
        console.error('❌ API endpoint failed:', error.message);
        server.kill();
        process.exit(1);
      }
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
  server.kill();
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Test timed out');
  server.kill();
  process.exit(1);
}, 10000); 