async function debugDataGolf() {
  const fetch = (await import('node-fetch')).default;
  
  const API_KEY = '9340428e0600e59a0fb37275733a';
  const url = `https://feeds.datagolf.com/preds/live-tournament-stats?key=${API_KEY}&stats=sg_total&display=value&file_format=json`;
  
  try {
    console.log('Fetching from Data Golf API...');
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Full response structure:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.live_stats && data.live_stats.length > 0) {
      console.log('\nFirst player data:');
      console.log(JSON.stringify(data.live_stats[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

debugDataGolf(); 