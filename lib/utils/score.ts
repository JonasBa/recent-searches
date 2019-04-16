import { ISearch, RankingStrategy } from "./../";

const computeMatchScore = (
  search: ISearch,
  query: string | number,
  rankBy: RankingStrategy,
  ttl: number
): number => {
  const normalizedQuery = String(query);

  switch (rankBy) {
    case "PROXIMITY":
      return search.query.indexOf(normalizedQuery);
    case "TIME":
      return Math.log10(new Date().getTime() - search.timestamp);
    default:
      const matchDistance = search.query.indexOf(normalizedQuery);
      const timeDelta = Math.log2(
        (new Date().getTime() - search.timestamp) / ttl + 1
      );
      const proximity = Math.log2(matchDistance + 1) || 1;

      if (matchDistance === -1) {
        return matchDistance;
      }

      return (0.01 + 0.49 * proximity + 0.49 * timeDelta) / 1;
  }
};

export default computeMatchScore;
