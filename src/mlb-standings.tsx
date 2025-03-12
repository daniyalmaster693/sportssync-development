import { List } from "@raycast/api";
import sportInfo from "./utils/getSportInfo";
import getTeamStandings from "./utils/getStandings";
import DisplayTeamStandings from "./templates/standings";

sportInfo.setSportAndLeague("baseball", "mlb");

const displaySchedule = () => {
  const { standingsLoading } = getTeamStandings();

  return (
    <List searchBarPlaceholder="Search for your favorite team" isLoading={standingsLoading}>
      <DisplayTeamStandings />
    </List>
  );
};

export default displaySchedule;
