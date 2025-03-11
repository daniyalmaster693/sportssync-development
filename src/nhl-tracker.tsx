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

export default function scoresAndSchedule() {
  // Fetch NHL Articles

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
    isLoading: nhlArticlesStatus,
    data: nhlArticlesData,
    revalidate: articleRevalidate,
  } = useFetch<ArticlesResponse>("https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/news");

  const [showDetail, setShowDetail] = useState(false);

  const nhlArticles = nhlArticlesData?.articles || [];
  const nhlArticleItems = nhlArticles?.map((nhlArticle, index) => {
    const articleDate = new Date(nhlArticle?.published ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let articleType = nhlArticle?.type;

    if (articleType === "HeadlineNews") {
      articleType = "Headline";
    }

    return (
      <List.Item
        key={index}
        title={`${nhlArticle?.headline ?? "No Headline Found"}`}
        icon={{ source: nhlArticle?.images[0]?.url }}
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
              markdown={`![Article Headline Image](${nhlArticle?.images[0]?.url})`}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Title" text={nhlArticle.headline} />
                  <List.Item.Detail.Metadata.Label title="Description" text={nhlArticle.description} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Published" text={articleDate} />
                  <List.Item.Detail.Metadata.Label title="Writer" text={nhlArticle.byline ?? "Unknown"} />
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
              url={`${nhlArticle?.links?.web?.href ?? "https://www.espn.com"}`}
            />
            <Action.CopyToClipboard
              title="Copy Article Link"
              content={nhlArticle?.links?.web?.href}
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

  // Fetch NHL Injuries

  const {
    isLoading: nhlInjuryStatus,
    data: nhlInjuryData,
    revalidate: injuryRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/injuries");

  const nhlInjuryItems = nhlInjuryData?.injuries.flatMap((injuryItem) => injuryItem.injuries) || [];
  const nhlItems = nhlInjuryItems?.map((nhlInjury, index) => {
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

  // Fetch NHL Transactions

  const {
    isLoading: nhlTransactionStatus,
    data: nhlTransactionsData,
    revalidate: transactionRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/transactions?limit=75");

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

  if (nhlArticlesStatus || nhlInjuryStatus || nhlTransactionStatus) {
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
      isLoading={nhlArticlesStatus}
    >
      {currentInfo === "Articles" && (
        <>
          <List.Section title={`${nhlArticles?.length} Article${nhlArticles?.length !== 1 ? "s" : ""}`}>
            {nhlArticleItems}
          </List.Section>
        </>
      )}

      {currentInfo === "Injuries" && (
        <>
          <List.Section title="Injury Status">{nhlItems}</List.Section>
        </>
      )}

      {currentInfo === "Transactions" && (
        <>
          {nhlTransactionDayItems.map((dayItem, index) => (
            <List.Section key={index} title={`${dayItem.title}`}>
              {dayItem.transactions}
            </List.Section>
          ))}
        </>
      )}
    </List>
  );
}
