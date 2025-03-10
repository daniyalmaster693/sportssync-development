import { Detail, Color, Icon, Action, ActionPanel } from "@raycast/api";
import { useFetch } from "@raycast/utils";

interface NHLGame {
  header: any;
  boxscore: any;
  leaders: any;
  gameInfo: any;
}

export default function Final({ gameId }: { gameId: string }) {
  // Fetch NHL Stats
  const {
    isLoading: nhlScheduleStats,
    data: nhlScoresAndSchedule,
    revalidate,
  } = useFetch<NHLGame>(`https://site.web.api.espn.com/apis/site/v2/sports/hockey/nhl/summary?event=${gameId}`);

  const nhlGame = nhlScoresAndSchedule;

  // Away Team

  const awayTeamShort = nhlGame?.header.competitions?.[0].competitors?.[1]?.team.abbreviation;
  const awayTeamFull = nhlGame?.header.competitions?.[0].competitors?.[1]?.team.displayName;
  const awayTeamLogo = nhlGame?.boxscore.teams?.[0]?.team.logo;

  // Home Team

  const homeTeamShort = nhlGame?.header.competitions?.[0].competitors?.[0]?.team.abbreviation;
  const homeTeamFull = nhlGame?.header.competitions?.[0].competitors?.[0]?.team.displayName;
  const homeTeamLogo = nhlGame?.boxscore.teams?.[1]?.team.logo;

  // Line Scores

  const team1LineScore = parseInt(nhlGame?.header.competitions?.[0].competitors?.[1]?.linescores?.[0]?.displayValue);
  const team1LineScore2 = parseInt(nhlGame?.header.competitions?.[0].competitors?.[1]?.linescores?.[1]?.displayValue);
  const team1LineScore3 = parseInt(nhlGame?.header.competitions?.[0].competitors?.[1]?.linescores?.[2]?.displayValue);
  const team1LineScore4 = team1LineScore + team1LineScore2 + team1LineScore3;

  const team2LineScore = parseInt(nhlGame?.header.competitions?.[0].competitors?.[0]?.linescores?.[0]?.displayValue);
  const team2LineScore2 = parseInt(nhlGame?.header.competitions?.[0].competitors?.[0]?.linescores?.[1]?.displayValue);
  const team2LineScore3 = parseInt(nhlGame?.header.competitions?.[0].competitors?.[0]?.linescores?.[2]?.displayValue);
  const team2LineScore4 = team2LineScore + team2LineScore2 + team2LineScore3;

  const lineScores = `
  \n\n\n

## Line Scores

| Team                               | P1     | P2     | P3     | T     |
|------------------------------------|--------|--------|--------|-------|
| ${awayTeamShort} | ${team1LineScore} | ${team1LineScore2} | ${team1LineScore3} | ${team1LineScore4} |
| ${homeTeamShort} | ${team2LineScore} | ${team2LineScore2} | ${team2LineScore3} | ${team2LineScore4} |

  \n\n\n
  `;

  // Team Leaders

  const team1GoalLeader = nhlGame?.leaders?.[1]?.leaders?.[0]?.leaders?.[0]?.athlete.displayName;
  const team1GoalLeaderValue = nhlGame?.leaders?.[1]?.leaders?.[0]?.leaders?.[0]?.displayValue;
  const team1GoalLeaderHeadshot = nhlGame?.leaders?.[1]?.leaders?.[0]?.leaders?.[0]?.athlete.headshot.href;

  const team1AssistLeader = nhlGame?.leaders?.[1]?.leaders?.[1]?.leaders?.[0]?.athlete.displayName;
  const team1AssistLeaderValue = nhlGame?.leaders?.[1]?.leaders?.[1]?.leaders?.[0]?.displayValue;
  const team1AssistLeaderHeadshot = nhlGame?.leaders?.[1]?.leaders?.[1]?.leaders?.[0]?.athlete.headshot.href;

  const team1PointLeader = nhlGame?.leaders?.[1]?.leaders?.[2]?.leaders?.[0]?.athlete.displayName;
  const team1PointLeaderValue = nhlGame?.leaders?.[1]?.leaders?.[2]?.leaders?.[0]?.displayValue;
  const team1PointLeaderHeadshot = nhlGame?.leaders?.[1]?.leaders?.[2]?.leaders?.[0]?.athlete.headshot.href;

  const team2GoalLeader = nhlGame?.leaders?.[0]?.leaders?.[0]?.leaders?.[0]?.athlete.displayName;
  const team2GoalLeaderValue = nhlGame?.leaders?.[0]?.leaders?.[0]?.leaders?.[0]?.displayValue;
  const team2GoalLeaderHeadshot = nhlGame?.leaders?.[0]?.leaders?.[0]?.leaders?.[0]?.athlete.headshot.href;

  const team2AssistLeader = nhlGame?.leaders?.[0]?.leaders?.[1]?.leaders?.[0]?.athlete.displayName;
  const team2AssistLeaderValue = nhlGame?.leaders?.[0]?.leaders?.[1]?.leaders?.[0]?.displayValue;
  const team2AssistLeaderHeadshot = nhlGame?.leaders?.[0]?.leaders?.[1]?.leaders?.[0]?.athlete.headshot.href;

  const team2PointLeader = nhlGame?.leaders?.[0]?.leaders?.[2]?.leaders?.[0]?.athlete.displayName;
  const team2PointLeaderValue = nhlGame?.leaders?.[0]?.leaders?.[2]?.leaders?.[0]?.displayValue;
  const team2PointLeaderHeadshot = nhlGame?.leaders?.[0]?.leaders?.[2]?.leaders?.[0]?.athlete.headshot.href;

  const teamLeaders = `  
  \n\n\n

  ## ${awayTeamShort} Leaders
  
  - Goals: ${team1GoalLeader} - ${team1GoalLeaderValue} <img src="${team1GoalLeaderHeadshot}" width="22" height="22" /> 
  - Assists: ${team1AssistLeader} - ${team1AssistLeaderValue} <img src="${team1AssistLeaderHeadshot}" width="22" height="22" /> 
  - Points: ${team1PointLeader} - ${team1PointLeaderValue} <img src="${team1PointLeaderHeadshot}" width="22" height="22" />
  
  \n\n\n\n

  ## ${homeTeamShort} Leaders 
  
  - Goals: ${team2GoalLeader} - ${team2GoalLeaderValue} <img src="${team2GoalLeaderHeadshot}" width="22" height="22" />
  - Assists: ${team2AssistLeader} - ${team2AssistLeaderValue} <img src="${team2AssistLeaderHeadshot}" width="22" height="22" /> 
  - Points: ${team2PointLeader} - ${team2PointLeaderValue} <img src="${team2PointLeaderHeadshot}" width="22" height="22" />

  \n\n\n
  `;

  // Team Statistics

  const team1Statistics = nhlGame?.boxscore.teams?.[1]?.statistics;
  const team2Statistics = nhlGame?.boxscore.teams?.[0]?.statistics;

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

  const teamStatistics = `
  \n\n\n

  ## Team Statistics
  
  | ${awayTeamShort} | Stat                | ${homeTeamShort} |
  |------------------|---------------------|------------------|
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

  \n\n\n\n
`;

  // 3 Stars

  const threeStars = nhlGame?.header.competitions?.[0]?.status.featuredAthletes;

  const firstStar = threeStars?.[2]?.athlete.displayName;
  const firstStarHeadshot = threeStars?.[2]?.athlete.headshot.href;

  const secondStar = threeStars?.[3]?.athlete.displayName;
  const secondStarHeadshot = threeStars?.[2]?.athlete.headshot.href;

  const thirdStar = threeStars?.[4]?.athlete.displayName;
  const thirdStarHeadshot = threeStars?.[2]?.athlete.headshot.href;

  const winningGoalie = threeStars?.[1]?.athlete.displayName;
  const winningGoalieHeadshot = threeStars?.[1]?.athlete.headshot.href;

  const losingGoalie = threeStars?.[2]?.athlete.displayName;
  const losingGoalieHeadshot = threeStars?.[2]?.athlete.headshot.href;

  const stars = `  
  \n\n\n

  ## 3 Stars of the Game

  - 1st Star: ${firstStar} <img src="${firstStarHeadshot}" width="22" height="22" /> 
  - 2nd Star: ${secondStar} <img src="${secondStarHeadshot}" width="22" height="22" /> 
  - 3rd Star: ${thirdStar} <img src="${thirdStarHeadshot}" width="22" height="22" />

  \n\n\n\n

  ## Goalies

  - Winning Goalie: ${winningGoalie} <img src="${winningGoalieHeadshot}" width="22" height="22" /> 
  - Losing Goalie: ${losingGoalie} <img src="${losingGoalieHeadshot}" width="22" height="22" />

  \n\n\n\n
`;

  // Team Records

  const team1Record = nhlGame?.header.competitions?.[0]?.competitors?.[1].record?.[0].summary;
  const team2Record = nhlGame?.header.competitions?.[0]?.competitors?.[0].record?.[0].summary;

  // Venue and Game Info

  const attendance = nhlGame?.gameInfo.attendance;
  const venue = nhlGame?.gameInfo.venue.fullName;
  const venueCity = nhlGame?.gameInfo.venue.address.city;
  const venueState = nhlGame?.gameInfo.venue.address.state;
  const venueCountry = nhlGame?.gameInfo.venue.address.country;
  const venueAddress = `${venueCity}, ${venueState}, ${venueCountry}`;

  // Miscellaneous

  const gameStatus = `${nhlGame?.header.competitions?.[0]?.status.type.description}`;
  const gameTime = new Date(nhlGame?.header.competitions?.[0]?.date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const season = `${nhlGame?.header.season.year}`;
  const seasonSeries = nhlGame?.header.competitions?.[0]?.series?.[0]?.summary;

  // Game Score and Title

  const team1Score = nhlGame?.header.competitions?.[0]?.competitors?.[1].score;
  const team2Score = nhlGame?.header.competitions?.[0]?.competitors?.[0].score;

  const gameTitle = `# ${awayTeamShort} ${team1Score} - ${homeTeamShort} ${team2Score} (Final)`;

  // Extra API Stuff

  if (nhlScheduleStats) {
    return <Detail isLoading={true} />;
  }

  if (!nhlScoresAndSchedule) {
    return <Detail markdown="No data found." />;
  }

  return (
    <Detail
      isLoading={nhlScheduleStats}
      markdown={`${gameTitle} ${teamLeaders} \n\n\n ${lineScores} \n\n\n ${teamStatistics} \n\n\n ${stars}`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title={`${awayTeamFull} (${awayTeamShort})`}>
            <Detail.Metadata.TagList.Item text={`${team1Record}`} icon={awayTeamLogo} color={Color.Yellow} />
          </Detail.Metadata.TagList>

          <Detail.Metadata.TagList title={`${homeTeamFull} (${homeTeamShort})`}>
            <Detail.Metadata.TagList.Item text={`${team2Record}`} icon={homeTeamLogo} color={Color.Yellow} />
          </Detail.Metadata.TagList>

          <Detail.Metadata.Separator></Detail.Metadata.Separator>

          <Detail.Metadata.Label title="Game Time" text={`${gameTime}`} />
          <Detail.Metadata.Label title="Game Status" text={`${gameStatus}`} />
          <Detail.Metadata.Label title="Season" text={season} />
          <Detail.Metadata.Label title="Season Series" text={`${seasonSeries}`} />

          <Detail.Metadata.Separator></Detail.Metadata.Separator>

          <Detail.Metadata.Label title="Venue" text={venue} />
          <Detail.Metadata.Label title="Address" text={`${venueAddress}`} />
          <Detail.Metadata.Label title="Attendance" text={`${attendance}`} />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
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
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={revalidate}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          ></Action>
        </ActionPanel>
      }
    />
  );
}
