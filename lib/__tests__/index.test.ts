import RecentSearches from "..";

const memoryStorageEnvironment = {
  after: () => void 0,
  before: () => {
    const spy = jest.spyOn(localStorage, "setItem");

    spy.mockImplementationOnce(() => {
      throw new Error("Dead");
    });
  },
  label: "MemoryStorage"
};

const localStorageEnvironment = {
  after: () => {
    localStorage.clear();
  },
  before: () => void 0,
  label: "LocalStorage"
};

const defaultTTL = 1000 * 60 * 60;

describe("RecentSearches", () => {
  [memoryStorageEnvironment /*localStorageEnvironment*/].map(environment => {
    describe(environment.label, () => {
      beforeEach(() => {
        environment.before();
      });

      afterEach(() => {
        environment.after();
      });

      describe("setRecentSearch", () => {
        it("saves to storage", () => {
          const searches = new RecentSearches();

          const spy = jest.spyOn((searches as any).STORAGE, "setItem");
          searches.setRecentSearch("test", { se: "test" });
          expect(spy).toHaveBeenCalledTimes(1);
        });

        it("protects falsey queries", () => {
          const searches = new RecentSearches();
          expect(searches.setRecentSearch(undefined as any, {})).toEqual([]);
          expect(searches.setRecentSearch("", {})).toEqual([]);
          expect(searches.setRecentSearch(0 as any, {})).not.toEqual([]);
        });

        it("does not exceed limit", () => {
          const limit = 5;
          const searches = new RecentSearches({ limit });
          (searches as any).initializeStorageData();
          const newSearches = new Array(limit + 10).fill("query");

          newSearches.forEach(search => {
            expect(searches.setRecentSearch(search).length).toBeLessThanOrEqual(
              limit
            );
          });

          expect(
            (searches as any).RECENT_SEARCHES.some(
              (search: any) => typeof search.timestamp !== "number"
            )
          ).toBe(false);
        });

        it("saves additional data", () => {
          const searches = new RecentSearches({ ttl: defaultTTL });

          expect(
            searches.setRecentSearch("query", { data: "something" })[0].data
          ).toEqual({ data: "something" });
          expect(searches.getRecentSearches()[0].data).toEqual({
            data: "something"
          });
        });

        it("appends new queries to start", () => {
          const searches = new RecentSearches({ ttl: defaultTTL });
          (searches as any).initializeStorageData();
          const newSearches = ["query", "newQuery"];

          newSearches.forEach(search => {
            searches.setRecentSearch(search);
          });

          expect((searches as any).RECENT_SEARCHES[0].query).toBe(
            newSearches[1]
          );
          expect((searches as any).RECENT_SEARCHES[1].query).toBe(
            newSearches[0]
          );
        });

        it("handles duplicates", () => {
          const data = [
            {
              query: "new",
              timestamp: new Date().getTime() - 1000 * 60 * 15
            },
            {
              query: "old",
              timestamp: new Date().getTime() - 1000 * 60 * 60 * 20
            },
            {
              query: "new_2",
              timestamp: new Date().getTime() - 1000 * 60 * 60 * 30
            }
          ];

          const searches = new RecentSearches({ namespace: "CUSTOM" });
          (searches as any).STORAGE.setItem(data);
          (searches as any).initializeStorageData();

          searches.setRecentSearch("old");
          expect(searches.getRecentSearches().length).toBe(2);
        });
      });

      describe("initializeStorageData", () => {
        it("filters expired searches", () => {
          const searches = new RecentSearches({
            limit: 5,
            namespace: "CUSTOM",
            ttl: 1000 * 60 * 60
          });

          (searches as any).initializeStorageData();

          const storedData = [
            {
              query: "new",
              timestamp: new Date().getTime() - 1000 * 60 * 15
            },
            {
              query: "old",
              timestamp: new Date().getTime() - 1000 * 60 * 60 * 2
            }
          ];
          (searches as any).STORAGE.setItem(storedData);
          expect((searches as any).initializeStorageData()).toEqual([
            storedData[0]
          ]);
        });

        it("respects limits", () => {
          const searches = new RecentSearches({
            limit: 2,
            namespace: "CUSTOM",
            ttl: 1000 * 60 * 60
          });
          (searches as any).initializeStorageData();

          const storedData = [
            {
              query: "new",
              timestamp: new Date().getTime() - 1000 * 60 * 15
            },
            {
              query: "new_2",
              timestamp: new Date().getTime() - 1000 * 60 * 15
            },
            {
              query: "new_3",
              timestamp: new Date().getTime() - 1000 * 60 * 15
            },
            {
              query: "old",
              timestamp: new Date().getTime() - 1000 * 60 * 60 * 2
            }
          ];
          (searches as any).STORAGE.setItem(storedData);
          expect((searches as any).initializeStorageData()).toEqual(
            storedData.slice(0, 2)
          );
        });
      });

      describe("getRecentSearches", () => {
        const storedData = [
          {
            query: "some_new",
            data: undefined,
            timestamp: new Date().getTime() - 1000 * 60 * 15
          },
          {
            query: "new",
            data: undefined,
            timestamp: new Date().getTime() - 1000 * 60 * 15
          },
          {
            query: "other",
            data: undefined,
            timestamp: new Date().getTime() - 1000 * 60 * 15
          },
          {
            query: "old",
            data: undefined,
            timestamp: new Date().getTime() - 1000 * 60 * 60 * 2
          }
        ];

        const searches = new RecentSearches({
          namespace: "CUSTOM",
          ttl: defaultTTL
        });

        (searches as any).STORAGE.setItem(storedData);
        (searches as any).initializeStorageData();

        it("returns all searches when no query is sent", () => {
          expect(searches.getRecentSearches()).toEqual(storedData.slice(0, 3));
        });

        it("returns all searches when no query is sent ranked by indexOf", () => {
          expect(searches.getRecentSearches("ne")).toEqual([
            storedData[1],
            storedData[0]
          ]);
        });

        describe("rank_by", () => {
          const storedData = [
            {
              query: "some_new",
              timestamp: new Date().getTime() - 1000 * 60 * 10
            },
            { query: "new", timestamp: new Date().getTime() - 1000 * 60 * 5 },
            {
              query: "other",
              timestamp: new Date().getTime() - 1000 * 60 * 2
            },
            {
              query: "old",
              timestamp: new Date().getTime() - 1000 * 60 * 60 * 2
            }
          ];

          it("TIME", () => {
            const searches = new RecentSearches({
              ttl: defaultTTL,
              namespace: "CUSTOM",
              ranking: "TIME"
            });

            (searches as any).STORAGE.setItem(storedData);
            (searches as any).initializeStorageData();

            expect(searches.getRecentSearches("ne")).toEqual([
              storedData[2],
              storedData[1],
              storedData[0]
            ]);
          });

          it("PROXIMITY", () => {
            const searches = new RecentSearches({
              ttl: defaultTTL,
              namespace: "CUSTOM",
              ranking: "PROXIMITY"
            });

            (searches as any).STORAGE.setItem(storedData);
            (searches as any).initializeStorageData();

            expect(searches.getRecentSearches("ne")).toEqual([
              storedData[1],
              storedData[0]
            ]);
          });

          it("PROXIMITY_AND_TIME", () => {
            const storedData = [
              {
                query: "___query",
                timestamp: new Date().getTime() - 1000 * 60 * 1
              },
              {
                query: "_t_query",
                timestamp: new Date().getTime() - 1000 * 60 * 30
              },
              {
                query: "query",
                timestamp: new Date().getTime() - 1000 * 60 * 55
              },
              {
                query: "__query",
                timestamp: new Date().getTime() - 1000 * 60 * 30
              }
            ];

            const searches = new RecentSearches({
              namespace: "CUSTOM",
              ranking: "PROXIMITY_AND_TIME",
              ttl: 1000 * 60 * 60
            });

            (searches as any).STORAGE.setItem(storedData);
            (searches as any).initializeStorageData();

            const results = searches
              .getRecentSearches("query")
              .map(q => q.query);

            expect(results).toEqual([
              "query",
              "___query",
              "__query",
              "_t_query"
            ]);
          });
        });
      });
    });
  });
});
