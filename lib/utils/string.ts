const isBlank = (str: string = ""): boolean => {
  return /^\s*$/.test(str);
};

const isValidQuery = (query?: any): query is string | number => {
  return (
    (typeof query === "string" && !isBlank(query)) || typeof query === "number"
  );
};

export default isValidQuery;
