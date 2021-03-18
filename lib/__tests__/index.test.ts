import AsyncStorage from "@react-native-async-storage/async-storage";
import RecentSearches, { DEFAULT_STORAGE_KEY } from "..";

const defaultTTL = 1000 * 60 * 60;

describe("RecentSearches", () => {
  describe("setRecentSearch", () => {
    it("saves to storage", async () => {
      const searches = new RecentSearches();

      const spy = jest.spyOn(AsyncStorage, "setItem");
      await searches.setRecentSearch("test", { se: "test" });
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("protects falsey queries", async () => {
      const searches = new RecentSearches();
      expect(await searches.setRecentSearch(undefined as any, {})).toEqual([]);
      expect(await searches.setRecentSearch("", {})).toEqual([]);
      expect(await searches.setRecentSearch(0 as any, {})).not.toEqual([]);
    });

    it("does not exceed limit", async () => {
      const limit = 5;
      const searches = new RecentSearches({ limit });
      await searches.initializeStorageData();
      const newSearches = new Array(limit + 10).fill("query");

      const results = await Promise.all(
        newSearches.map((search) => searches.setRecentSearch(search))
      );

      results.forEach((search) =>
        expect(search.length).toBeLessThanOrEqual(limit)
      );

      expect(
        (searches as any).RECENT_SEARCHES.some(
          (search: any) => typeof search.timestamp !== "number"
        )
      ).toBe(false);
    });

    it("saves additional data", async () => {
      const searches = new RecentSearches({ ttl: defaultTTL });

      expect(
        (await searches.setRecentSearch("query", { data: "something" }))[0].data
      ).toEqual({ data: "something" });
      expect(searches.getRecentSearches()[0].data).toEqual({
        data: "something",
      });
    });

    it("appends new queries to start", async () => {
      const searches = new RecentSearches({ ttl: defaultTTL });
      await searches.initializeStorageData();
      const newSearches = ["query", "newQuery"];

      await Promise.all(
        newSearches.map((search) => {
          searches.setRecentSearch(search);
        })
      );

      expect((searches as any).RECENT_SEARCHES[0].query).toBe(newSearches[1]);
      expect((searches as any).RECENT_SEARCHES[1].query).toBe(newSearches[0]);
    });

    it("handles duplicates", async () => {
      const data = [
        {
          query: "new",
          timestamp: new Date().getTime() - 1000 * 60 * 15,
        },
        {
          query: "old",
          timestamp: new Date().getTime() - 1000 * 60 * 60 * 20,
        },
        {
          query: "new_2",
          timestamp: new Date().getTime() - 1000 * 60 * 60 * 30,
        },
      ];

      const searches = new RecentSearches({ namespace: "CUSTOM" });
      await AsyncStorage.setItem("CUSTOM", JSON.stringify(data));
      await searches.initializeStorageData();

      await searches.setRecentSearch("old");
      expect(searches.getRecentSearches().length).toBe(2);
    });
  });

  describe("initializeStorageData", () => {
    it("filters expired searches", async () => {
      const searches = new RecentSearches({
        limit: 5,
        namespace: "CUSTOM",
        ttl: 1000 * 60 * 60,
      });

      await searches.initializeStorageData();

      const storedData = [
        {
          query: "new",
          timestamp: new Date().getTime() - 1000 * 60 * 15,
        },
        {
          query: "old",
          timestamp: new Date().getTime() - 1000 * 60 * 60 * 2,
        },
      ];
      await AsyncStorage.setItem("CUSTOM", JSON.stringify(storedData));
      expect(await searches.initializeStorageData()).toEqual([storedData[0]]);
    });

    it("respects limits", async () => {
      const searches = new RecentSearches({
        limit: 2,
        namespace: "CUSTOM",
        ttl: 1000 * 60 * 60,
      });
      await searches.initializeStorageData();

      const storedData = [
        {
          query: "new",
          timestamp: new Date().getTime() - 1000 * 60 * 15,
        },
        {
          query: "new_2",
          timestamp: new Date().getTime() - 1000 * 60 * 15,
        },
        {
          query: "new_3",
          timestamp: new Date().getTime() - 1000 * 60 * 15,
        },
        {
          query: "old",
          timestamp: new Date().getTime() - 1000 * 60 * 60 * 2,
        },
      ];
      await AsyncStorage.setItem("CUSTOM", JSON.stringify(storedData));
      expect(await searches.initializeStorageData()).toEqual(
        storedData.slice(0, 2)
      );
    });
  });

  describe("getRecentSearches", () => {
    const storedData = [
      {
        query: "some_new",
        data: undefined,
        timestamp: new Date().getTime() - 1000 * 60 * 15,
      },
      {
        query: "new",
        data: undefined,
        timestamp: new Date().getTime() - 1000 * 60 * 15,
      },
      {
        query: "other",
        data: undefined,
        timestamp: new Date().getTime() - 1000 * 60 * 15,
      },
      {
        query: "old",
        data: undefined,
        timestamp: new Date().getTime() - 1000 * 60 * 60 * 2,
      },
    ];

    const searches = new RecentSearches({
      namespace: "CUSTOM",
      ttl: defaultTTL,
    });

    beforeAll(async () => {
      await AsyncStorage.setItem("CUSTOM", JSON.stringify(storedData));
      await searches.initializeStorageData();
    });

    it("returns all searches when no query is sent", () => {
      expect(searches.getRecentSearches()).toEqual(storedData.slice(0, 3));
    });

    it("returns all searches when no query is sent ranked by indexOf", () => {
      expect(searches.getRecentSearches("ne")).toEqual([
        storedData[1],
        storedData[0],
      ]);
    });

    describe("rank_by", () => {
      const storedData = [
        {
          query: "some_new",
          timestamp: new Date().getTime() - 1000 * 60 * 10,
        },
        { query: "new", timestamp: new Date().getTime() - 1000 * 60 * 5 },
        {
          query: "other",
          timestamp: new Date().getTime() - 1000 * 60 * 2,
        },
        {
          query: "old",
          timestamp: new Date().getTime() - 1000 * 60 * 60 * 2,
        },
      ];

      it("TIME", async () => {
        const searches = new RecentSearches({
          ttl: defaultTTL,
          namespace: "CUSTOM",
          ranking: "TIME",
        });

        await AsyncStorage.setItem("CUSTOM", JSON.stringify(storedData));
        await searches.initializeStorageData();

        expect(searches.getRecentSearches("ne")).toEqual([
          storedData[2],
          storedData[1],
          storedData[0],
        ]);
      });

      it("PROXIMITY", async () => {
        const searches = new RecentSearches({
          ttl: defaultTTL,
          namespace: "CUSTOM",
          ranking: "PROXIMITY",
        });

        await AsyncStorage.setItem("CUSTOM", JSON.stringify(storedData));
        await searches.initializeStorageData();

        expect(searches.getRecentSearches("ne")).toEqual([
          storedData[1],
          storedData[0],
        ]);
      });

      it("PROXIMITY_AND_TIME", async () => {
        const storedData = [
          {
            query: "___query",
            timestamp: new Date().getTime() - 1000 * 60 * 1,
          },
          {
            query: "_t_query",
            timestamp: new Date().getTime() - 1000 * 60 * 30,
          },
          {
            query: "query",
            timestamp: new Date().getTime() - 1000 * 60 * 55,
          },
          {
            query: "__query",
            timestamp: new Date().getTime() - 1000 * 60 * 30,
          },
        ];

        const searches = new RecentSearches({
          namespace: "CUSTOM",
          ranking: "PROXIMITY_AND_TIME",
          ttl: 1000 * 60 * 60,
        });

        await AsyncStorage.setItem("CUSTOM", JSON.stringify(storedData));
        await searches.initializeStorageData();

        const results = searches.getRecentSearches("query").map((q) => q.query);

        expect(results).toEqual(["query", "___query", "__query", "_t_query"]);
      });
    });
  });
});
