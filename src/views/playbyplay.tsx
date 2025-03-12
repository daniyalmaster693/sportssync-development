import { Detail, List, Color, Icon, Action, ActionPanel, LocalStorage } from "@raycast/api";
import { useState, useEffect } from "react";
import getPlayByPlayEvents from "../utils/getPlaybyPlay";
import sportInfo from "../utils/getSportInfo";

interface GameHeader {
  links: { href: string }[];
  competitions: {
    competitors: { team: { links: { href: string }[] } }[];
  }[];
}

interface playByPlayData {
  header: GameHeader;
  boxscore: {
    teams: {
      team: { id: string; logo: string };
    }[];
  };
  plays: Array<{
    [x: string]: any;
    type: { text: string };
    period: { number: string };
    clock: { displayValue: string };
    team: { id: string };
    text: string;
  }>;
}

export default function Plays({ gameId }: { gameId: string }) {
  const { playByPlayEventData, playByPlayLoading, playByPlayRevalidate } = getPlayByPlayEvents({ gameId });

  const currentLeague = sportInfo.getLeague();

  const [currentPeriod, displaySelectPeriod] = useState("Major Plays");
  useEffect(() => {
    async function loadStoredDropdown() {
      const storedValue = await LocalStorage.getItem("selectedDropdown");

      if (typeof storedValue === "string") {
        displaySelectPeriod(storedValue);
      } else {
        displaySelectPeriod("Major Plays");
      }
    }

    loadStoredDropdown();
  }, []);

  const events = playByPlayEventData?.plays || [];
  const playByPlayEvents: JSX.Element[] = [];
  const majorPlays: playByPlayData["plays"] = [];

  const awayTeamId = playByPlayEventData?.boxscore?.teams?.[0]?.team?.id;
  const awayTeamLogo = playByPlayEventData?.boxscore?.teams?.[0]?.team.logo;

  const homeTeamId = playByPlayEventData?.boxscore?.teams?.[1]?.team?.id;
  const homeTeamLogo = playByPlayEventData?.boxscore?.teams?.[1]?.team.logo;

  const leagueLogo = `https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/${currentLeague}.png&w=100&h=100&transparent=true`;

  const getTeamLogo = (teamId: string) => {
    if (teamId === awayTeamId) {
      return awayTeamLogo;
    } else if (teamId === homeTeamId) {
      return homeTeamLogo;
    }
    return leagueLogo;
  };

  events.forEach((game) => {
    if (game.type.text === "Goal" || game.type.text === "Penalty" || game.text.includes("Fighting")) {
      majorPlays.push(game);
    }
  });

  const filteredGames = events.filter((game) => `P${game.period.number}` === currentPeriod);

  filteredGames.forEach((game, index) => {
    const accessoryTitle = `P${game.period.number} ${game.clock.displayValue}`;
    let accessoryIcon = Icon.Livestream;
    let accessoryColor = Color.SecondaryText;
    let accessoryTooltip = "Game Time";

    if (game.type.text === "Goal") {
      accessoryIcon = Icon.BullsEye;
      accessoryColor = Color.Green;
      accessoryTooltip = "Goal";
    }

    if (game.type.text === "Penalty") {
      accessoryIcon = Icon.Hourglass;
      accessoryColor = Color.Orange;
      accessoryTooltip = "Penalty";
    }

    if (game.text.includes("Fighting")) {
      accessoryIcon = Icon.MinusCircle;
      accessoryColor = Color.Red;
      accessoryTooltip = "Fight";
    }

    if (game.text.includes("saved")) {
      accessoryIcon = Icon.BullsEyeMissed;
      accessoryColor = Color.Blue;
      accessoryTooltip = "Save";
    }

    if (game.type.text.includes("Period Start")) {
      accessoryIcon = Icon.Play;
      accessoryColor = Color.PrimaryText;
    }

    if (game.type.text.includes("Period End") || game.type.text.includes("End of Game")) {
      accessoryIcon = Icon.Flag;
      accessoryColor = Color.PrimaryText;
    }

    const teamId = game?.team?.id;
    const currentTeam = getTeamLogo(teamId);

    playByPlayEvents.push(
      <List.Item
        key={index}
        title={game.text}
        icon={currentTeam}
        subtitle={game.type.text}
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
              onAction={playByPlayRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
            <Action.OpenInBrowser
              title="View Game Details on ESPN"
              url={`${playByPlayEventData?.header.links[0]?.href ?? "https://www.espn.com/nhl"}`}
            />
            <Action.OpenInBrowser
              title="View Away Team Details"
              url={`${playByPlayEventData?.header.competitions?.[0].competitors?.[1].team.links[0].href ?? "https://www.espn.com/nhl"}`}
            />

            <Action.OpenInBrowser
              title="View Home Team Details"
              url={`${playByPlayEventData?.header.competitions?.[0].competitors?.[0].team.links[0].href ?? "https://www.espn.com/nhl"}`}
            />
          </ActionPanel>
        }
      />,
    );
  });

  playByPlayEvents.reverse();
  majorPlays.reverse();

  if (playByPlayLoading) {
    return <Detail isLoading={true} />;
  }

  if (!playByPlayEventData) {
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
          defaultValue="Major Plays"
        >
          <List.Dropdown.Item title="Major Plays" value="Major Plays" />
          <List.Dropdown.Item title="P1" value="P1" />
          <List.Dropdown.Item title="P2" value="P2" />
          <List.Dropdown.Item title="P3" value="P3" />
          <List.Dropdown.Item title="OT" value="OT" />
        </List.Dropdown>
      }
      isLoading={playByPlayLoading}
    >
      {currentPeriod === "Major Plays" && (
        <>
          <List.Section title="Major Plays" subtitle={`${majorPlays.length} Play${majorPlays.length !== 1 ? "s" : ""}`}>
            {majorPlays.map((game, index) => {
              const teamId = game?.team?.id;
              const currentTeam = getTeamLogo(teamId);

              let accessoryColor = Color.SecondaryText;
              let accessoryIcon = Icon.Livestream;
              let accessoryToolTip = "Game Time";

              if (game.type.text === "Goal") {
                accessoryIcon = Icon.BullsEye;
                accessoryColor = Color.Green;
                accessoryToolTip = "Goal";
              }

              if (game.type.text === "Penalty") {
                accessoryIcon = Icon.Hourglass;
                accessoryColor = Color.Orange;
                accessoryToolTip = "Penalty";
              }

              if (game.text.includes("Fighting")) {
                accessoryIcon = Icon.MinusCircle;
                accessoryColor = Color.Red;
                accessoryToolTip = "Fight";
              }

              return (
                <List.Item
                  key={index}
                  title={game.text}
                  icon={currentTeam}
                  subtitle={game.type.text}
                  accessories={[
                    {
                      text: {
                        value: `P${game.period.number} ${game.clock.displayValue ?? "No time found"}`,
                        color: accessoryColor,
                      },
                      tooltip: accessoryToolTip,
                    },
                    { icon: { source: accessoryIcon, tintColor: accessoryColor } },
                  ]}
                  actions={
                    <ActionPanel>
                      <Action
                        title="Refresh"
                        icon={Icon.ArrowClockwise}
                        onAction={playByPlayRevalidate}
                        shortcut={{ modifiers: ["cmd"], key: "r" }}
                      />
                      <Action.OpenInBrowser
                        title="View Game Details on ESPN"
                        url={`${playByPlayEventData?.header.links[0]?.href ?? `https://www.espn.com/${currentLeague}`}`}
                      />
                      <Action.OpenInBrowser
                        title={`View ${game?.header?.competitions?.[0]?.competitors[1]?.team?.displayName ?? "Away"} Team Details`}
                        url={`${playByPlayEventData?.header.competitions?.[0].competitors?.[1].team.links[0].href ?? `https://www.espn.com/${currentLeague}`}`}
                      />

                      <Action.OpenInBrowser
                        title={`View ${game?.header?.competitions?.[0]?.competitors[0]?.team?.displayName ?? "Home"} Team Details`}
                        url={`${playByPlayEventData?.header.competitions?.[0].competitors?.[0].team.links[0].href ?? `https://www.espn.com/${currentLeague}`}`}
                      />
                    </ActionPanel>
                  }
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
            subtitle={`${playByPlayEvents.length} Play${playByPlayEvents.length !== 1 ? "s" : ""}`}
          >
            {playByPlayEvents.length > 0 ? playByPlayEvents : <List.Item title="No plays for this period." />}
          </List.Section>
        </>
      )}
    </List>
  );
}
