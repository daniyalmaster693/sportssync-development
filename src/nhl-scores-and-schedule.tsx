import { Detail, List, Color, Icon, Action, ActionPanel } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";
import getPastAndFutureDays from "./utils/getDateRange";

interface Competitor {
  team: {
    abbreviation: string;
    displayName: string;
    logo: string;
    links: { href: string }[];
  };
  score: string;
  records?: { summary: string }[];
  probables?: { athlete: { displayName: string; headshot: string } }[];
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
  type: { id: number };
  venue: {
    fullName: string;
    indoor: boolean;
    address: {
      city: string;
      state: string;
      country: string;
    };
  };
  tickets: [
    {
      summary: string;
    },
  ];
  season: {
    year: string;
    slug: string;
  };
}

interface Game {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: Status;
  competitions: Competition[];
  links: { href: string }[];
  season: {
    year: string;
    slug: string;
  };
  displayName: string;
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
  // Fetch NHL Stats

  const dateRange = getPastAndFutureDays(new Date());

  const {
    isLoading: nhlScheduleStats,
    data: nhlScoresAndSchedule,
    revalidate,
  } = useFetch<Response>(`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${dateRange}`);

  const [showDetail, setShowDetail] = useState(false);

  const nhlDayItems: DayItems[] = [];
  const nhlGames = nhlScoresAndSchedule?.events || [];

