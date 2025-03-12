import { Detail, List, Color, Icon, Action, ActionPanel } from "@raycast/api";
import getTransactions from "../utils/getTransactions";
import sportInfo from "../utils/getSportInfo";

interface DayItems {
  title: string;
  transactions: JSX.Element[];
}

export default function DisplayTransactions() {
  const { transactionData, transactionLoading, transactionRevalidate } = getTransactions();
  const currentLeague = sportInfo.getLeague();

  const transactionDayItems: DayItems[] = [];
  const transactions = transactionData?.transactions || [];

  const transactionItems = transactions?.map((transaction, index) => {
    const transactionDate = new Date(transaction.date ?? "Unknown").toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const nhlGameDay = transactionDate;

    let dayItem = transactionDayItems.find((item) => item.title === nhlGameDay);

    if (!dayItem) {
      dayItem = { title: nhlGameDay, transactions: [] };
      transactionDayItems.push(dayItem);
    }

    dayItem.transactions.push(
      <List.Item
        key={index}
        title={`${transaction?.description ?? "Unknown"}`}
        icon={{ source: transaction?.team.logos[0]?.href }}
        accessories={[{ icon: Icon.Switch }]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="View Team Details on ESPN"
              url={`${transaction?.team.links[0]?.href ?? `https://www.espn.com ?? ${currentLeague}`}`}
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

  return (
    <>
      {transactionDayItems.map((dayItem, index) => (
        <List.Section key={index} title={`${dayItem.title}`}>
          {dayItem.transactions}
        </List.Section>
      ))}
    </>
  );
}
