import { Detail, List, Action, ActionPanel, Color, Icon } from "@raycast/api";
import { useFetch } from "@raycast/utils";

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
  // Fetch NHL Transactions

  const { isLoading: nhlTransactionStatus, data: nhlTransactionsData } = useFetch<Response>(
    "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/transactions?limit=50",
  );

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
        title={`${nhlTransaction?.description ?? "No Headline Found"}`}
        icon={{ source: nhlTransaction?.team.logos[0]?.href }}
        accessories={[{ icon: Icon.Switch }]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${nhlTransaction?.team.links[0]?.href ?? "https://www.espn.com"}`}
            />
          </ActionPanel>
        }
      />,
    );
  });

  if (nhlTransactionStatus) {
    return <Detail isLoading={true} />;
  }

  return (
    <List searchBarPlaceholder="Search for a transaction" isLoading={nhlTransactionStatus}>
      {nhlTransactionDayItems.map((dayItem, index) => (
        <List.Section key={index} title={`${dayItem.title}`}>
          {dayItem.transactions}
        </List.Section>
      ))}
    </List>
  );
}
