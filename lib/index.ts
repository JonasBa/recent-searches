import MemoryStorage from "./MemoryStorage";
import LocalStorage, { SafeLocalStorage } from "./SafeLocalStorage";

import computeMatchScore from "./utils/score";
import isValidQuery from "./utils/string";

export interface ISearch {
  query: string;
  timestamp: number;
  data?: {
    [key: string]: string;
  };
}

export type ScoredSearch = ISearch & {
  score: number;
};

export type RankingStrategy = "PROXIMITY" | "TIME" | "PROXIMITY_AND_TIME";

export interface IRecentSearchesConfig {
  ttl?: number;
  limit?: number;
  namespace?: string;
  ranking?: RankingStrategy;
}

export type RecentSearchesStorage =
  | SafeLocalStorage<ISearch[]>
  | MemoryStorage<ISearch[]>;

export class RecentSearches {
  private readonly TTL: number;
  private readonly LIMIT: number;
  private readonly STORAGE: RecentSearchesStorage;
  private readonly RANKING: RankingStrategy;

  private RECENT_SEARCHES: ISearch[] = [];

  constructor(config: IRecentSearchesConfig = {}) {
    this.TTL = config.ttl || 1000 * 60 * 60 * 24;
    this.LIMIT = config.limit || 50;
    this.STORAGE = LocalStorage<ISearch[]>({
      defaultValue: [],
      key: config.namespace
    });
    this.RECENT_SEARCHES = this.initializeStorageData();
    this.RANKING = config.ranking || "PROXIMITY_AND_TIME";
  }

  /**
   * Retrieve recent searches for a given query.
   * If no query is passed, returns all recent searches
   *
   * @param  {string} query?
   * @returns Search[]
   */
  public getRecentSearches = (query?: string | number): ISearch[] => {
    if (!isValidQuery(query)) {
      return this.RECENT_SEARCHES;
    }

    const matchedSearches = this.RECENT_SEARCHES.map(search => {
      const score = computeMatchScore(search, query, this.RANKING, this.TTL);

      return {
        data: search.data,
        query: search.query,
        score,
        timestamp: search.timestamp
      };
    })
      .filter(this.filterScoredResults)
      .sort(this.sortScoredResults)
      .map(search => ({
        data: search.data,
        query: search.query,
        timestamp: search.timestamp
      }));

    return matchedSearches;
  };

  /**
   * Set a recent search and data related to it.
   *
   * @param  {string} query
   * @param  {object} data?
   * @returns Search[]
   */
  public setRecentSearch = (
    query: string | number,
    data?: ISearch["data"]
  ): ISearch[] => {
    if (!isValidQuery(query)) {
      return this.RECENT_SEARCHES;
    }

    const search: ISearch = {
      data,
      query: String(query),
      timestamp: new Date().getTime()
    };

    const existingQueryIndex = this.RECENT_SEARCHES.findIndex(
      searchEntry => searchEntry.query === query
    );

    if (existingQueryIndex > -1) {
      this.RECENT_SEARCHES.splice(existingQueryIndex, 1);
    }

    this.RECENT_SEARCHES.unshift(search);
    this.RECENT_SEARCHES = this.RECENT_SEARCHES.slice(0, this.LIMIT);
    this.STORAGE.setItem(this.RECENT_SEARCHES);

    return this.RECENT_SEARCHES;
  };

  private filterScoredResults = (search: ScoredSearch): boolean => {
    if (this.RANKING === "TIME") {
      return true;
    }

    return search.score > -1;
  };

  private sortScoredResults = (a: ScoredSearch, b: ScoredSearch): number => {
    return a.score - b.score;
  };

  private initializeStorageData = (): ISearch[] => {
    const currentTimestamp = new Date().getTime();

    const items = this.STORAGE.getItem()
      .filter(search => search.timestamp + this.TTL >= currentTimestamp)
      .slice(0, this.LIMIT);

    this.STORAGE.setItem(items);
    this.RECENT_SEARCHES = items;
    return items;
  };
}

export default RecentSearches;
