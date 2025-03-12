import sportInfo from "./utils/getSportInfo";
import DisplayScoresAndSchedule from "./templates/scores-and-schedule";
import DisplayTeamStandings from "./templates/standings";

sportInfo.setSportAndLeague("basketball", "nba");

const displayStandings = () => {
  return <DisplayTeamStandings />;
};

export default displayStandings;
