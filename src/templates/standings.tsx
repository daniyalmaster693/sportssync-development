import { Detail, List, Color, Icon, Action, ActionPanel } from "@raycast/api";
import getTeamStandings from "../utils/getStandings";
import sportInfo from "../utils/getSportInfo";
// import Plays from "../views/roster";

export default function DisplayTeamStandings() {
  const { standingsLoading, standingsData, standingsRevalidate } = getTeamStandings();
  const currentLeague = sportInfo.getLeague();

  const items1 = standingsData?.children?.[0]?.standings?.entries || [];
  const items2 = standingsData?.children?.[1]?.standings?.entries || [];

  const conference1 = items1.map((team1, index) => {
    const playoffPosition = Number(team1.stats[7].displayValue);

    let tagColor;
    let tagIcon;
    let tagTooltip;

    if (playoffPosition === 1) {
      tagColor = Color.Yellow;
      tagIcon = Icon.Trophy;
      tagTooltip = "1st in Conference";
    } else if (playoffPosition >= 2 && playoffPosition <= 8) {
      tagColor = Color.Green;
      tagIcon = Icon.Leaderboard;
      tagTooltip = "Playoff Contender";
    } else if (playoffPosition >= 8 && playoffPosition <= 14) {
      tagColor = Color.Orange;
      tagIcon = Icon.XMarkCircle;
      tagTooltip = "Not in Playoffs";
    } else if (playoffPosition === 15) {
      tagColor = Color.Red;
      tagIcon = Icon.Xmark;
      tagTooltip = "Last in Conference";
    } else {
      tagColor = Color.SecondaryText;
    }

    return (
      <List.Item
        key={index}
        title={`${team1.team.displayName}`}
        accessories={[
          {
            text: `${team1.stats[15].displayValue ?? "0-0"} | Pct: ${(Number(team1.stats[13].displayValue) * 100).toFixed(1) ?? "0"}% | PF: ${team1.stats[11].displayValue ?? "0"} | PA: ${team1.stats[10].displayValue ?? "0"} | Dif: ${team1.stats[8].displayValue ?? "0"}`,
          },
          { tag: { value: team1.stats[7].displayValue, color: tagColor }, icon: tagIcon, tooltip: tagTooltip },
        ]}
        icon={{ source: team1.team.logos[0].href }}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser title="View Team Details on ESPN" url={`${team1.team.links[0].href}`} />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={standingsRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  const conference2 = items2.map((team2, index) => {
    const playoffPosition = Number(team2.stats[7].displayValue);

    let tagColor;
    let tagIcon;
    let tagTooltip;

    if (playoffPosition === 1) {
      tagColor = Color.Yellow;
      tagIcon = Icon.Trophy;
      tagTooltip = "1st in Conference";
    } else if (playoffPosition >= 2 && playoffPosition <= 8) {
      tagColor = Color.Green;
      tagIcon = Icon.Leaderboard;
      tagTooltip = "Playoff Contender";
    } else if (playoffPosition >= 8 && playoffPosition <= 14) {
      tagColor = Color.Orange;
      tagIcon = Icon.XMarkCircle;
      tagTooltip = "Not in Playoffs";
    } else if (playoffPosition === 15) {
      tagColor = Color.Red;
      tagIcon = Icon.Xmark;
      tagTooltip = "Last in Conference";
    } else {
      tagColor = Color.SecondaryText;
    }

    return (
      <List.Item
        key={index}
        title={`${team2.team.displayName}`}
        accessories={[
          {
            text: `${team2.stats[15].displayValue ?? "0-0"} | Pct: ${(Number(team2.stats[13].displayValue) * 100).toFixed(1) ?? "0"}% | PF: ${team2.stats[11].displayValue ?? "0"} | PA: ${team2.stats[10].displayValue ?? "0"} | Dif: ${team2.stats[8].displayValue ?? "0"}`,
          },
          { tag: { value: team2.stats[7].displayValue, color: tagColor }, icon: tagIcon, tooltip: tagTooltip },
        ]}
        icon={{ source: team2.team.logos[0].href }}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser title="View Team Details on ESPN" url={`${team2.team.links[0].href}`} />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={standingsRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  if (standingsLoading) {
    return <Detail isLoading={true} />;
  }

  conference1.reverse();
  conference2.reverse();

  const conferenceTitle1 = standingsData?.children[0]?.name;
  const conferenceTitle2 = standingsData?.children[1]?.name;

  return (
    <List>
      <List.Section title={`${conferenceTitle1}`}>{conference1}</List.Section>
      <List.Section title={`${conferenceTitle2}`}>{conference2}</List.Section>
    </List>
  );
}
