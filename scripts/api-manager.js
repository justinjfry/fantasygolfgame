const fetch = require('node-fetch');

const BASE_URL = 'https://fantasygolfgame.onrender.com';

async function checkStatus() {
  try {
    const response = await fetch(`${BASE_URL}/api/golf/status`);
    const status = await response.json();
    
    console.log('=== API Status ===');
    console.log(`Cache Age: ${status.cacheAge ? status.cacheAge + ' seconds' : 'No cache'}`);
    console.log(`Cache Valid: ${status.cacheValid ? 'Yes' : 'No'}`);
    console.log(`Last Update: ${status.lastUpdate || 'Never'}`);
    console.log(`Cache Duration: ${status.cacheDuration} seconds`);
    console.log(`Has Backup Data: ${status.hasBackupData ? 'Yes' : 'No'}`);
    
    if (status.cacheValid) {
      console.log('\n✅ Cache is valid - users will get live data');
    } else {
      console.log('\n⚠️  Cache expired - users will get backup data');
    }
  } catch (error) {
    console.error('Error checking status:', error.message);
  }
}

async function forceUpdate() {
  try {
    console.log('Attempting to force update...');
    const response = await fetch(`${BASE_URL}/api/golf/update-scores`, {
      method: 'POST'
    });
    const result = await response.json();
    
    console.log('=== Update Result ===');
    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    
    if (result.success) {
      console.log('✅ Cache updated successfully!');
    } else {
      console.log('❌ Update failed - likely still rate limited');
    }
  } catch (error) {
    console.error('Error forcing update:', error.message);
  }
}

async function testLeaderboard() {
  try {
    console.log('Testing leaderboard endpoint...');
    const response = await fetch(`${BASE_URL}/api/golf/leaderboard`);
    const data = await response.json();
    
    console.log('=== Leaderboard Test ===');
    console.log(`Players returned: ${data.length}`);
    console.log(`First player: ${data[0]?.name} (${data[0]?.score})`);
    console.log(`Last player: ${data[data.length - 1]?.name} (${data[data.length - 1]?.score})`);
  } catch (error) {
    console.error('Error testing leaderboard:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'status':
    checkStatus();
    break;
  case 'update':
    forceUpdate();
    break;
  case 'test':
    testLeaderboard();
    break;
  default:
    console.log('Usage: node api-manager.js [status|update|test]');
    console.log('  status - Check API and cache status');
    console.log('  update - Force update cache (bypasses rate limit check)');
    console.log('  test   - Test leaderboard endpoint');
    break;
} 