import { Detail, List, Color, Icon, Action, ActionPanel } from "@raycast/api";
import getInjuries from "../utils/getInjuries";
import sportInfo from "../utils/getSportInfo";

export default function DisplayInjuries() {
  const { injuryData, injuryLoading, injuryRevalidate } = getInjuries();
  const currentLeague = sportInfo.getLeague();

  const injuryItems = injuryData?.injuries.flatMap((injuryItem) => injuryItem.injuries) || [];
  const playerInjuryItems = injuryItems?.map((injury, index) => {
    const articleDate = injury?.details?.returnDate ?? "";

    if (!articleDate) {
      return null;
    }

    let tagColor = Color.SecondaryText;
    let accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.SecondaryText };

    if (injury.status === "Day-To-Day") {
      tagColor = Color.Yellow;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Yellow };
    }

    if (injury.status === "Out") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
    }

    if (injury.status === "Injured Reserve" || injury.status === "Questionable") {
      tagColor = Color.Red;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Red };
    }

    if (injury.status === "Suspension") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.Warning, tintColor: Color.Orange };
    }

    return (
      <List.Item
        key={index}
        title={`${injury.athlete.displayName}`}
        subtitle={`${injury.athlete.position.displayName}`}
        icon={{ source: injury.athlete.team.logos[0].href }}
        accessories={[
          {
            tag: { value: injury.status.replace(/-/g, " "), color: tagColor },
            tooltip: "Status",
          },
          { text: articleDate, tooltip: "Est. Return Date" },
          { icon: accessoryIcon },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Player Details on ESPN"
              url={`${injury.athlete.links[0]?.href ?? `https://www.espn.com/${currentLeague}`}`}
            />
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${injury.athlete.team.links[0]?.href ?? `https://www.espn.com/${currentLeague}`}`}
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

  return (
    <>
      <List.Section title="Injury Status">{playerInjuryItems}</List.Section>
    </>
  );
}
