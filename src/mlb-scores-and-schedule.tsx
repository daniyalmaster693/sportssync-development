import { List } from "@raycast/api";
import sportInfo from "./utils/getSportInfo";
import getScoresAndSchedule from "./utils/getSchedule";
import DisplayScoresAndSchedule from "./templates/scores-and-schedule";

sportInfo.setSportAndLeague("baseball", "mlb");

const displaySchedule = () => {
  const { scheduleLoading } = getScoresAndSchedule();

  return (
    <List searchBarPlaceholder="Search for your favorite team" isLoading={scheduleLoading}>
      <DisplayScoresAndSchedule />
    </List>
  );
};

export default displaySchedule;
