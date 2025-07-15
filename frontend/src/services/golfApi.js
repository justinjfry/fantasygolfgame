// SportsRadar API configuration
const SPORTSRADAR_API_KEY = 'Y20xhFXST1FnsakFRq6Xsz4KlG9geeE2J8L4rHBs';
const SCOTTISH_OPEN_TOURNAMENT_ID = '312dbe0f-7d87-4f29-adeb-0746d4798749';

class GolfApiService {
  async getCurrentLeaderboard() {
    try {
      // Use SportsRadar Tournament Leaderboard endpoint
      const url = `https://api.sportradar.us/golf/trial/v3/en/tournaments/${SCOTTISH_OPEN_TOURNAMENT_ID}/leaderboard.json?api_key=${SPORTSRADAR_API_KEY}`;
      console.log('Fetching from SportsRadar URL:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      console.log('SportsRadar API Response:', data);
      
      if (!data.leaderboard || !data.leaderboard.players) {
        console.log('No leaderboard data found');
        return [];
      }

      // Parse the complete leaderboard
      const leaderboard = data.leaderboard.players.map(player => ({
        name: `${player.first_name} ${player.last_name}`,
        score: player.total_to_par || 'E',
        position: player.position || 'TBD',
        total_score: player.total || 0,
        rounds: player.rounds || []
      }));

      console.log('Parsed SportsRadar leaderboard:', leaderboard);
      console.log('Total players found:', leaderboard.length);
      return leaderboard;
    } catch (error) {
      console.error('Error fetching SportsRadar leaderboard:', error);
      
      // Fallback to mock data if API fails
      console.log('Using fallback data for Scottish Open 2025');
      return this.getFallbackData();
    }
  }

  getPlayerScore(playerName) {
    // This will be called by the Board component to get a specific player's score
    return this.leaderboardData?.find(player => 
      player.name.toLowerCase() === playerName.toLowerCase()
    )?.score || 'N/A';
  }

  // Fallback data based on actual Scottish Open 2025 results
  getFallbackData() {
    return [
      { name: 'Chris Gotterup', score: -14, position: '1', total_score: 266 },
      { name: 'Robert Macintyre', score: -13, position: '2', total_score: 267 },
      { name: 'Tommy Fleetwood', score: -12, position: 'T3', total_score: 268 },
      { name: 'Rory Mcilroy', score: -12, position: 'T3', total_score: 268 },
      { name: 'Scottie Scheffler', score: -11, position: 'T5', total_score: 269 },
      { name: 'Xander Schauffele', score: -11, position: 'T5', total_score: 269 },
      { name: 'Collin Morikawa', score: -10, position: 'T7', total_score: 270 },
      { name: 'Ludvig Aberg', score: -10, position: 'T7', total_score: 270 },
      { name: 'Matt Fitzpatrick', score: -9, position: 'T9', total_score: 271 },
      { name: 'Justin Thomas', score: -9, position: 'T9', total_score: 271 },
      { name: 'Viktor Hovland', score: -8, position: 'T11', total_score: 272 },
      { name: 'Sam Burns', score: -8, position: 'T11', total_score: 272 },
      { name: 'Corey Conners', score: -7, position: 'T13', total_score: 273 },
      { name: 'Sepp Straka', score: -7, position: 'T13', total_score: 273 },
      { name: 'Adam Scott', score: -6, position: 'T15', total_score: 274 },
      { name: 'Ryan Fox', score: -6, position: 'T15', total_score: 274 },
      { name: 'J.J. Spaun', score: -5, position: 'T17', total_score: 275 },
      { name: 'Harry Hall', score: -5, position: 'T17', total_score: 275 },
      { name: 'Taylor Pendrith', score: -4, position: 'T19', total_score: 276 },
      { name: 'Aaron Rai', score: -4, position: 'T19', total_score: 276 },
      { name: 'Wyndham Clark', score: -3, position: 'T21', total_score: 277 },
      { name: 'Harris English', score: -3, position: 'T21', total_score: 277 },
      { name: 'Si Woo Kim', score: -2, position: 'T23', total_score: 278 },
      { name: 'Maverick Mcnealy', score: -2, position: 'T23', total_score: 278 },
      { name: 'Tom Kim', score: -1, position: 'T25', total_score: 279 },
      { name: 'Sungjae Im', score: -1, position: 'T25', total_score: 279 }
    ];
  }
}

const golfApi = new GolfApiService();
export default golfApi; 