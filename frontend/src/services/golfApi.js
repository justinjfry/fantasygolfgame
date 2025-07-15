const API_KEY = '694693';

class GolfApiService {
  async getCurrentLeaderboard() {
    try {
      const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchevents.php?e=Genesis Scottish Open`;
      console.log('Fetching from URL:', url);
      const res = await fetch(url);
      const data = await res.json();
      console.log('API Response:', data);
      
      if (!data.event || !data.event.length) {
        console.log('No events found');
        return [];
      }

      const event = data.event.find(ev => ev.strSeason === '2025') || data.event[0];
      console.log('Selected event:', event);
      
      if (!event.strResult) {
        console.log('No result data found');
        return [];
      }

      console.log('Result string:', event.strResult);

      // Parse the leaderboard from strResult
      const leaderboard = [];
      const lines = event.strResult.split('\n');
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          // Look for score pattern (like -12, +2, E, etc.)
          const scoreMatch = parts[parts.length - 1].match(/^([+-]?\d+|[E])$/);
          if (scoreMatch) {
            const score = scoreMatch[1];
            const name = parts.slice(0, -1).join(' '); // Everything except the last part
            if (name && name.length > 0) {
              leaderboard.push({ name, score });
            }
          }
        }
      }

      console.log('Parsed leaderboard:', leaderboard);
      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  getPlayerScore(playerName) {
    // This will be called by the Board component to get a specific player's score
    return this.leaderboardData?.find(player => 
      player.name.toLowerCase() === playerName.toLowerCase()
    )?.score || 'N/A';
  }
}

const golfApi = new GolfApiService();
export default golfApi; 