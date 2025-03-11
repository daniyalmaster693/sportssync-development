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

interface nflTransaction {
  date: string;
  description: string;
  team: Team;
}

interface DayItems {
  title: string;
  transactions: JSX.Element[];
}

interface Response {
  transactions: nflTransaction[];
}

export default function scoresAndSchedule() {
  // Fetch NFL Articles

  const [currentInfo, setCurrentInfo] = useState<string>("Articles");
  useEffect(() => {
    async function loadStoredDropdown() {
      const storedValue = await LocalStorage.getItem("selectedDropdown");

      if (typeof storedValue === "string") {
        setCurrentInfo(storedValue);
      } else {
        setCurrentInfo("NFL Articles");
      }
    }

    loadStoredDropdown();
  }, []);

  const {
    isLoading: nflArticlesStatus,
    data: nflArticlesData,
    revalidate: nflArticleRevalidate,
  } = useFetch<ArticlesResponse>("https://site.api.espn.com/apis/site/v2/sports/football/nfl/news");

  const [showDetail, setShowDetail] = useState(false);

  const nflArticles = nflArticlesData?.articles || [];
  const nflArticleItems = nflArticles?.map((nflArticle, index) => {
    const articleDate = new Date(nflArticle?.published ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const accessoryTitle = articleDate;
    const accessoryToolTip = "Date Published";
    let articleType = nflArticle?.type;

    if (articleType === "HeadlineNews") {
      articleType = "Headline";
    }

    return (
      <List.Item
        key={index}
        title={`${nflArticle?.headline ?? "No Headline Found"}`}
        icon={{ source: nflArticle?.images[0]?.url }}
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
              markdown={`![Article Headline Image](${nflArticle?.images[0]?.url})`}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Title" text={nflArticle.headline} />
                  <List.Item.Detail.Metadata.Label title="Description" text={nflArticle.description} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Published" text={articleDate} />
                  <List.Item.Detail.Metadata.Label title="Writer" text={nflArticle.byline ?? "Unknown"} />
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
              url={`${nflArticle?.links?.web?.href ?? "https://www.espn.com"}`}
            />
            <Action.CopyToClipboard
              title="Copy Article Link"
              content={nflArticle?.links?.web?.href}
            ></Action.CopyToClipboard>
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={nflArticleRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  // Fetch NFL Injuries

  const {
    isLoading: nflInjuryStatus,
    data: nflInjuryData,
    revalidate: nflInjuryRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/football/nfl/injuries");

  const nflInjuryItems = nflInjuryData?.injuries.flatMap((injuryItem) => injuryItem.injuries) || [];
  const nflItems = nflInjuryItems?.map((nflInjury, index) => {
    const articleDate = nflInjury?.details?.returnDate ?? "";

    if (!articleDate) {
      return null;
    }

    let tagColor = Color.SecondaryText;
    let accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.SecondaryText };

    if (nflInjury.status === "Day-To-Day") {
      tagColor = Color.Yellow;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Yellow };
    }

    if (nflInjury.status === "Out") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
    }

    if (nflInjury.status === "Injured Reserve" || nflInjury.status === "Questionable") {
      tagColor = Color.Red;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Red };
    }

    if (nflInjury.status === "Suspension") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.Warning, tintColor: Color.Orange };
    }

    return (
      <List.Item
        key={index}
        title={`${nflInjury.athlete.displayName}`}
        subtitle={`${nflInjury.athlete.position.displayName}`}
        icon={{ source: nflInjury.athlete.team.logos[0].href }}
        accessories={[
          {
            tag: { value: nflInjury.status.replace(/-/g, " "), color: tagColor },
            tooltip: "Status",
          },
          { text: articleDate, tooltip: "Est. Return Date" },
          { icon: accessoryIcon },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Player Details on ESPN"
              url={`${nflInjury.athlete.links[0]?.href ?? "https://www.espn.com"}`}
            />
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${nflInjury.athlete.team.links[0]?.href ?? "https://www.espn.com"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={nflInjuryRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  // Fetch NFL Transactions

  const {
    isLoading: nflTransactionStatus,
    data: nflTransactionsData,
    revalidate: nflTransactionRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/football/nfl/transactions?limit=75");

  const nflTransactionDayItems: DayItems[] = [];
  const nflTransactions = nflTransactionsData?.transactions || [];

  const nflTransactionItems = nflTransactions?.map((nflTransaction, index) => {
    const transactionDate = new Date(nflTransaction.date ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const nflGameDay = transactionDate;

    let dayItem = nflTransactionDayItems.find((item) => item.title === nflGameDay);

    if (!dayItem) {
      dayItem = { title: nflGameDay, transactions: [] };
      nflTransactionDayItems.push(dayItem);
    }

    dayItem.transactions.push(
      <List.Item
        key={index}
        title={`${nflTransaction?.description ?? "No Headline Found"}`}
        icon={{ source: nflTransaction?.team.logos[0]?.href }}
        accessories={[{ icon: Icon.Switch }]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${nflTransaction?.team.links[0]?.href ?? "https://www.espn.com"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={nflTransactionRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />,
    );
  });

  // Fetch NCAA Articles

  const {
    isLoading: ncaaArticlesStatus,
    data: ncaaArticlesData,
    revalidate: ncaaArticleRevalidate,
  } = useFetch<ArticlesResponse>("https://site.api.espn.com/apis/site/v2/sports/football/college-football/news");

  const ncaaArticles = ncaaArticlesData?.articles || [];
  const ncaaItems = ncaaArticles?.map((ncaaArticle, index) => {
    const articleDate = new Date(ncaaArticle?.published).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const accessoryTitle = articleDate;
    const accessoryToolTip = "Date Published";
    let articleType = ncaaArticle?.type;

    if (articleType === "HeadlineNews") {
      articleType = "Headline";
    }

    return (
      <List.Item
        key={index}
        title={`${ncaaArticle?.headline ?? "No Headline Found"}`}
        icon={{ source: ncaaArticle?.images[0]?.url }}
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
              markdown={`![Article Headline Image](${ncaaArticle?.images[0]?.url})`}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Title" text={ncaaArticle.headline} />
                  <List.Item.Detail.Metadata.Label title="Description" text={ncaaArticle.description} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Published" text={articleDate} />
                  <List.Item.Detail.Metadata.Label title="Writer" text={ncaaArticle.byline ?? "Unknown"} />
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
              url={`${ncaaArticle?.links?.web?.href ?? "https://www.espn.com"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={ncaaArticleRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  if (nflArticlesStatus || nflInjuryStatus || nflTransactionStatus || ncaaArticlesStatus) {
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
          defaultValue="NFL Articles"
        >
          <List.Dropdown.Item title="NFL Articles" value="NFL Articles" />
          <List.Dropdown.Item title="NFL Injuries" value="NFL Injuries" />
          <List.Dropdown.Item title="NFL Transactions" value="NFL Transactions" />
          <List.Dropdown.Item title="NCAA Articles" value="NCAA Articles" />
        </List.Dropdown>
      }
      isLoading={nflArticlesStatus}
    >
      {currentInfo === "NFL Articles" && (
        <>
          <List.Section title={`${nflArticles?.length} Article${nflArticles?.length !== 1 ? "s" : ""}`}>
            {nflArticleItems}
          </List.Section>
        </>
      )}

      {currentInfo === "NFL Injuries" && (
        <>
          <List.Section title="Injury Status">{nflItems}</List.Section>
        </>
      )}

      {currentInfo === "NFL Transactions" && (
        <>
          {nflTransactionDayItems.map((dayItem, index) => (
            <List.Section key={index} title={`${dayItem.title}`}>
              {dayItem.transactions}
            </List.Section>
          ))}
        </>
      )}

      {currentInfo === "NCAA Articles" && (
        <>
          <List.Section title={`${ncaaArticles?.length} Article${ncaaArticles.length !== 1 ? "s" : ""}`}>
            {ncaaItems}
          </List.Section>
        </>
      )}
    </List>
  );
}
