import { Detail, List, Color, Icon, Action, ActionPanel } from "@raycast/api";
import { useFetch } from "@raycast/utils";

interface Address {
  city: string;
  state: string;
  country: string;
}

interface Venue {
  fullName: string;
  address: Address;
}

interface Team {
  id: string;
  displayName: string;
  logos: { href: string }[];
  links: { href: string }[];
  franchise: Franchise;
}

interface Franchise {
  displayName: string;
  abbreviation: string;
  venue: Venue;
  team: Team;
}

interface TeamStats {
  displayValue: string;
  summary: string;
}

interface StandingsTeam {
  team: Team;
  stats: TeamStats[];
}

interface StandingsData {
  standings: {
    entries: StandingsTeam[];
  };
}

interface Athlete {
  displayName: string;
  position: { displayName: string };
  team: Team;
  links: { href: string }[];
}

interface Injury {
  injuries: any;
  athlete: Athlete;
  status: string;
  details?: { returnDate: string };
}

interface Response {
  season: { displayName: string };
  injuries: Injury[];
}

interface NHLTransaction {
  date: string;
  description: string;
  team: Team;
}

interface DayItems {
  title: string;
  transactions: JSX.Element[];
}

interface Response {
  transactions: NHLTransaction[];
}

export default function TeamInjuries() {
  // Fetch Team Information

  const { isLoading: franchiseStats, data: franchiseData } = useFetch<Franchise>(
    "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/tor",
  );

  const franchise = franchiseData?.team?.franchise;

  const { isLoading, data } = useFetch<StandingsData>(
    "https://site.web.api.espn.com/apis/v2/sports/hockey/nhl/standings?level=1",
  );

  const teamPositionItems = data?.standings?.entries ?? [];

  const teamPosition = teamPositionItems.map((team1, index) => {
    const playoffPosition = Number(team1?.stats[5]?.displayValue ?? "0");

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
    } else if (playoffPosition >= 9 && playoffPosition <= 15) {
      tagColor = Color.Orange;
      tagIcon = Icon.XMarkCircle;
      tagTooltip = "Not in Playoffs";
    } else if (playoffPosition === 16) {
      tagColor = Color.Red;
      tagIcon = Icon.Xmark;
      tagTooltip = "Last in Conference";
    } else {
      tagColor = Color.SecondaryText;
    }

    if (team1.team.id === "21")
      return (
        <List.Item
          key={index}
          title={`${team1?.team?.displayName}`}
          icon={{ source: team1?.team?.logos[0]?.href }}
          accessories={[
            {
              text: `${team1?.stats[3]?.displayValue ?? "0"} GP | ${team1?.stats[21]?.summary ?? "0-0-0"} | ${team1?.stats[7]?.displayValue ?? "0"} pts | ROW ${team1?.stats[16]?.displayValue ?? "0"} | GF ${team1?.stats[9]?.displayValue ?? "0"} | GA ${team1?.stats[8]?.displayValue ?? "0"} | Dif ${team1?.stats[6]?.displayValue ?? "0"}`,
            },
            {
              tag: { value: team1?.stats[5]?.displayValue ?? "0", color: tagColor },
              icon: tagIcon,
              tooltip: tagTooltip,
            },
          ]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                title="View Team Details on ESPN"
                url={`${team1?.team?.links[0]?.href ?? "https://www.espn.com"}`}
              />
            </ActionPanel>
          }
        />
      );
  });

  const {
    isLoading: nhlInjuryStatus,
    data: nhlInjuryData,
    revalidate: injuryRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/injuries");

  const nhlInjuryItems = nhlInjuryData?.injuries.flatMap((injuryItem) => injuryItem.injuries) || [];
  const nhlInjuryArray = nhlInjuryItems?.map((nhlInjury, index) => {
    const articleDate = nhlInjury?.details?.returnDate ?? "";

    if (!articleDate) {
      return null;
    }

    let tagColor = Color.SecondaryText;
    let accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.SecondaryText };

    if (nhlInjury.status === "Day-To-Day") {
      tagColor = Color.Yellow;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Yellow };
    }

    if (nhlInjury.status === "Out") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
    }

    if (nhlInjury.status === "Injured Reserve" || nhlInjury.status === "Questionable") {
      tagColor = Color.Red;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Red };
    }

    if (nhlInjury.status === "Suspension") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.Warning, tintColor: Color.Orange };
    }

    if (nhlInjury.athlete.team.id === "21")
      return (
        <List.Item
          key={index}
          title={`${nhlInjury.athlete.displayName}`}
          subtitle={`${nhlInjury.athlete.position.displayName}`}
          icon={{ source: nhlInjury.athlete.team.logos[0].href }}
          accessories={[
            {
              tag: { value: nhlInjury.status.replace(/-/g, " "), color: tagColor },
              tooltip: "Status",
            },
            { text: articleDate, tooltip: "Est. Return Date" },
            { icon: accessoryIcon },
          ]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                title="View Player Details on ESPN"
                url={`${nhlInjury.athlete.links[0]?.href ?? "https://www.espn.com"}`}
              />
              <Action.OpenInBrowser
                title="View Team Details on ESPN"
                url={`${nhlInjury.athlete.team.links[0]?.href ?? "https://www.espn.com"}`}
              />
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                onAction={injuryRevalidate}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              ></Action>
            </ActionPanel>
          }
        />
      );
  });

  const {
    isLoading: nhlTransactionStatus,
    data: nhlTransactionsData,
    revalidate: transactionRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/transactions?limit=200");

  const nhlTransactionDayItems: DayItems[] = [];
  const nhlTransactions = nhlTransactionsData?.transactions || [];

  const nhlTransactionItems = nhlTransactions?.map((nhlTransaction, index) => {
    const transactionDate = new Date(nhlTransaction.date ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const nhlGameDay = transactionDate;

    let dayItem = nhlTransactionDayItems.find((item) => item.title === nhlGameDay);

    if (!dayItem) {
      dayItem = { title: nhlGameDay, transactions: [] };
      nhlTransactionDayItems.push(dayItem);
    }

    if (nhlTransaction.team.id === "21")
      dayItem.transactions.push(
        <List.Item
          key={index}
          title={`${nhlTransaction?.description ?? "Unknown"}`}
          icon={{ source: nhlTransaction?.team.logos[0]?.href }}
          accessories={[{ icon: Icon.Switch }]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                title="View Team Details on ESPN"
                url={`${nhlTransaction?.team.links[0]?.href ?? "https://www.espn.com"}`}
              />
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                onAction={transactionRevalidate}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              ></Action>
            </ActionPanel>
          }
        />,
      );
  });

  const city = franchise?.venue?.address.city;
  const country = franchise?.venue?.address.country;
  const state = franchise?.venue?.address.state;
  const address = `${city}, ${state}, ${country}`;

  if (!data || !nhlInjuryData || !nhlTransactionsData || !franchiseData) {
    return <Detail markdown="No data found." />;
  }

  if (isLoading || nhlInjuryStatus || nhlTransactionStatus || franchiseStats) {
    return <Detail isLoading={true} />;
  }

  return (
    <>
      <List.Section title="Team Information">
        <List.Item
          title={`${franchise?.displayName} (${franchise?.abbreviation})`}
          icon={{ source: franchiseData?.team?.logos?.[0]?.href }}
          accessories={[
            {
              tag: { value: address, color: Color.Yellow },
              icon: Icon.Map,
              tooltip: "Location",
            },
            {
              tag: { value: franchise?.venue?.fullName, color: Color.Yellow },
              icon: Icon.Building,
              tooltip: "Venue",
            },
          ]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                title="View Team Details on ESPN"
                url={`${franchiseData.team.links[0].href ?? "https://www.espn.com"}`}
              />
            </ActionPanel>
          }
        />
        {teamPosition}
      </List.Section>
      <List.Section title="Injury Status">{nhlInjuryArray}</List.Section>
      {nhlTransactionDayItems.map((dayItem, index) => (
        <List.Section
          key={index}
          title={`Transaction ${dayItem.transactions.length !== 1 ? "s" : ""}`}
          subtitle={`${dayItem.title}`}
        >
          {dayItem.transactions}
        </List.Section>
      ))}
    </>
  );
}
