import { Detail, Icon, Action, ActionPanel } from "@raycast/api";
import sportInfo from "../utils/getSportInfo";
import getGameSummary from "../utils/getGameSummary";
import Plays from "./playbyplay";
import TeamDetail from "../views/teamDetail";

interface Play {
  type: {
    text: string;
  };
  text: string;
  team: {
    id: string;
    displayName: string;
    logo: string;
  };
  period: {
    number: number;
  };
  clock: {
    displayValue: string;
  };
}

export default function GameSummary({ gameId }: { gameId: string }) {
  // Fetch Info

  const { summaryData, summaryLoading, summaryRevalidate } = getGameSummary({ gameId });
  const game = summaryData;

  // Sport Info

  const currentLeague = sportInfo.getLeague();
  const currentSport = sportInfo.getSport();

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

  const awayTeamFull = game?.header.competitions?.[0].competitors?.[1]?.team.displayName;
  const awayTeamShort = game?.header.competitions?.[0].competitors?.[1]?.team.abbreviation;
  const awayTeamLogo = game?.boxscore.teams?.[0]?.team.logo;
  const awayTeamId = game?.boxscore.teams?.[0]?.team.id ?? "";

  // Home Team

  const homeTeamFull = game?.header.competitions?.[0].competitors?.[0]?.team.displayName;
  const homeTeamShort = game?.header.competitions?.[0].competitors?.[0]?.team.abbreviation;
  const homeTeamLogo = game?.boxscore.teams?.[1]?.team.logo;
  const homeTeamId = game?.boxscore.teams?.[1]?.team.id ?? "";

  // Scoring Summary

  const majorPlays: Play[] = [];
  const plays = game?.plays;

  plays?.forEach((play) => {
    if (play?.type?.text === "Goal") {
      majorPlays.push(play);
    }
  });

  const uniquePeriods = Array.from(new Set(majorPlays?.map((play) => play?.period?.number))).sort();
  let scoringSummary = `\n\n## Scoring Summary\n`;

  if (majorPlays.length === 0) {
    scoringSummary += `\nNo goals found.\n`;
  } else {
    uniquePeriods.forEach((periodNumber) => {
      const periodPlays = majorPlays?.filter((play) => play?.period?.number === periodNumber);
      scoringSummary += `\n### ${period}${periodNumber}\n`;
      scoringSummary += periodPlays
        .map(
          (play) =>
            `\n${
              play.team.id === awayTeamId
                ? `- <img src="${awayTeamLogo}" width="22" height="22" />`
                : play.team.id === homeTeamId
                  ? `- <img src="${homeTeamLogo}" width="22" height="22" />`
                  : ""
            } ${play?.clock?.displayValue ?? "Unknown time"} - ${play?.text ?? "Unknown event"}`,
        )
        .join("\n");
      scoringSummary += `\n`;
    });
  }

  // 3 Stars

  const threeStars = game?.header.competitions?.[0]?.status.featuredAthletes;

  const firstStar = threeStars?.[2]?.athlete.displayName;
  const firstStarHeadshot = threeStars?.[2]?.athlete.headshot.href;

  const secondStar = threeStars?.[3]?.athlete.displayName;
  const secondStarHeadshot = threeStars?.[2]?.athlete.headshot.href;

  const thirdStar = threeStars?.[4]?.athlete.displayName;
  const thirdStarHeadshot = threeStars?.[2]?.athlete.headshot.href;

  const stars = `  
&nbsp;
  
## 3 Stars of the Game
  
- 1st Star: ${firstStar} <img src="${firstStarHeadshot}" width="22" height="22" /> 
- 2nd Star: ${secondStar} <img src="${secondStarHeadshot}" width="22" height="22" /> 
- 3rd Star: ${thirdStar} <img src="${thirdStarHeadshot}" width="22" height="22" />
  
&nbsp;
  `;

  // Team Statistics

  const team1Statistics = game?.boxscore.teams?.[1]?.statistics;
  const team2Statistics = game?.boxscore.teams?.[0]?.statistics;

  const team1Shots = team1Statistics?.[3]?.displayValue;
  const team1BlockedShots = team1Statistics?.[0]?.displayValue;
  const team1Hits = team1Statistics?.[1]?.displayValue;
  const team1Takeaways = team1Statistics?.[2]?.displayValue;
  const team1Giveaways = team1Statistics?.[11]?.displayValue;
  const team1PowerPlays = team1Statistics?.[5]?.displayValue;
  const team1PowerPlayGoals = team1Statistics?.[4]?.displayValue;
  const team1Penalties = team1Statistics?.[12]?.displayValue;
  const team1PenaltyMinutes = team1Statistics?.[13]?.displayValue;
  const team1Faceoffs = team1Statistics?.[9]?.displayValue;
  const team1FaceoffPercentage = team1Statistics?.[10]?.displayValue;
  const team1Record = game?.header.competitions?.[0]?.competitors?.[1].record?.[0].summary;

  const team2Shots = team2Statistics?.[3]?.displayValue;
  const team2BlockedShots = team1Statistics?.[0]?.displayValue;
  const team2Hits = team2Statistics?.[1]?.displayValue;
  const team2Takeaways = team2Statistics?.[2]?.displayValue;
  const team2Giveaways = team2Statistics?.[11]?.displayValue;
  const team2PowerPlays = team2Statistics?.[5]?.displayValue;
  const team2PowerPlayGoals = team2Statistics?.[4]?.displayValue;
  const team2Penalties = team2Statistics?.[12]?.displayValue;
  const team2PenaltyMinutes = team2Statistics?.[13]?.displayValue;
  const team2Faceoffs = team2Statistics?.[9]?.displayValue;
  const team2FaceoffPercentage = team2Statistics?.[10]?.displayValue;
  const team2Record = game?.header.competitions?.[0]?.competitors?.[0].record?.[0].summary;

  const teamStatistics = `
  &nbsp;

## Team Statistics

| ${awayTeamShort} | Stat                | ${homeTeamShort} |
|------------------|---------------------|------------------|
| ${team1Record} | Record | ${team2Record} |
| ${team1Shots} | Shots | ${team2Shots} |
| ${team1BlockedShots} | Blocked Shots | ${team2BlockedShots} |
| ${team1Hits} | Hits | ${team2Hits} |
| ${team1Takeaways}| Takeaways | ${team2Takeaways}|
| ${team1Giveaways}| Giveaways | ${team2Giveaways}|
| ${team1PowerPlays} | Power Plays | ${team2PowerPlays} |
| ${team1PowerPlayGoals} | PPG | ${team2PowerPlayGoals} |
| ${team1Penalties} | Penalties | ${team2Penalties} |
| ${team1PenaltyMinutes} | PIM | ${team2PenaltyMinutes} |
| ${team1Faceoffs} | Faceoffs Won | ${team2Faceoffs} |
| ${team1FaceoffPercentage} % | Faceoff % | ${team2FaceoffPercentage} % |

  &nbsp;
  `;

  // Game Score and Title

  const team1Score = game?.header.competitions?.[0]?.competitors?.[1].score;
  const team2Score = game?.header.competitions?.[0]?.competitors?.[0].score;
  const gameTitle = `# ${awayTeamShort} ${team1Score} - ${homeTeamShort} ${team2Score} (Final)`;

  // Extra API Stuff

  if (summaryLoading) {
    return <Detail isLoading={true} />;
  }

  if (!summaryData) {
    return <Detail markdown="No data found." />;
  }

  return (
    <Detail
      isLoading={summaryLoading}
      markdown={`${gameTitle} &nbsp; ${scoringSummary} &nbsp; ${stars} &nbsp; ${teamStatistics}`}
      actions={
        <ActionPanel>
          <Action.Push title="View Play by Play" icon={Icon.Stopwatch} target={<Plays gameId={gameId} />} />
          {currentLeague !== "f1" && (
            <>
              <Action.Push
                title={`View ${awayTeamFull ?? "Away"} Team Details`}
                icon={Icon.List}
                target={<TeamDetail teamId={awayTeamId} />}
              />
              <Action.Push
                title={`View ${homeTeamFull ?? "Home"} Team Details`}
                icon={Icon.List}
                target={<TeamDetail teamId={homeTeamId} />}
              />
            </>
          )}
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={summaryRevalidate}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          ></Action>
        </ActionPanel>
      }
    />
  );
}
