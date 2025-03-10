import { Detail, List, Icon, Color, Action, ActionPanel } from "@raycast/api";
import { useFetch } from "@raycast/utils";

interface Player {
  displayName: string;
  displayWeight: string;
  displayHeight: string;
  age: number;
  headshot?: {
    href: string;
  };
  jersey: string;
  injuries?: {
    status: string;
  }[];
  links: {
    href: string;
  }[];
}

interface Coach {
  firstName: string;
  lastName: string;
  experience?: string;
}

interface Athlete {
  items: Player[];
  position: string;
}

interface NHLGame {
  coach?: Coach[];
  athletes: Athlete[];
}

export default function Plays({ gameId }: { gameId: string }) {
  // Fetch NHL Stats
  const {
    isLoading: nhlScheduleStats,
    data: nhlScoresAndSchedule,
    revalidate,
  } = useFetch<NHLGame>(`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${gameId}/roster`);

  // Quick Access Variables

  const nhlGame = nhlScoresAndSchedule;
  const coachFirstName = nhlGame?.coach?.[0]?.firstName ?? "Unknown";
  const coachLastName = nhlGame?.coach?.[0]?.lastName ?? "Unknown";
  const headCoach = `${coachFirstName} ${coachLastName}`;

  const centers = nhlGame?.athletes[0].items;
  const leftWings = nhlGame?.athletes[1].items;
  const rightWings = nhlGame?.athletes[2].items;
  const defensemen = nhlGame?.athletes[3].items;
  const goalies = nhlGame?.athletes[4].items;

  // Forwards

  const centersArray = centers?.map((player1, index) => {
    const name = player1.displayName;
    const weight = player1.displayWeight;
    const height = player1.displayHeight;
    const formattedHeight = height?.replace(/\s+/g, "");
    const age = player1.age;
    const headshot = player1.headshot?.href ?? Icon.Person;
    const jersey = player1.jersey;
    const health = player1.injuries?.[0]?.status;

    let healthIcon;
    let healthTooltip;

    if (!health) {
      healthIcon = { source: Icon.Heart, tintColor: Color.Green };
      healthTooltip = "Healthy";
    } else {
      healthIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
      healthTooltip = "Injured";
    }

    return (
      <List.Item
        key={index}
        title={name}
        icon={{ source: headshot }}
        subtitle={`${age} Years Old`}
        accessories={[
          { tag: { value: jersey ?? "0", color: Color.Yellow }, icon: Icon.Hashtag, tooltip: "Jersey Number" },
          { tag: { value: formattedHeight ?? "0", color: Color.Yellow }, icon: Icon.Ruler, tooltip: "Height in Feet" },
          { tag: { value: weight ?? "0", color: Color.Yellow }, icon: Icon.Weights, tooltip: "Weight in LBS" },
          { icon: healthIcon, tooltip: healthTooltip },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Player Details on ESPN"
              url={`${player1?.links[0]?.href ?? "https://www.espn.com/nhl"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={revalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          </ActionPanel>
        }
      />
    );
  });

  const leftWingsArray = leftWings?.map((player2, index) => {
    const name = player2.displayName;
    const weight = player2.displayWeight;
    const height = player2.displayHeight;
    const formattedHeight = height?.replace(/\s+/g, "");
    const age = player2.age;
    const headshot = player2.headshot?.href ?? Icon.Person;
    const jersey = player2.jersey;
    const health = player2.injuries?.[0]?.status;

    let healthIcon;
    let healthTooltip;

    if (!health) {
      healthIcon = { source: Icon.Heart, tintColor: Color.Green };
      healthTooltip = "Healthy";
    } else {
      healthIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
      healthTooltip = "Injured";
    }

    return (
      <List.Item
        key={index}
        title={name}
        icon={{ source: headshot }}
        subtitle={`${age} Years Old`}
        accessories={[
          { tag: { value: jersey ?? "0", color: Color.Yellow }, icon: Icon.Hashtag, tooltip: "Jersey Number" },
          { tag: { value: formattedHeight ?? "0", color: Color.Yellow }, icon: Icon.Ruler, tooltip: "Height in Feet" },
          { tag: { value: weight ?? "0", color: Color.Yellow }, icon: Icon.Weights, tooltip: "Weight in LBS" },
          { icon: healthIcon, tooltip: healthTooltip },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Player Details on ESPN"
              url={`${player2?.links[0]?.href ?? "https://www.espn.com/nhl"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={revalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          </ActionPanel>
        }
      />
    );
  });

  const rightWingsArray = rightWings?.map((player3, index) => {
    const name = player3.displayName;
    const weight = player3.displayWeight;
    const height = player3.displayHeight;
    const formattedHeight = height?.replace(/\s+/g, "");
    const age = player3.age;
    const headshot = player3.headshot?.href ?? Icon.Person;
    const jersey = player3.jersey;
    const health = player3.injuries?.[0]?.status;

    let healthIcon;
    let healthTooltip;

    if (!health) {
      healthIcon = { source: Icon.Heart, tintColor: Color.Green };
      healthTooltip = "Healthy";
    } else {
      healthIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
      healthTooltip = "Injured";
    }

    return (
      <List.Item
        key={index}
        title={name}
        icon={`${headshot}`}
        subtitle={`${age} Years Old`}
        accessories={[
          { tag: { value: jersey ?? "0", color: Color.Yellow }, icon: Icon.Hashtag, tooltip: "Jersey Number" },
          { tag: { value: formattedHeight ?? "0", color: Color.Yellow }, icon: Icon.Ruler, tooltip: "Height in Feet" },
          { tag: { value: weight ?? "0", color: Color.Yellow }, icon: Icon.Weights, tooltip: "Weight in LBS" },
          { icon: healthIcon, tooltip: healthTooltip },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Player Details on ESPN"
              url={`${player3?.links[0]?.href ?? "https://www.espn.com/nhl"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={revalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          </ActionPanel>
        }
      />
    );
  });

  // Defense

  const defenseArray = defensemen?.map((player4, index) => {
    const name = player4.displayName;
    const weight = player4.displayWeight;
    const height = player4.displayHeight;
    const formattedHeight = height?.replace(/\s+/g, "");
    const age = player4.age;
    const headshot = player4.headshot?.href ?? Icon.Person;
    const jersey = player4.jersey;
    const health = player4.injuries?.[0]?.status;

    let healthIcon;
    let healthTooltip;

    if (!health) {
      healthIcon = { source: Icon.Heart, tintColor: Color.Green };
      healthTooltip = "Healthy";
    } else {
      healthIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
      healthTooltip = "Injured";
    }

    return (
      <List.Item
        key={index}
        title={name}
        icon={{ source: headshot }}
        subtitle={`${age} Years Old`}
        accessories={[
          { tag: { value: jersey ?? "0", color: Color.Yellow }, icon: Icon.Hashtag, tooltip: "Jersey Number" },
          { tag: { value: formattedHeight ?? "0", color: Color.Yellow }, icon: Icon.Ruler, tooltip: "Height in Feet" },
          { tag: { value: weight ?? "0", color: Color.Yellow }, icon: Icon.Weights, tooltip: "Weight in LBS" },
          { icon: healthIcon, tooltip: healthTooltip },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Player Details on ESPN"
              url={`${player4?.links[0]?.href ?? "https://www.espn.com/nhl"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={revalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          </ActionPanel>
        }
      />
    );
  });

  // Goalies

  const goaliesArray = goalies?.map((player5, index) => {
    const name = player5.displayName;
    const weight = player5.displayWeight;
    const height = player5.displayHeight;
    const formattedHeight = height?.replace(/\s+/g, "");
    const age = player5.age;
    const headshot = player5.headshot?.href ?? Icon.Person;
    const jersey = player5.jersey;
    const health = player5.injuries?.[0]?.status;

    let healthIcon;
    let healthTooltip;

    if (!health) {
      healthIcon = { source: Icon.Heart, tintColor: Color.Green };
      healthTooltip = "Healthy";
    } else {
      healthIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
      healthTooltip = "Injured";
    }

    return (
      <List.Item
        key={index}
        title={name}
        icon={{ source: headshot }}
        subtitle={`${age} Years Old`}
        accessories={[
          { tag: { value: jersey ?? "0", color: Color.Yellow }, icon: Icon.Hashtag, tooltip: "Jersey Number" },
          { tag: { value: formattedHeight ?? "0", color: Color.Yellow }, icon: Icon.Ruler, tooltip: "Height in Feet" },
          { tag: { value: weight ?? "0", color: Color.Yellow }, icon: Icon.Weights, tooltip: "Weight in LBS" },
          { icon: healthIcon, tooltip: healthTooltip },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Player Details on ESPN"
              url={`${player5?.links[0]?.href ?? "https://www.espn.com/nhl"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={revalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          </ActionPanel>
        }
      />
    );
  });

  // Api Stuff

  if (nhlScheduleStats) {
    return <Detail isLoading={true} />;
  }

  if (!nhlScoresAndSchedule) {
    return <Detail markdown="No data found." />;
  }

  return (
    <List searchBarPlaceholder="Search for your favorite team" isLoading={nhlScheduleStats}>
      <List.Section title="Head Coach">
        <List.Item
          title={`${headCoach}`}
          icon={Icon.Person}
          accessories={[
            {
              tag: {
                value: `${nhlGame?.coach?.[0]?.experience ?? "0"} exp`,
                color: Color.Yellow,
              },
              icon: Icon.Clock,
              tooltip: "Years of Experience",
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                onAction={revalidate}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      <List.Section title={`${nhlGame?.athletes?.[0]?.position}`}>{centersArray}</List.Section>
      <List.Section title={`${nhlGame?.athletes?.[1]?.position}`}>{rightWingsArray}</List.Section>
      <List.Section title={`${nhlGame?.athletes?.[2]?.position}`}>{leftWingsArray}</List.Section>
      <List.Section title={`${nhlGame?.athletes?.[3]?.position}`}>{defenseArray}</List.Section>
      <List.Section title={`${nhlGame?.athletes?.[4]?.position}`}>{goaliesArray}</List.Section>
    </List>
  );
}
