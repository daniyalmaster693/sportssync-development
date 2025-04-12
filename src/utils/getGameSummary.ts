import { useFetch } from "@raycast/utils";
import sportInfo from "./getSportInfo";

interface Team {
  id: string;
  abbreviation: string;
  displayName: string;
  logo: string;
  links: { href: string }[];
}

interface Competitor {
  team: Team;
  score: string;
  record?: { summary: string }[];
}

interface Competition {
  competitors: Competitor[];
  status: {
    type: {
      state: string;
    };
    featuredAthletes?: {
      athlete: {
        displayName: string;
        headshot: {
          href: string;
        };
      };
    }[];
  };
}

interface Header {
  competitions: Competition[];
  links: { href: string }[];
}

interface Statistic {
  name: string;
  displayValue: string;
}

interface BoxscoreTeam {
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    logo: string;
    links: { href: string }[];
  };
  statistics: Statistic[];
}

interface Boxscore {
  teams: BoxscoreTeam[];
}

interface Play {
  type: {
    text: string;
  };
  text: string;
  team: {
    id: string;
    displayName: string;
    logo: string;
  };
  period: {
    number: number;
  };
  clock: {
    displayValue: string;
  };
}

export interface SummaryResponse {
  header: Header;
  plays: Play[];
  boxscore: Boxscore;
}

export default function getTeamStandings({ gameId }: { gameId: string }) {
  const currentLeague = sportInfo.getLeague();
  const currentSport = sportInfo.getSport();

  const {
    isLoading: summaryLoading,
    data: summaryData,
    revalidate: summaryRevalidate,
  } = useFetch<SummaryResponse>(
    `https://site.web.api.espn.com/apis/site/v2/sports/${currentSport}/${currentLeague}/summary?event=${gameId}`,
  );

  return { summaryData, summaryLoading, summaryRevalidate };
}
