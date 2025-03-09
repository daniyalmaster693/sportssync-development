import { Detail, List, Action, ActionPanel, Color, Icon, LocalStorage } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState, useEffect } from "react";

interface Article {
  headline: string;
  published: string;
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

interface Transaction {
  date: string;
  description: string;
  team: Team;
}

interface DayItems {
  title: string;
  transactions: JSX.Element[];
}

interface Response {
  transactions: Transaction[];
}

export default function scoresAndSchedule() {
  // Fetch NBA Articles

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
    isLoading: nbaArticlesStatus,
    data: nbaArticlesData,
    revalidate: nbaArticleRevalidate,
  } = useFetch<ArticlesResponse>("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news");

  const nbaArticles = nbaArticlesData?.articles || [];
  const nbaArticleItems = nbaArticles?.map((nbaArticle, index) => {
    const articleDate = new Date(nbaArticle?.published ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const accessoryTitle = articleDate;
    const accessoryToolTip = "Date Published";
    let articleType = nbaArticle?.type;

    if (articleType === "HeadlineNews") {
      articleType = "Headline";
    }

    return (
      <List.Item
        key={index}
        title={`${nbaArticle?.headline ?? "No Headline Found"}`}
        icon={{ source: nbaArticle?.images[0]?.url }}
        accessories={[
          { tag: { value: articleType, color: Color.Green }, icon: Icon.Megaphone, tooltip: "Category" },
          { text: { value: `${accessoryTitle ?? "No Date Found"}` }, tooltip: accessoryToolTip ?? "Unknown" },
          { icon: Icon.Calendar },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Article on ESPN"
              url={`${nbaArticle?.links?.web?.href ?? "https://www.espn.com"}`}
            />
            <Action.CopyToClipboard
              title="Copy Article Link"
              content={nbaArticle?.links?.web?.href}
            ></Action.CopyToClipboard>
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={nbaArticleRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  // Fetch NBA Injuries

  const {
    isLoading: nbaInjuryStatus,
    data: nbaInjuryData,
    revalidate: nbaInjuryRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries");

  const nbaInjuryItems = nbaInjuryData?.injuries.flatMap((injuryItem) => injuryItem.injuries) || [];
  const nbaItems = nbaInjuryItems?.map((nbaInjury, index) => {
    const articleDate = nbaInjury?.details?.returnDate ?? "";

    if (!articleDate) {
      return null;
    }

    let tagColor = Color.SecondaryText;
    let accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.SecondaryText };

    if (nbaInjury.status === "Day-To-Day") {
      tagColor = Color.Yellow;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Yellow };
    }

    if (nbaInjury.status === "Out") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
    }

    if (nbaInjury.status === "Injured Reserve" || nbaInjury.status === "Questionable") {
      tagColor = Color.Red;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Red };
    }

    if (nbaInjury.status === "Suspension") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.Warning, tintColor: Color.Orange };
    }

    return (
      <List.Item
        key={index}
        title={`${nbaInjury.athlete.displayName}`}
        subtitle={`${nbaInjury.athlete.position.displayName}`}
        icon={{ source: nbaInjury.athlete.team.logos[0].href }}
        accessories={[
          {
            tag: { value: nbaInjury.status.replace(/-/g, " "), color: tagColor },
            tooltip: "Status",
          },
          { text: articleDate, tooltip: "Est. Return Date" },
          { icon: accessoryIcon },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${nbaInjury.athlete.team.links[0]?.href ?? "https://www.espn.com"}`}
            />
            <Action.OpenInBrowser
              title="View Player Details on ESPN"
              url={`${nbaInjury.athlete.links[0]?.href ?? "https://www.espn.com"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={nbaInjuryRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  // Fetch NBA Transactions

  const {
    isLoading: nbaTransactionStatus,
    data: nbaTransactionsData,
    revalidate: nbaTransactionRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/transactions?limit=50");

  const nbaTransactionDayItems: DayItems[] = [];
  const nbaTransactions = nbaTransactionsData?.transactions || [];

  const nbaTransactionItems = nbaTransactions?.map((nbaTransaction, index) => {
    const transactionDate = new Date(nbaTransaction.date ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const nbaGameDay = transactionDate;

    let dayItem = nbaTransactionDayItems.find((item) => item.title === nbaGameDay);

    if (!dayItem) {
      dayItem = { title: nbaGameDay, transactions: [] };
      nbaTransactionDayItems.push(dayItem);
    }

    dayItem.transactions.push(
      <List.Item
        key={index}
        title={`${nbaTransaction?.description ?? "No Headline Found"}`}
        icon={{ source: nbaTransaction?.team.logos[0]?.href }}
        accessories={[{ icon: Icon.Switch }]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${nbaTransaction?.team.links[0]?.href ?? "https://www.espn.com"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={nbaTransactionRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />,
    );
  });

  // Fetch WNBA Articles

  const {
    isLoading: wnbaArticlesStatus,
    data: wnbaArticlesData,
    revalidate: wnbaArticleRevalidate,
  } = useFetch<ArticlesResponse>("https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/news");

  const wnbaArticles = wnbaArticlesData?.articles || [];
  const wnbaArticleItems = wnbaArticles?.map((wnbaArticle, index) => {
    const articleDate = new Date(wnbaArticle?.published ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const accessoryTitle = articleDate;
    const accessoryToolTip = "Date Published";
    let articleType = wnbaArticle?.type;

    if (articleType === "HeadlineNews") {
      articleType = "Headline";
    }

    return (
      <List.Item
        key={index}
        title={`${wnbaArticle?.headline ?? "No Headline Found"}`}
        icon={{ source: wnbaArticle?.images[0]?.url }}
        accessories={[
          { tag: { value: articleType, color: Color.Green }, icon: Icon.Megaphone },
          { text: { value: `${accessoryTitle ?? "No Date Found"}` }, tooltip: accessoryToolTip ?? "Unknown" },
          { icon: Icon.Calendar },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Article on ESPN"
              url={`${wnbaArticle?.links?.web?.href ?? "https://www.espn.com"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={wnbaArticleRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  // Fetch WNBA Injuries

  const {
    isLoading: wnbaInjuryStatus,
    data: wnbaInjuryData,
    revalidate: wnbaInjuryRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/injuries");

  const wnbaInjuryItems = wnbaInjuryData?.injuries.flatMap((injuryItem) => injuryItem.injuries) || [];
  const wnbaItems = wnbaInjuryItems?.map((wnbaInjury, index) => {
    const articleDate = wnbaInjury?.details?.returnDate ?? "";

    if (!articleDate) {
      return null;
    }

    let tagColor = Color.SecondaryText;
    let accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.SecondaryText };

    if (wnbaInjury.status === "Day-To-Day") {
      tagColor = Color.Yellow;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Yellow };
    }

    if (wnbaInjury.status === "Out") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Orange };
    }

    if (wnbaInjury.status === "Injured Reserve" || wnbaInjury.status === "Questionable") {
      tagColor = Color.Red;
      accessoryIcon = { source: Icon.MedicalSupport, tintColor: Color.Red };
    }

    if (wnbaInjury.status === "Suspension") {
      tagColor = Color.Orange;
      accessoryIcon = { source: Icon.Warning, tintColor: Color.Orange };
    }

    return (
      <List.Item
        key={index}
        title={`${wnbaInjury.athlete.displayName}`}
        subtitle={`${wnbaInjury.athlete.position.displayName}`}
        icon={{ source: wnbaInjury.athlete.team.logos[0].href }}
        accessories={[
          {
            tag: { value: wnbaInjury.status.replace(/-/g, " "), color: tagColor },
            tooltip: "Status",
          },
          { text: articleDate, tooltip: "Est. Return Date" },
          { icon: accessoryIcon },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${wnbaInjury.athlete.team.links[0]?.href ?? "https://www.espn.com"}`}
            />
            <Action.OpenInBrowser
              title="View Player Details on ESPN"
              url={`${wnbaInjury.athlete.links[0]?.href ?? "https://www.espn.com"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={wnbaInjuryRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  // Fetch WNBA Transactions

  const {
    isLoading: wnbaTransactionStatus,
    data: wnbaTransactionsData,
    revalidate: wnbaTransactionRevalidate,
  } = useFetch<Response>("https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/transactions?limit=50");

  const wnbaTransactionDayItems: DayItems[] = [];
  const wnbaTransactions = wnbaTransactionsData?.transactions || [];

  const wnbaTransactionItems = wnbaTransactions?.map((wnbaTransaction, index) => {
    const transactionDate = new Date(wnbaTransaction.date ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const wnbaGameDay = transactionDate;

    let dayItem = wnbaTransactionDayItems.find((item) => item.title === wnbaGameDay);

    if (!dayItem) {
      dayItem = { title: wnbaGameDay, transactions: [] };
      wnbaTransactionDayItems.push(dayItem);
    }

    dayItem.transactions.push(
      <List.Item
        key={index}
        title={`${wnbaTransaction?.description ?? "No Headline Found"}`}
        icon={{ source: wnbaTransaction?.team.logos[0]?.href }}
        accessories={[{ icon: Icon.Switch }]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${wnbaTransaction?.team.links[0]?.href ?? "https://www.espn.com"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={wnbaTransactionRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />,
    );
  });

  // Fetch Men's NCAA Articles

  const {
    isLoading: mncaaArticlesStatus,
    data: mncaaArticlesData,
    revalidate: mncaaArticleRevalidate,
  } = useFetch<ArticlesResponse>(
    "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/news",
  );

  const mncaaArticles = mncaaArticlesData?.articles || [];
  const mncaaItems = mncaaArticles?.map((mncaaArticle, index) => {
    const articleDate = new Date(mncaaArticle?.published).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const accessoryTitle = articleDate;
    const accessoryToolTip = "Date Published";
    let articleType = mncaaArticle?.type;

    if (articleType === "HeadlineNews") {
      articleType = "Headline";
    }

    return (
      <List.Item
        key={index}
        title={`${mncaaArticle?.headline ?? "No Headline Found"}`}
        icon={{ source: mncaaArticle?.images[0]?.url }}
        accessories={[
          { tag: { value: articleType, color: Color.Green }, icon: Icon.Megaphone },
          { text: { value: `${accessoryTitle ?? "No Date Found"}` }, tooltip: accessoryToolTip ?? "Unknown" },
          { icon: Icon.Calendar },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Article on ESPN"
              url={`${mncaaArticle?.links?.web?.href ?? "https://www.espn.com"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={mncaaArticleRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  // Fetch Women's NCAA Articles

  const {
    isLoading: wncaaArticlesStatus,
    data: wncaaArticlesData,
    revalidate: wncaaArticleRevalidate,
  } = useFetch<ArticlesResponse>(
    "https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/news",
  );

  const wncaaArticles = wncaaArticlesData?.articles || [];
  const wncaaItems = wncaaArticles?.map((wncaaArticle, index) => {
    const articleDate = new Date(wncaaArticle?.published).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const accessoryTitle = articleDate;
    const accessoryToolTip = "Date Published";
    let articleType = wncaaArticle?.type;

    if (articleType === "HeadlineNews") {
      articleType = "Headline";
    }

    return (
      <List.Item
        key={index}
        title={`${wncaaArticle?.headline ?? "No Headline Found"}`}
        icon={{ source: wncaaArticle?.images[0]?.url }}
        accessories={[
          { tag: { value: articleType, color: Color.Green }, icon: Icon.Megaphone },
          { text: { value: `${accessoryTitle ?? "No Date Found"}` }, tooltip: accessoryToolTip ?? "Unknown" },
          { icon: Icon.Calendar },
        ]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Article on ESPN"
              url={`${wncaaArticle?.links?.web?.href ?? "https://www.espn.com"}`}
            />
            <Action
              title="Refresh"
              icon={Icon.ArrowClockwise}
              onAction={wncaaArticleRevalidate}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            ></Action>
          </ActionPanel>
        }
      />
    );
  });

  if (
    nbaArticlesStatus ||
    nbaInjuryStatus ||
    nbaTransactionStatus ||
    wnbaArticlesStatus ||
    wnbaInjuryStatus ||
    wnbaTransactionStatus ||
    mncaaArticlesStatus ||
    wncaaArticlesStatus
  ) {
    return <Detail isLoading={true} />;
  }

  return (
    <List
      searchBarPlaceholder="Search news, injuries, transactions"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Sort by"
          onChange={async (newValue) => {
            setCurrentInfo(newValue);
            await LocalStorage.setItem("selectedDropdown", newValue);
          }}
          value={currentInfo}
          defaultValue="NBA Articles"
        >
          <List.Dropdown.Item title="NBA Articles" value="NBA Articles" />
          <List.Dropdown.Item title="NBA Injuries" value="NBA Injuries" />
          <List.Dropdown.Item title="NBA Transactions" value="NBA Transactions" />
          <List.Dropdown.Item title="WNBA Articles" value="WNBA Articles" />
          <List.Dropdown.Item title="WNBA Injuries" value="WNBA Injuries" />
          <List.Dropdown.Item title="WNBA Transactions" value="WNBA Transactions" />
          <List.Dropdown.Item title="MNCAA Articles" value="MNCAA Articles" />
          <List.Dropdown.Item title="WNCAA Articles" value="WNCAA Articles" />
        </List.Dropdown>
      }
      isLoading={wnbaArticlesStatus}
    >
      {currentInfo === "NBA Articles" && (
        <>
          <List.Section title={`${nbaArticles?.length} Article${nbaArticles?.length !== 1 ? "s" : ""}`}>
            {nbaArticleItems}
          </List.Section>
        </>
      )}

      {currentInfo === "NBA Injuries" && (
        <>
          <List.Section title="Injury Status">{nbaItems}</List.Section>
        </>
      )}

      {currentInfo === "NBA Transactions" && (
        <>
          {nbaTransactionDayItems.map((dayItem, index) => (
            <List.Section key={index} title={`${dayItem.title}`}>
              {dayItem.transactions}
            </List.Section>
          ))}
        </>
      )}
      {currentInfo === "WNBA Articles" && (
        <>
          <List.Section title={`${wnbaArticles?.length} Article${wnbaArticles?.length !== 1 ? "s" : ""}`}>
            {wnbaArticleItems}
          </List.Section>
        </>
      )}

      {currentInfo === "WNBA Injuries" && (
        <>
          <List.Section title="Injury Status">{wnbaItems}</List.Section>
        </>
      )}

      {currentInfo === "WNBA Transactions" && (
        <>
          {wnbaTransactionDayItems.map((dayItem, index) => (
            <List.Section key={index} title={`${dayItem.title}`}>
              {dayItem.transactions}
            </List.Section>
          ))}
        </>
      )}

      {currentInfo === "MNCAA Articles" && (
        <>
          <List.Section title={`${mncaaArticles?.length} Article${mncaaArticles?.length !== 1 ? "s" : ""}`}>
            {mncaaItems}
          </List.Section>
        </>
      )}

      {currentInfo === "WNCAA Articles" && (
        <>
          <List.Section title={`${wncaaArticles?.length} Article${wncaaArticles?.length !== 1 ? "s" : ""}`}>
            {wncaaItems}
          </List.Section>
        </>
      )}
    </List>
  );
}
