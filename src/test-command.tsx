import sportInfo from "./utils/getSportInfo";
import DisplayScoresAndSchedule from "./templates/scores-and-schedule";
import DisplayTeamStandings from "./templates/standings";
import DisplayNews from "./templates/news";
import DisplayInjuries from "./templates/injuries";
import DisplayTransactions from "./templates/transactions";

sportInfo.setSportAndLeague("basketball", "nba");

const displayStandings = () => {
  return <DisplayTeamStandings />;
};

export default displayStandings;
