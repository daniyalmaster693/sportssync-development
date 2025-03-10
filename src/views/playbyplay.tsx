import { Detail, List, Icon, Color, Action, ActionPanel, LocalStorage } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState, useEffect } from "react";

interface GameHeader {
  links: { href: string }[];
  competitions: {
    competitors: { team: { links: { href: string }[] } }[];
  }[];
}

interface NHLScoreAndSchedule {
  header: GameHeader;
  boxscore: {
    teams: {
      team: { id: string; logo: string };
    }[];
  };
  plays: Array<{
    type: { text: string };
    period: { number: string };
    clock: { displayValue: string };
    team: { id: string };
    text: string;
  }>;
}

export default function Plays({ gameId }: { gameId: string }) {
  // Fetch NHL Stats
  const {
    isLoading: nhlScheduleStats,
    data: nhlScoresAndSchedule,
    revalidate,
  } = useFetch<NHLScoreAndSchedule>(
    `https://site.web.api.espn.com/apis/site/v2/sports/hockey/nhl/summary?event=${gameId}`,
  );

  const [currentPeriod, displaySelectPeriod] = useState("P1");
  useEffect(() => {
    async function loadStoredDropdown() {
      const storedValue = await LocalStorage.getItem("selectedDropdown");

      if (typeof storedValue === "string") {
        displaySelectPeriod(storedValue);
      } else {
        displaySelectPeriod("P1");
      }
    }

    loadStoredDropdown();
  }, []);

  const nhlGames = nhlScoresAndSchedule?.plays || [];
  const nhlItems: JSX.Element[] = [];
  const majorPlays: NHLScoreAndSchedule["plays"] = [];

  const awayTeamId = nhlScoresAndSchedule?.boxscore?.teams?.[0]?.team?.id;
  const awayTeamLogo = nhlScoresAndSchedule?.boxscore?.teams?.[0]?.team.logo;

  const homeTeamId = nhlScoresAndSchedule?.boxscore?.teams?.[1]?.team?.id;
  const homeTeamLogo = nhlScoresAndSchedule?.boxscore?.teams?.[1]?.team.logo;

  const nhlLogo = "https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nhl.png&w=100&h=100&transparent=true";

  const getTeamLogo = (teamId: string) => {
    if (teamId === awayTeamId) {
      return awayTeamLogo;
    } else if (teamId === homeTeamId) {
      return homeTeamLogo;
    }
    return nhlLogo;
  };

  nhlGames.forEach((nhlGame) => {
    if (nhlGame.type.text === "Goal" || nhlGame.type.text === "Penalty" || nhlGame.text.includes("Fighting")) {
      majorPlays.push(nhlGame);
    }
  });

  const filteredGames = nhlGames.filter((nhlGame) => `P${nhlGame.period.number}` === currentPeriod);

  filteredGames.forEach((nhlGame, index) => {
    const accessoryTitle = `P${nhlGame.period.number} ${nhlGame.clock.displayValue}`;
    let accessoryIcon = Icon.Livestream;
    let accessoryColor = Color.SecondaryText;
    let accessoryTooltip = "Game Time";

    if (nhlGame.type.text === "Goal") {
      accessoryIcon = Icon.BullsEye;
      accessoryColor = Color.Green;
      accessoryTooltip = "Goal";
    }

    if (nhlGame.type.text === "Penalty") {
      accessoryIcon = Icon.Hourglass;
      accessoryColor = Color.Orange;
      accessoryTooltip = "Penalty";
    }

    if (nhlGame.text.includes("Fighting")) {
      accessoryIcon = Icon.MinusCircle;
      accessoryColor = Color.Red;
      accessoryTooltip = "Fight";
    }

    if (nhlGame.text.includes("saved")) {
      accessoryIcon = Icon.BullsEyeMissed;
      accessoryColor = Color.Blue;
      accessoryTooltip = "Save";
    }

    if (nhlGame.type.text.includes("Period Start")) {
      accessoryIcon = Icon.Play;
      accessoryColor = Color.PrimaryText;
    }

    if (nhlGame.type.text.includes("Period End") || nhlGame.type.text.includes("End of Game")) {
      accessoryIcon = Icon.Flag;
      accessoryColor = Color.PrimaryText;
    }

    const teamId = nhlGame?.team?.id;
    const currentTeam = getTeamLogo(teamId);

    nhlItems.push(
      <List.Item
        key={index}
        title={nhlGame.text}
        icon={currentTeam}
        subtitle={nhlGame.type.text}
        accessories={[
          {
            text: { value: `${accessoryTitle ?? "No time found"}`, color: accessoryColor },
            tooltip: accessoryTooltip,
          },
          { icon: { source: accessoryIcon, tintColor: accessoryColor } },
        ]}
        actions={
          <ActionPanel>
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={revalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
            <Action.OpenInBrowser
              title="View Game Details on ESPN"
              url={`${nhlScoresAndSchedule?.header.links[0]?.href ?? "https://www.espn.com/nhl"}`}
            />
            <Action.OpenInBrowser
              title="View Away Team Details"
              url={`${nhlScoresAndSchedule?.header.competitions?.[0].competitors?.[1].team.links[0].href ?? "https://www.espn.com/nhl"}`}
            />

            <Action.OpenInBrowser
              title="View Home Team Details"
              url={`${nhlScoresAndSchedule?.header.competitions?.[0].competitors?.[0].team.links[0].href ?? "https://www.espn.com/nhl"}`}
            />
          </ActionPanel>
        }
      />,
    );
  });

  nhlItems.reverse();
  majorPlays.reverse();

  if (nhlScheduleStats) {
    return <Detail isLoading={true} />;
  }

  if (!nhlScoresAndSchedule) {
    return <Detail markdown="No data found." />;
  }

  return (
    <List
      searchBarPlaceholder="Search for your favorite team"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Sort By"
          onChange={async (newValue) => {
            displaySelectPeriod(newValue);
            await LocalStorage.setItem("selectedDropdown", newValue);
          }}
          value={currentPeriod}
          defaultValue="P1"
        >
          <List.Dropdown.Item title="Major Plays" value="Major Plays" />
          <List.Dropdown.Item title="P1" value="P1" />
          <List.Dropdown.Item title="P2" value="P2" />
          <List.Dropdown.Item title="P3" value="P3" />
          <List.Dropdown.Item title="OT" value="OT" />
        </List.Dropdown>
      }
      isLoading={nhlScheduleStats}
    >
      {currentPeriod === "Major Plays" && (
        <>
          <List.Section title="Major Plays" subtitle={`${majorPlays.length} Play${majorPlays.length !== 1 ? "s" : ""}`}>
            {majorPlays.map((nhlGame, index) => {
              const teamId = nhlGame?.team?.id;
              const currentTeam = getTeamLogo(teamId);

              let accessoryColor = Color.SecondaryText;
              let accessoryIcon = Icon.Livestream;
              let accessoryToolTip = "Game Time";

              if (nhlGame.type.text === "Goal") {
                accessoryIcon = Icon.BullsEye;
                accessoryColor = Color.Green;
                accessoryToolTip = "Goal";
              }

              if (nhlGame.type.text === "Penalty") {
                accessoryIcon = Icon.Hourglass;
                accessoryColor = Color.Orange;
                accessoryToolTip = "Penalty";
              }

              if (nhlGame.text.includes("Fighting")) {
                accessoryIcon = Icon.MinusCircle;
                accessoryColor = Color.Red;
                accessoryToolTip = "Fight";
              }

              return (
                <List.Item
                  key={index}
                  title={nhlGame.text}
                  icon={currentTeam}
                  subtitle={nhlGame.type.text}
                  accessories={[
                    {
                      text: {
                        value: `P${nhlGame.period.number} ${nhlGame.clock.displayValue ?? "No time found"}`,
                        color: accessoryColor,
                      },
                      tooltip: accessoryToolTip,
                    },
                    { icon: { source: accessoryIcon, tintColor: accessoryColor } },
                  ]}
                />
              );
            })}
          </List.Section>
        </>
      )}

      {currentPeriod !== "Major Plays" && (
        <>
          <List.Section
            title={`Play by Play for ${currentPeriod}`}
            subtitle={`${nhlItems.length} Play${nhlItems.length !== 1 ? "s" : ""}`}
          >
            {nhlItems.length > 0 ? nhlItems : <List.Item title="No plays for this period." />}
          </List.Section>
        </>
      )}
    </List>
  );
}
