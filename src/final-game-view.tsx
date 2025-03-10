import { Detail, List, Color, Icon, Action, ActionPanel } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import getPastAndFutureDays from "./utils/getDateRange";
import Final from "./views/finalgameview";

interface Competitor {
  team: {
    abbreviation: string;
    logo: string;
    links: { href: string }[];
  };
  score: string;
}

interface Status {
  type: {
    state: string;
    completed?: boolean;
  };
  period?: number;
  displayClock?: string;
}

interface Competition {
  competitors: Competitor[];
}

interface Game {
  id: string;
  name: string;
  date: string;
  status: Status;
  competitions: Competition[];
  links: { href: string }[];
}

interface DayItems {
  title: string;
  games: JSX.Element[];
}

interface Response {
  events: Game[];
  day: { date: string };
}

export default function scoresAndSchedule() {
  // Fetch NBA Stats

  const dateRange = getPastAndFutureDays(new Date());

  const {
    isLoading: nbaScheduleStats,
    data: nbaScoresAndSchedule,
    revalidate,
  } = useFetch<Response>(`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${dateRange}`);

  const nbaDayItems: DayItems[] = [];
  const nbaGames = nbaScoresAndSchedule?.events || [];

  nbaGames.forEach((nbaGame, index) => {
    const gameDate = new Date(nbaGame.date);
    const nbaGameDay = gameDate.toLocaleDateString([], {
      dateStyle: "medium",
    });

    if (!nbaDayItems.find((nbaDay) => nbaDay.title === nbaGameDay)) {
      nbaDayItems.push({
        title: nbaGameDay,
        games: [],
      });
    }

    const nbaDay = nbaDayItems.find((nbaDay) => nbaDay.title === nbaGameDay);

    const gameTime = new Date(nbaGame.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    let accessoryTitle = gameTime;
    let accessoryColor = Color.SecondaryText;
    let accessoryIcon = { source: Icon.Calendar, tintColor: Color.SecondaryText };
    let accessoryToolTip = "Scheduled";

    const startingSoonInterval = 15 * 60 * 1000;
    const currentDate = new Date();
    const timeUntilGameStarts = gameDate.getTime() - currentDate.getTime();

    if (timeUntilGameStarts <= startingSoonInterval && nbaGame.status.type.state !== "in") {
      accessoryColor = Color.Yellow;
      accessoryIcon = { source: Icon.Warning, tintColor: Color.Yellow };
      accessoryToolTip = "Starting Soon";
    }

    if (nbaGame.status.type.state === "in") {
      accessoryTitle = `${nbaGame.competitions[0].competitors[1].team.abbreviation} ${nbaGame.competitions[0].competitors[1].score} - ${nbaGame.competitions[0].competitors[0].team.abbreviation} ${nbaGame.competitions[0].competitors[0].score}     Q${nbaGame.status.period} ${nbaGame.status.displayClock}`;
      accessoryColor = Color.Green;
      accessoryIcon = { source: Icon.Livestream, tintColor: Color.Green };
      accessoryToolTip = "In Progress";
    }

    if (nbaGame.status.type.state === "post") {
      accessoryTitle = `${nbaGame.competitions[0].competitors[1].team.abbreviation} ${nbaGame.competitions[0].competitors[1].score} - ${nbaGame.competitions[0].competitors[0].team.abbreviation} ${nbaGame.competitions[0].competitors[0].score}`;
      accessoryColor = Color.SecondaryText;
      accessoryIcon = { source: Icon.CheckCircle, tintColor: Color.SecondaryText };
      accessoryToolTip = "Final";
    }

    if (nbaGame.status.type.state === "post" && nbaGame.status.type.completed === false) {
      accessoryTitle = `Postponed`;
      accessoryIcon = { source: Icon.XMarkCircle, tintColor: Color.Orange };
      accessoryColor = Color.Orange;
    }

    nbaDay?.games.push(
      <List.Item
        key={index}
        title={`${nbaGame.name}`}
        icon={{ source: nbaGame.competitions[0].competitors[1].team.logo }}
        accessories={[
          { text: { value: `${accessoryTitle}`, color: accessoryColor }, tooltip: accessoryToolTip },
          { icon: accessoryIcon },
        ]}
        actions={
          <ActionPanel>
            <Action.Push title="View Game Summary" icon={Icon.Sidebar} target={<Final gameId={nbaGame.id} />} />
            <Action.OpenInBrowser title="View Game Details on ESPN" url={`${nbaGame.links[0].href}`} />
            {nbaGame.competitions[0].competitors[1].team.links?.length > 0 && (
              <Action.OpenInBrowser
                title="View Away Team Details"
                url={`${nbaGame.competitions[0].competitors[1].team.links[0].href}`}
              />
            )}

            {nbaGame.competitions[0].competitors[0].team.links?.length > 0 && (
              <Action.OpenInBrowser
                title="View Home Team Details"
                url={`${nbaGame.competitions[0].competitors[0].team.links[0].href}`}
              />
            )}
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={revalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          </ActionPanel>
        }
      />,
    );
  });

  if (nbaScheduleStats) {
    return <Detail isLoading={true} />;
  }

  nbaDayItems.sort((a, b) => {
    const dateA = new Date(a.title);
    const dateB = new Date(b.title);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <List searchBarPlaceholder="Search for your favorite team" isLoading={nbaScheduleStats}>
      {nbaDayItems.map((nbaDay, index) => (
        <List.Section
          key={index}
          title={`${nbaDay.title}`}
          subtitle={`${nbaDay.games.length} Game${nbaDay.games.length !== 1 ? "s" : ""}`}
        >
          {nbaDay.games}
        </List.Section>
      ))}
    </List>
  );
}
