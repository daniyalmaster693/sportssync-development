import { LocalStorage, List } from "@raycast/api";
import { useEffect, useState } from "react";
import sportInfo from "./utils/getSportInfo";
import getInjuries from "./utils/getInjuries";
import DisplayNews from "./templates/news";
import DisplayInjuries from "./templates/injuries";
import DisplayTransactions from "./templates/transactions";

const displayInjury = () => {
  const [currentLeague, displaySelectLeague] = useState("Articles");

  useEffect(() => {
    async function loadStoredDropdown() {
      const storedValue = await LocalStorage.getItem("selectedDropdown");

      if (typeof storedValue === "string") {
        displaySelectLeague(storedValue);
      } else {
        displaySelectLeague("Articles");
      }
    }

    loadStoredDropdown();
  }, []);

  const { injuryLoading } = getInjuries();
  sportInfo.setSportAndLeague("baseball", `mlb`);

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
          defaultValue="Articles"
        >
          <List.Dropdown.Item title="Articles" value="Articles" />
          <List.Dropdown.Item title="Injuries" value="Injuries" />
          <List.Dropdown.Item title="Transactions" value="Transactions" />
        </List.Dropdown>
      }
      isLoading={injuryLoading}
    >
      {currentLeague === "Articles" && (
        <>
          <DisplayNews />
        </>
      )}
      {currentLeague === "Injuries" && (
        <>
          <DisplayInjuries />
        </>
      )}
      {currentLeague === "Transactions" && (
        <>
          <DisplayTransactions />
        </>
      )}
    </List>
  );
};

export default displayInjury;