  nhlGames?.forEach((nhlGame, index) => {
    const gameDate = new Date(nhlGame?.date);
    const nhlGameDay = gameDate?.toLocaleDateString([], {
      dateStyle: "medium",
    });

    if (!nhlDayItems?.find((nhlDay) => nhlDay?.title === nhlGameDay)) {
      nhlDayItems?.push({
        title: nhlGameDay,
        games: [],
      });
    }

    const nhlDay = nhlDayItems?.find((nhlDay) => nhlDay?.title === nhlGameDay);

    const gameTime = new Date(nhlGame?.date).toLocaleTimeString([], {
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

    if (timeUntilGameStarts <= startingSoonInterval && nhlGame?.status?.type?.state === "pre") {
      accessoryColor = Color.Yellow;
      accessoryIcon = { source: Icon.Warning, tintColor: Color.Yellow };
      accessoryToolTip = "Starting Soon";
    }

    if (nhlGame?.status?.type?.state === "in") {
      accessoryTitle = `${nhlGame?.competitions[0]?.competitors[1]?.team.abbreviation} ${nhlGame?.competitions[0]?.competitors[1]?.score} - ${nhlGame?.competitions[0]?.competitors[0]?.team?.abbreviation} ${nhlGame?.competitions[0]?.competitors[0]?.score}     P${nhlGame?.status?.period} ${nhlGame?.status?.displayClock}`;
      accessoryColor = Color.Green;
      accessoryIcon = { source: Icon.Livestream, tintColor: Color.Green };
      accessoryToolTip = "In Progress";
    }

    if (nhlGame?.status?.type?.state === "post") {
      accessoryTitle = `${nhlGame?.competitions[0]?.competitors[1]?.team?.abbreviation} ${nhlGame?.competitions[0]?.competitors[1]?.score} - ${nhlGame?.competitions[0]?.competitors[0]?.team?.abbreviation} ${nhlGame?.competitions[0]?.competitors[0]?.score}`;
      accessoryColor = Color.SecondaryText;
      accessoryIcon = { source: Icon.CheckCircle, tintColor: Color.SecondaryText };
      accessoryToolTip = "Final";
    }

    if (nhlGame?.status?.type?.state === "post" && nhlGame?.status?.type?.completed === false) {
      accessoryTitle = `Postponed`;
      accessoryIcon = { source: Icon.XMarkCircle, tintColor: Color.Orange };
      accessoryColor = Color.Orange;
    }

    let season = nhlGame.season.year;
    let seasonType = nhlGame.season.slug;

    function toTitleCase(str: string): string {
      return str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }

    let formattedSeason = toTitleCase(season.toString());
    let formattedSeasonType = toTitleCase(seasonType.replace(/-/g, " "));

    let venueCity = nhlGame?.competitions[0]?.venue?.address?.city ?? "Unknown";
    let venueState = nhlGame?.competitions[0]?.venue?.address?.state ?? "Unknown";
    let venueCountry = nhlGame?.competitions[0]?.venue?.address?.country ?? "Unknown";
    let venueAddress = `${venueCity}, ${venueState}, ${venueCountry}`;

    nhlDay?.games.push(
      <List.Item
        key={index}
        title={nhlGame?.name?.replace(" at ", " vs ")}
        icon={{ source: nhlGame?.competitions[0]?.competitors[1]?.team?.logo }}
        accessories={
          !showDetail
            ? [
                {
                  text: { value: `${accessoryTitle ?? "No Date Found"}`, color: accessoryColor },
                  tooltip: accessoryToolTip ?? "Unknown",
                },
                { icon: accessoryIcon },
              ]
            : []
        }
        detail={
          showDetail ? (
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.TagList
                    title={`${nhlGame?.competitions?.[0]?.competitors?.[1]?.team.displayName} (${nhlGame?.competitions?.[0]?.competitors?.[1]?.team?.abbreviation})`}
                  >
                    <List.Item.Detail.Metadata.TagList.Item
                      text={nhlGame?.competitions?.[0]?.competitors?.[1]?.records?.[0]?.summary}
                      icon={nhlGame?.competitions?.[0]?.competitors?.[1]?.team?.logo}
                      color={Color.Yellow}
                    />
                  </List.Item.Detail.Metadata.TagList>

                  <List.Item.Detail.Metadata.TagList
                    title={`${nhlGame?.competitions?.[0]?.competitors?.[0]?.team.displayName} (${nhlGame?.competitions?.[0]?.competitors?.[0]?.team?.abbreviation})`}
                  >
                    <List.Item.Detail.Metadata.TagList.Item
                      icon={nhlGame?.competitions?.[0]?.competitors?.[0]?.team?.logo}
                      text={nhlGame?.competitions?.[0]?.competitors?.[0]?.records?.[0]?.summary}
                      color={Color.Yellow}
                    />
                  </List.Item.Detail.Metadata.TagList>

                  <List.Item.Detail.Metadata.Separator />

                  <List.Item.Detail.Metadata.Label
                    title={`${nhlGame?.competitions?.[0]?.competitors?.[1]?.team?.abbreviation} Starting Goalie`}
                    text={`${nhlGame?.competitions?.[0]?.competitors?.[1]?.probables?.[0]?.athlete?.displayName}`}
                    icon={nhlGame?.competitions?.[0]?.competitors?.[1]?.probables?.[0]?.athlete?.headshot}
                  />
                  <List.Item.Detail.Metadata.Label
                    title={`${nhlGame?.competitions?.[0]?.competitors?.[0]?.team?.abbreviation} Starting Goalie`}
                    text={`${nhlGame?.competitions?.[0]?.competitors?.[0]?.probables?.[0]?.athlete?.displayName}`}
                    icon={nhlGame?.competitions?.[0]?.competitors?.[0]?.probables?.[0]?.athlete?.headshot}
                  />

                  <List.Item.Detail.Metadata.Separator />

                  <List.Item.Detail.Metadata.Label title="Season" text={formattedSeason} />
                  <List.Item.Detail.Metadata.TagList title="Season type">
                    <List.Item.Detail.Metadata.TagList.Item text={formattedSeasonType} color={Color.Green} />
                  </List.Item.Detail.Metadata.TagList>

                  <List.Item.Detail.Metadata.Separator />

                  <List.Item.Detail.Metadata.Label title="Game Time" text={`${gameTime}`} />

                  <List.Item.Detail.Metadata.Label
                    title="Tickets"
                    text={`${nhlGame?.competitions[0]?.tickets?.[0]?.summary.toString()}`}
                  />

                  <List.Item.Detail.Metadata.Label title="Venue" text={nhlGame.competitions[0].venue.fullName} />
                  <List.Item.Detail.Metadata.Label title="Address" text={`${venueAddress}`} />

                  <List.Item.Detail.Metadata.TagList title="Indoor Venue">
                    <List.Item.Detail.Metadata.TagList.Item
                      text={toTitleCase(nhlGame.competitions[0].venue.indoor.toString())}
                      color={Color.Green}
                    />
                  </List.Item.Detail.Metadata.TagList>
                </List.Item.Detail.Metadata>
              }
            />
          ) : null
        }
        actions={
          <ActionPanel>
            <Action title="Toggle Detailed View" icon={Icon.Sidebar} onAction={() => setShowDetail(!showDetail)} />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={revalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
            <Action.OpenInBrowser
              title="View Game Details on ESPN"
              url={`${nhlGame?.links[0]?.href ?? "https://www.espn.com"}`}
            />
            {nhlGame?.competitions[0]?.competitors[1]?.team.links?.length > 0 && (
              <Action.OpenInBrowser
                title="View Away Team Details"
                url={nhlGame?.competitions[0]?.competitors[1]?.team?.links[0]?.href ?? "https://www.espn.com"}
              />
            )}
            {nhlGame.competitions[0]?.competitors[0]?.team?.links?.length > 0 && (
              <Action.OpenInBrowser
                title="View Home Team Details"
                url={nhlGame?.competitions[0]?.competitors[0]?.team?.links[0]?.href ?? "https://www.espn.com"}
              />
            )}
          </ActionPanel>
        }
      />,
    );
  });

  if (nhlScheduleStats) {
    return <Detail isLoading={true} />;
  }

  if (!nhlScoresAndSchedule) {
    return <Detail markdown="No data found." />;
  }

  nhlDayItems.sort((a, b) => {
    const dateA = new Date(a.title);
    const dateB = new Date(b.title);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <List
      isShowingDetail={showDetail}
      searchBarPlaceholder="Search for your favorite team"
      isLoading={nhlScheduleStats}
    >
      {nhlDayItems?.map((nhlDay, index) => (
        <List.Section
          key={index}
          title={`${nhlDay?.title}`}
          subtitle={`${nhlDay?.games?.length} Game${nhlDay?.games?.length !== 1 ? "s" : ""}`}
        >
          {nhlDay?.games}
        </List.Section>
      ))}
    </List>
  );
}
