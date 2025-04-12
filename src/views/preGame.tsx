import { Detail, Color, Icon, Action, ActionPanel } from "@raycast/api";
import sportInfo from "../utils/getSportInfo";
import getPreGameDetails from "../utils/getPreGameDetails";

export default function PreGame({ gameId }: { gameId: string }) {
  // Fetch Info

  const { preGameData, preGameLoading, preGameRevalidate } = getPreGameDetails({ gameId });
  const game = preGameData;

  // Sport Info

  const currentLeague = sportInfo.getLeague();
  const currentSport = sportInfo.getSport();
  const leagueLogo = `https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/${currentLeague}.png&w=100&h=100&transparent=true`;

  // Period Related Info

  let period = "P";

  if (currentSport === "hockey") {
    period = "P";
  }

  if (currentSport === "basketball") {
    period = "Q";
  }

  if (currentSport === "football") {
    period = "Q";
  }

  if (currentSport === "baseball") {
    period = "";
  }

  if (currentSport === "soccer") {
    period = "";
  }

  // Away Team

  const awayTeamFull = game?.header?.competitions?.[0].competitors?.[1]?.team?.displayName ?? "Unknown";
  const awayTeamShort = game?.header?.competitions?.[0].competitors?.[1]?.team?.abbreviation ?? "Unknown";
  const awayTeamLogo = game?.boxscore?.teams?.[0]?.team?.logo ?? leagueLogo;
  const awayRecord = game?.header?.competitions?.[0]?.competitors?.[1].record?.[0]?.summary ?? "Unknown";

  // Home Team

  const homeTeamFull = game?.header?.competitions?.[0]?.competitors?.[0]?.team?.displayName ?? "Unknown";
  const homeTeamShort = game?.header?.competitions?.[0]?.competitors?.[0]?.team?.abbreviation ?? "Unknown";
  const homeTeamLogo = game?.boxscore?.teams?.[1]?.team?.logo ?? leagueLogo;
  const homeRecord = game?.header?.competitions?.[0]?.competitors?.[0]?.record?.[0]?.summary ?? "Unknown";

  // Injuries

  const homeTeamInjuries = game?.injuries?.[0]?.injuries;
  const awayTeamInjuries = game?.injuries?.[1]?.injuries;

  const homeTeamInjuriesFormatted = homeTeamInjuries
    ?.map(
      (injury) =>
        `- <img src="${injury?.athlete?.headshot?.href ?? leagueLogo}" width="22" height="22" /> ${injury?.athlete?.displayName ?? "Unknown"} - ${injury?.status ?? "Unknown"}`,
    )
    .join("\n");

  const awayTeamInjuriesFormatted = awayTeamInjuries
    ?.map(
      (injury) =>
        `- <img src="${injury?.athlete?.headshot?.href ?? leagueLogo}" width="22" height="22" /> ${injury?.athlete?.displayName ?? "Unknown"} - ${injury?.status ?? "Unknown"}`,
    )
    .join("\n");

  const injurySection = `
## ${homeTeamShort} Injuries

${homeTeamInjuriesFormatted || "No injuries reported."}

## ${awayTeamShort} Injuries

${awayTeamInjuriesFormatted || "No injuries reported."}

&nbsp;
`;

  // Scoring Leaders

  const homeTeamGoalLeader = game?.leaders?.[0]?.leaders?.[0]?.leaders?.[0]?.athlete?.displayName ?? "Unknown";
  const homeTeamGoalLeaderHeadShot =
    game?.leaders?.[0]?.leaders?.[0]?.leaders?.[0]?.athlete?.headshot?.href ?? leagueLogo;
  const homeTeamGoalLeaderGoals = game?.leaders?.[0]?.leaders?.[0]?.leaders?.[0]?.statistics?.[0]?.value ?? "Unknown";

  const homeTeamAssistLeader = game?.leaders?.[0]?.leaders?.[1]?.leaders?.[0]?.athlete?.displayName ?? "Unknown";
  const homeTeamAssistLeaderHeadShot =
    game?.leaders?.[0]?.leaders?.[1]?.leaders?.[0]?.athlete?.headshot?.href ?? leagueLogo;
  const homeTeamAssistLeaderAssists =
    game?.leaders?.[0]?.leaders?.[1]?.leaders?.[0]?.statistics?.[0]?.value ?? "Unknown";

  const homeTeamPointLeader = game?.leaders?.[0]?.leaders?.[2]?.leaders?.[0]?.athlete?.displayName ?? "Unknown";
  const homeTeamPointLeaderHeadShot =
    game?.leaders?.[0]?.leaders?.[2]?.leaders?.[0]?.athlete?.headshot?.href ?? leagueLogo;
  const homeTeamPointLeaderPoints = game?.leaders?.[0]?.leaders?.[2]?.leaders?.[0]?.statistics?.[0]?.value ?? "Unknown";

  const awayTeamGoalLeader = game?.leaders?.[1]?.leaders?.[0]?.leaders?.[0]?.athlete?.displayName ?? "Unknown";
  const awayTeamGoalLeaderHeadShot =
    game?.leaders?.[1]?.leaders?.[0]?.leaders?.[0]?.athlete?.headshot?.href ?? leagueLogo;
  const awayTeamGoalLeaderGoals = game?.leaders?.[1]?.leaders?.[0]?.leaders?.[0]?.statistics?.[0]?.value ?? "Unknown";

  const awayTeamAssistLeader = game?.leaders?.[1]?.leaders?.[1]?.leaders?.[0]?.athlete?.displayName ?? "Unknown";
  const awayTeamAssistLeaderHeadShot =
    game?.leaders?.[1]?.leaders?.[1]?.leaders?.[0]?.athlete?.headshot?.href ?? leagueLogo;
  const awayTeamAssistLeaderAssists =
    game?.leaders?.[1]?.leaders?.[1]?.leaders?.[0]?.statistics?.[0]?.value ?? "Unknown";

  const awayTeamPointLeader = game?.leaders?.[1]?.leaders?.[2]?.leaders?.[0]?.athlete?.displayName ?? "Unknown";
  const awayTeamPointLeaderHeadShot =
    game?.leaders?.[1]?.leaders?.[2]?.leaders?.[0]?.athlete?.headshot?.href ?? leagueLogo;
  const awayTeamPointLeaderPoints = game?.leaders?.[1]?.leaders?.[2]?.leaders?.[0]?.statistics?.[0]?.value ?? "Unknown";

  const scoringLeaders = `
  ## ${homeTeamShort} Scoring Leaders
    
  - <img src="${homeTeamGoalLeaderHeadShot ?? leagueLogo}" width="22" height="22" /> ${homeTeamGoalLeader} - ${homeTeamGoalLeaderGoals} Goals
  - <img src="${homeTeamAssistLeaderHeadShot ?? leagueLogo}" width="22" height="22" /> ${homeTeamAssistLeader} - ${homeTeamAssistLeaderAssists} Assists
  - <img src="${homeTeamPointLeaderHeadShot ?? leagueLogo}" width="22" height="22" /> ${homeTeamPointLeader} - ${homeTeamPointLeaderPoints} Points
    
  ## ${awayTeamShort} Scoring Leaders
    
  - <img src="${awayTeamGoalLeaderHeadShot ?? leagueLogo}" width="22" height="22" /> ${awayTeamGoalLeader} - ${awayTeamGoalLeaderGoals} Goals
  - <img src="${awayTeamAssistLeaderHeadShot ?? leagueLogo}" width="22" height="22" /> ${awayTeamAssistLeader} - ${awayTeamAssistLeaderAssists} Assists
  - <img src="${awayTeamPointLeaderHeadShot ?? leagueLogo}" width="22" height="22" /> ${awayTeamPointLeader} - ${awayTeamPointLeaderPoints} Points
    
  &nbsp;
    `;

  // Team Statistics

  const team1Statistics = game?.boxscore?.teams?.[1]?.statistics;
  const team2Statistics = game?.boxscore?.teams?.[0]?.statistics;

  const team1Record = game?.header?.competitions?.[0]?.competitors?.[1]?.record?.[0]?.summary ?? "Unknown";
  const team1Goals = team1Statistics?.[5]?.displayValue ?? "Unknown";
  const team1AverageGoalsAgainst = team1Statistics?.[0]?.displayValue ?? "Unknown";
  const team1Shots = team1Statistics?.[6]?.displayValue ?? "Unknown";
  const team1PowerPlayGoals = team1Statistics?.[7]?.displayValue ?? "Unknown";
  const team1PowerPlayPCT = team1Statistics?.[7]?.displayValue ?? "Unknown";
  const team1PenaltyMinutes = team1Statistics?.[10]?.displayValue ?? "Unknown";
  const team1PenaltyPCT = team1Statistics?.[2]?.displayValue ?? "Unknown";

  const team2Record = game?.header?.competitions?.[0]?.competitors?.[0]?.record?.[0]?.summary ?? "Unknown";
  const team2Goals = team2Statistics?.[5]?.displayValue ?? "Unknown";
  const team2AverageGoalsAgainst = team2Statistics?.[0]?.displayValue ?? "Unknown";
  const team2Shots = team2Statistics?.[6]?.displayValue ?? "Unknown";
  const team2PowerPlayGoals = team2Statistics?.[7]?.displayValue ?? "Unknown";
  const team2PowerPlayPCT = team2Statistics?.[7]?.displayValue ?? "Unknown";
  const team2PenaltyMinutes = team2Statistics?.[10]?.displayValue ?? "Unknown";
  const team2PenaltyPCT = team2Statistics?.[2]?.displayValue ?? "Unknown";

  const teamStatistics = `
  &nbsp;

## Team Statistics

| ${awayTeamShort} | Stat                | ${homeTeamShort} |
|------------------|---------------------|------------------|
| ${team1Record} | Record | ${team2Record} |
| ${team1Goals} | GF/G | ${team2Goals} |
| ${team1AverageGoalsAgainst} | GAA | ${team2AverageGoalsAgainst} |
| ${team1Shots} | SF/G | ${team2Shots} |
| ${team1PowerPlayGoals} | PPG | ${team2PowerPlayGoals} |
| ${team1PowerPlayPCT} | PP % | ${team2PowerPlayPCT} |
| ${team1PenaltyMinutes} | PIM | ${team2PenaltyMinutes} |
| ${team1PenaltyPCT} | PK % | ${team2PenaltyPCT} |

  &nbsp;
  `;

  // Game Score and Title

  const gameTime = new Date(game?.header?.competitions?.[0]?.date ?? "Unknown").toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const gameTitle = `# ${awayTeamFull} vs ${homeTeamFull} - ${gameTime}`;

  // Metadata

  const venue = game?.gameInfo?.venue?.fullName ?? "Unknown";
  const venueCity = game?.gameInfo?.venue?.address?.city ?? "Unknown";
  const venueState = game?.gameInfo?.venue?.address?.state ?? "Unknown";
  const venueCountry = game?.gameInfo?.venue?.address?.country ?? "Unknown";
  const venueAddress = `${venueCity}, ${venueState}, ${venueCountry}`;
  const ticketPrice = game?.ticketsInfo?.seatSituation?.summary ?? "Unknown";

  // Extra API Stuff

  if (preGameLoading) {
    return <Detail isLoading={true} />;
  }

  if (!preGameData) {
    return <Detail markdown="No data found." />;
  }

  return (
    <Detail
      isLoading={preGameLoading}
      markdown={`${gameTitle} ${scoringLeaders} &nbsp; ${injurySection} &nbsp; ${teamStatistics}`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Home Team Record">
            <Detail.Metadata.TagList.Item text={`${homeRecord}`} icon={homeTeamLogo} color={Color.Yellow} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.TagList title="Away Team Record">
            <Detail.Metadata.TagList.Item text={`${awayRecord}`} icon={awayTeamLogo} color={Color.Yellow} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Venue" text={`${venue}`} />
          <Detail.Metadata.Label title="Address" text={`${venueAddress}`} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Tickets" icon={Icon.Ticket} text={`${ticketPrice}`} />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title="View Game Details on ESPN"
            url={`${preGameData?.header?.links[0]?.href ?? `https://www.espn.com/${currentLeague}`}`}
          />
          <Action.OpenInBrowser
            title="View Away Team Details"
            url={
              preGameData?.header?.competitions?.[0]?.competitors?.[1]?.team?.links?.[0]?.href ??
              `https://www.espn.com/${currentLeague}`
            }
          />

          <Action.OpenInBrowser
            title="View Home Team Details"
            url={
              preGameData?.header?.competitions?.[0]?.competitors?.[0]?.team?.links?.[0]?.href ??
              `https://www.espn.com/${currentLeague}`
            }
          />
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={preGameRevalidate}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          ></Action>
        </ActionPanel>
      }
    />
  );
}
