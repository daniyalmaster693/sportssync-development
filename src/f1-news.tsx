import { Detail, List, Action, ActionPanel, Color, Icon } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";

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

export default function scoresAndSchedule() {
  // Fetch F1 Articles
  const {
    isLoading: f1ArticlesStatus,
    data: f1ArticlesData,
    revalidate,
  } = useFetch<ArticlesResponse>("https://site.api.espn.com/apis/site/v2/sports/racing/f1/news");

  const [showDetail, setShowDetail] = useState(false);

  const f1Articles = f1ArticlesData?.articles || [];
  const f1Items = f1Articles?.map((f1Article, index) => {
    const articleDate = new Date(f1Article?.published).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let articleType = f1Article?.type;

    if (articleType === "HeadlineNews") {
      articleType = "Headline";
    }

    return (
      <List.Item
        key={index}
        title={f1Article?.headline ?? "No Headline Found"}
        icon={{ source: f1Article?.images[0]?.url }}
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
              markdown={`![Article Headline Image](${f1Article?.images[0]?.url})`}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Title" text={f1Article.headline} />
                  <List.Item.Detail.Metadata.Label title="Description" text={f1Article.description} />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Published" text={articleDate} />
                  <List.Item.Detail.Metadata.Label title="Writer" text={f1Article.byline ?? "Unknown"} />
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
              url={f1Article?.links?.web?.href ?? "https://www.espn.com"}
            />
            <Action.CopyToClipboard title="Copy Article Link" content={f1Article?.links?.web?.href} />
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

  if (f1ArticlesStatus) {
    return <Detail isLoading={true} />;
  }

  return (
    <List isShowingDetail={showDetail} searchBarPlaceholder="Search for an article" isLoading={f1ArticlesStatus}>
      <List.Section title={`${f1Articles?.length} Article${f1Articles?.length !== 1 ? "s" : ""}`}>
        {f1Items}
      </List.Section>
    </List>
  );
}
