import { useFetch } from "@raycast/utils";
import sportInfo from "./getSportInfo";

interface Athlete {
  displayName: string;
  headshot?: {
    href: string;
  };
}

interface Injury {
  athlete: Athlete;
  status: string;
}

interface InjuriesGroup {
  injuries: Injury[];
}

interface Statistic {
  displayValue: string;
  value: string;
}

interface LeaderEntry {
  athlete: Athlete;
  statistics: Statistic[];
}

interface LeaderGroup {
  leaders: LeaderEntry[];
}

interface LeadersSection {
  leaders: LeaderGroup[];
}

interface Team {
  abbreviation: string;
  displayName: string;
  logo: string;
  links?: { href: string }[];
}

interface Competitor {
  team: Team;
  record?: { summary: string }[];
}

interface Competition {
  competitors: Competitor[];
  date: string;
}

interface Header {
  competitions: Competition[];
  links: { href: string }[];
}

interface BoxscoreTeam {
  team: {
    logo: string;
  };
  statistics: Statistic[];
}

interface Boxscore {
  teams: BoxscoreTeam[];
}

interface Venue {
  fullName: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
}

interface GameInfo {
  venue: Venue;
}

interface TicketsInfo {
  seatSituation?: {
    summary: string;
  };
}

export interface PreGameResponse {
  header: Header;
  boxscore: Boxscore;
  injuries: InjuriesGroup[];
  leaders: LeadersSection[];
  gameInfo: GameInfo;
  ticketsInfo?: TicketsInfo;
}

export default function getPreGameDetails({ gameId }: { gameId: string }) {
  const currentLeague = sportInfo.getLeague();
  const currentSport = sportInfo.getSport();

  const {
    isLoading: preGameLoading,
    data: preGameData,
    revalidate: preGameRevalidate,
  } = useFetch<PreGameResponse>(
    `https://site.web.api.espn.com/apis/site/v2/sports/${currentSport}/${currentLeague}/summary?event=${gameId}`,
  );

  return { preGameData, preGameLoading, preGameRevalidate };
}
