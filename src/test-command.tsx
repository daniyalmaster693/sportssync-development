import sportInfo from "./utils/getSportInfo";
import DisplayScoresAndSchedule from "./templates/scores-and-schedule";

sportInfo.setSportAndLeague("hockey", "nhl");

const displaySchedule = () => {
  return <DisplayScoresAndSchedule />;
};

export default displaySchedule;
