async function testSportsRadarAPI() {
  const API_KEY = 'Y20xhFXST1FnsakFRq6Xsz4KlG9geeE2J8L4rHBs';
  const TOURNAMENT_ID = '312dbe0f-7d87-4f29-adeb-0746d4798749';
  
  console.log('Testing SportsRadar API...');
  
  // Test 1: Tournament Schedule (this worked before)
  try {
    console.log('\n1. Testing Tournament Schedule...');
    const scheduleUrl = `https://api.sportradar.com/golf/trial/euro/v3/en/2025/tournaments/schedule.json?api_key=${API_KEY}`;
    const scheduleRes = await fetch(scheduleUrl);
    const scheduleData = await scheduleRes.json();
    console.log('Schedule API Status:', scheduleRes.status);
    console.log('Schedule API Response keys:', Object.keys(scheduleData));
  } catch (error) {
    console.error('Schedule API Error:', error.message);
  }
  
  // Test 2: Tournament Leaderboard
  try {
    console.log('\n2. Testing Tournament Leaderboard...');
    const leaderboardUrl = `https://api.sportradar.com/golf/trial/euro/v3/en/2025/tournaments/${TOURNAMENT_ID}/leaderboard.json?api_key=${API_KEY}`;
    console.log('URL:', leaderboardUrl);
    const leaderboardRes = await fetch(leaderboardUrl);
    console.log('Leaderboard API Status:', leaderboardRes.status);
    
    if (leaderboardRes.ok) {
      const leaderboardData = await leaderboardRes.json();
      console.log('Leaderboard API Response keys:', Object.keys(leaderboardData));
      if (leaderboardData.leaderboard) {
        console.log('Full leaderboard structure:');
        console.dir(leaderboardData.leaderboard, { depth: null });
      } else {
        console.log('No leaderboard key found in response.');
      }
    } else {
      console.log('Leaderboard API failed with status:', leaderboardRes.status);
      const errorText = await leaderboardRes.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Leaderboard API Error:', error.message);
  }
  
  // Test 3: Alternative endpoint structure
  try {
    console.log('\n3. Testing Alternative Endpoint...');
    const altUrl = `https://api.sportradar.com/golf/trial/v3/en/tournaments/${TOURNAMENT_ID}/leaderboard.json?api_key=${API_KEY}`;
    const altRes = await fetch(altUrl);
    console.log('Alternative API Status:', altRes.status);
    
    if (altRes.ok) {
      const altData = await altRes.json();
      console.log('Alternative API Response keys:', Object.keys(altData));
    } else {
      console.log('Alternative API failed with status:', altRes.status);
    }
  } catch (error) {
    console.error('Alternative API Error:', error.message);
  }
}

testSportsRadarAPI().catch(console.error); 