import { LocalStorage, List } from "@raycast/api";
import { useEffect, useState } from "react";
import sportInfo from "./utils/getSportInfo";
import getScoresAndSchedule from "./utils/getSchedule";
import DisplayScoresAndSchedule from "./templates/scores-and-schedule";

const displaySchedule = () => {
  const [currentLeague, displaySelectLeague] = useState("nfl");

  useEffect(() => {
    async function loadStoredDropdown() {
      const storedValue = await LocalStorage.getItem("selectedDropdown");

      if (typeof storedValue === "string") {
        displaySelectLeague(storedValue);
      } else {
        displaySelectLeague("nfl");
      }
    }

    loadStoredDropdown();
  }, []);

  const { scheduleLoading } = getScoresAndSchedule();
  sportInfo.setSportAndLeague("football", `${currentLeague}`);

  return (
    <List
      searchBarPlaceholder="Search for your favorite team"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Sort by"
          onChange={async (newValue) => {
            displaySelectLeague(newValue);
            await LocalStorage.setItem("selectedDropdown", newValue);
          }}
          value={currentLeague}
          defaultValue="nfl"
        >
          <List.Dropdown.Item title="NFL" value="nfl" />
          <List.Dropdown.Item title="NCAA" value="college-football" />
        </List.Dropdown>
      }
      isLoading={scheduleLoading}
    >
      <DisplayScoresAndSchedule />;
    </List>
  );
};

export default displaySchedule;
