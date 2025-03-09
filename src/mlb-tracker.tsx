import { Detail, List, Action, ActionPanel, Color, Icon, LocalStorage } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState, useEffect } from "react";

interface Article {
  headline: string;
  published: string;
  byline?: string;
  description?: string;
  type: string;
  images: { url: string }[];
  links: { web: { href: string } };
}

interface ArticlesResponse {
  articles: Article[];
}

interface Team {
  logos: { href: string }[];
  links: { href: string }[];
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

interface Team {
  logos: { href: string }[];
  links: { href: string }[];
}

interface mlbTransaction {
  date: string;
  description: string;
  team: Team;
}

interface DayItems {
  title: string;
  transactions: JSX.Element[];
}

interface Response {
  transactions: mlbTransaction[];
}

export default function scoresAndSchedule() {
  // Fetch MLB Articles

  const [currentInfo, setCurrentInfo] = useState<string>("Articles");

  useEffect(() => {
    async function loadStoredDropdown() {
      const storedValue = await LocalStorage.getItem("selectedDropdown");

      if (typeof storedValue === "string") {
        setCurrentInfo(storedValue);
      } else {
        setCurrentInfo("Articles");
      }
    }

    loadStoredDropdown();
  }, []);

  const {
    isLoading: mlbArticlesStatus,
    data: mlbArticlesData,
    revalidate: articleRevalidate,
  } = useFetch<ArticlesResponse>("https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news");

  const [showDetail, setShowDetail] = useState(false);

  const mlbArticles = mlbArticlesData?.articles || [];
  const mlbArticleItems = mlbArticles?.map((mlbArticle, index) => {
    const articleDate = new Date(mlbArticle?.published ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const accessoryTitle = articleDate;
    const accessoryToolTip = "Date Published";

    let articleType = mlbArticle?.type;

    if (articleType === "HeadlineNews") {
      articleType = "Headline";
    }

    return (
      <List.Item
        key={index}
        title={`${mlbArticle?.headline ?? "No Headline Found"}`}
        icon={{ source: mlbArticle?.images[0]?.url }}
        accessories={
          !showDetail
            ? [
                { tag: { value: articleType, color: Color.Green }, icon: Icon.Megaphone, tooltip: "Category" },
                { text: articleDate, tooltip: "Date Published" },
                { icon: Icon.Calendar },
              ]
            : []
        }
        detail={
          showDetail ? (
            <List.Item.Detail
              markdown={`![Article Headline Image](${mlbArticle?.images[0]?.url})`}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Title" text={mlbArticle.headline} />
                  <List.Item.Detail.Metadata.Label title="Description" text={mlbArticle.description} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Published" text={articleDate} />
                  <List.Item.Detail.Metadata.Label title="Writer" text={mlbArticle.byline ?? "Unknown"} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.TagList title="Category">
                    <List.Item.Detail.Metadata.TagList.Item text={articleType} color={Color.Green} />
                  </List.Item.Detail.Metadata.TagList>
                </List.Item.Detail.Metadata>
              }
            />
          ) : null
        }
        actions={
          <ActionPanel>
            <Action title="Toggle Detailed View" icon={Icon.Sidebar} onAction={() => setShowDetail(!showDetail)} />
            <Action.OpenInBrowser
              title="View Article on ESPN"
              url={`${mlbArticle?.links?.web?.href ?? "https://www.espn.com"}`}
            />
            <Action.CopyToClipboard
              title="Copy Article Link"
              content={mlbArticle?.links?.web?.href}
            ></Action.CopyToClipboard>
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={articleRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  // Fetch MLB Injuries

  const {
    isLoading: mlbInjuryStatus,
    data: mlbInjuryData,
    revalidate: injuryRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/injuries");

  const mlbInjuryItems = mlbInjuryData?.injuries.flatMap((injuryItem) => injuryItem.injuries) || [];
  const mlbItems = mlbInjuryItems?.map((mlbInjury, index) => {
    const articleDate = mlbInjury?.details?.returnDate ?? "";

    if (!articleDate) {
      return null;
    }

    let tagColor = Color.SecondaryText;
    let accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.SecondaryText };

    if (mlbInjury.status === "Day-To-Day") {
      tagColor = Color.Yellow;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Yellow };
    }

    if (mlbInjury.status === "Out") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
    }

    if (mlbInjury.status === "Injured Reserve" || mlbInjury.status === "Questionable") {
      tagColor = Color.Red;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Red };
    }

    if (mlbInjury.status === "Suspension") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.Warning, tintColor: Color.Orange };
    }

    return (
      <List.Item
        key={index}
        title={`${mlbInjury.athlete.displayName}`}
        subtitle={`${mlbInjury.athlete.position.displayName}`}
        icon={{ source: mlbInjury.athlete.team.logos[0].href }}
        accessories={[
          {
            tag: { value: mlbInjury.status.replace(/-/g, " "), color: tagColor },
            tooltip: "Status",
          },
          { text: articleDate, tooltip: "Est. Return Date" },
          { icon: accessoryIcon },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${mlbInjury.athlete.team.links[0]?.href ?? "https://www.espn.com"}`}
            />
            <Action.OpenInBrowser
              title="View Player Details on ESPN"
              url={`${mlbInjury.athlete.links[0]?.href ?? "https://www.espn.com"}`}
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

  // Fetch MLB Transactions

  const {
    isLoading: mlbTransactionStatus,
    data: mlbTransactionsData,
    revalidate: transactionRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/transactions?limit=50");

  const mlbTransactionDayItems: DayItems[] = [];
  const mlbTransactions = mlbTransactionsData?.transactions || [];

  const mlbTransactionItems = mlbTransactions?.map((mlbTransaction, index) => {
    const transactionDate = new Date(mlbTransaction.date ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const mlbGameDay = transactionDate;

    let dayItem = mlbTransactionDayItems.find((item) => item.title === mlbGameDay);

    if (!dayItem) {
      dayItem = { title: mlbGameDay, transactions: [] };
      mlbTransactionDayItems.push(dayItem);
    }

    dayItem.transactions.push(
      <List.Item
        key={index}
        title={`${mlbTransaction?.description ?? "No Headline Found"}`}
        icon={{ source: mlbTransaction?.team.logos[0]?.href }}
        accessories={[{ icon: Icon.Switch }]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${mlbTransaction?.team.links[0]?.href ?? "https://www.espn.com"}`}
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

  if (mlbArticlesStatus || mlbInjuryStatus || mlbTransactionStatus) {
    return <Detail isLoading={true} />;
  }
  return (
    <List
      isShowingDetail={showDetail}
      searchBarPlaceholder="Search news, injuries, transactions"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Sort by"
          onChange={async (newValue) => {
            setCurrentInfo(newValue);
            await LocalStorage.setItem("selectedDropdown", newValue);
          }}
          value={currentInfo}
          defaultValue="Articles"
        >
          <List.Dropdown.Item title="Articles" value="Articles" />
          <List.Dropdown.Item title="Injuries" value="Injuries" />
          <List.Dropdown.Item title="Transactions" value="Transactions" />
        </List.Dropdown>
      }
      isLoading={mlbArticlesStatus}
    >
      {currentInfo === "Articles" && (
        <>
          <List.Section title={`${mlbArticles?.length} Article${mlbArticles?.length !== 1 ? "s" : ""}`}>
            {mlbArticleItems}
          </List.Section>
        </>
      )}

      {currentInfo === "Injuries" && (
        <>
          <List.Section title="Injury Status">{mlbItems}</List.Section>
        </>
      )}

      {currentInfo === "Transactions" && (
        <>
          {mlbTransactionDayItems.map((dayItem, index) => (
            <List.Section key={index} title={`${dayItem.title}`}>
              {dayItem.transactions}
            </List.Section>
          ))}
        </>
      )}
    </List>
  );
}
