import { Detail, List, Color, Icon, Action, ActionPanel, LocalStorage } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState, useEffect } from "react";
import CompletedGames from "./views/favoriteTeamCompleted";
import ScheduledGames from "./views/favoriteTeamScheduled";
import TeamInjuries from "./views/favoriteTeamTracker";
import { getPreferenceValues } from "@raycast/api";

interface preferences {
  name: string;
  id?: string;
}
const preferences = getPreferenceValues<Preferences>();

const favoriteTeam = preferences.team;
const favoriteLeague = preferences.league;
const favoriteSport = preferences.sport;

console.log(preferences);

console.log(favoriteTeam);
console.log(favoriteLeague);
console.log(favoriteSport);

const Command = () => {
  const [currentType, displaySelectType] = useState("NBA Games");
  useEffect(() => {
    async function loadStoredDropdown() {
      const storedValue = await LocalStorage.getItem("selectedDropdown");

      if (typeof storedValue === "string") {
        displaySelectType(storedValue);
      } else {
        displaySelectType("Scheduled Games");
      }
    }

    loadStoredDropdown();
  }, []);

  const { isLoading: nhlScheduleStats, data: nhlScoresAndSchedule } = useFetch<Response>(
    `https://site.api.espn.com/apis/site/v2/sports/${favoriteSport}/${favoriteLeague}/teams/${favoriteTeam}/schedule`,
  );

  if (!nhlScoresAndSchedule) {
    return <Detail markdown="No data found." />;
  }

  return (
    <List
      searchBarPlaceholder={`Search for a game`}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Sort by"
          onChange={async (newValue) => {
            displaySelectType(newValue);
            await LocalStorage.setItem("selectedDropdown", newValue);
          }}
          value={currentType}
          defaultValue="Scheduled Games"
        >
          <List.Dropdown.Item title="Scheduled Games" value="Scheduled Games" />
          <List.Dropdown.Item title="Completed Games" value="Completed Games" />
          <List.Dropdown.Item title="Tracker" value="Tracker" />
          <List.Dropdown.Item title="Pin List" value="Pin List" />
        </List.Dropdown>
      }
      isLoading={nhlScheduleStats}
    >
      {currentType === "Scheduled Games" && (
        <>
          <ScheduledGames />
        </>
      )}

      {currentType === "Completed Games" && (
        <>
          <CompletedGames />
        </>
      )}

      {currentType === "Tracker" && (
        <>
          <TeamInjuries />
        </>
      )}

      {currentType === "Pin List" && <></>}
    </List>
  );
};

export default Command;
