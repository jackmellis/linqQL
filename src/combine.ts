import { Combine } from "./types";

const combine = (queries: Record<string, any>) => {
  const result = {
    ...queries,
    stringify: () => {
      const parts: string[] = [];
      Object.entries(queries).forEach(([key, value]) => {
        parts.push(key);
        parts.push(value.stringify());
      });

      return parts.join("\n");
    },
    toString: () => {
      const parts: string[] = [];
      parts.push("query {");
      parts.push(result.stringify());
      parts.push("}");
      return parts.join("\n");
    },
    __R: null as any,
    query: () => {
      throw new Error('Cannot call "query" on a combined query');
    },
    mutation: () => {
      throw new Error('Cannot call "mutation" on a combined query');
    },
    select: () => {
      throw new Error('Cannot call "select" on a combined query');
    },
  };

  return result;
};

export default combine as Combine;
