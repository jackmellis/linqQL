import { Build } from "./types";

// Convert all parameters into a string
const stringifyArgs = (args: any) => {
  const parts: string[] = [];
  Object.entries(args).forEach(([key, value]) => {
    // Ignore null/undefined entries
    if (value == null) {
      return;
    }

    if (value && Array.isArray(value)) {
      // If value is a list, we want to stringify each item
      const valueStr = value
        .map((v) => {
          if (typeof v === "object") {
            return stringifyArgs(v);
          }
          return v;
        })
        .join(", ");

      parts.push(`${key}: [${valueStr}]`);
    } else if (value && typeof value === "object") {
      // If value is an object we want to stringify each of its properties
      if ("__enum" in value) {
        // Enums are a special case.
        // To indicate an enum we wrapt it in an __enum object
        // And to stringify an enum we insert it as-is (no quotes)
        parts.push(`${key}: ${value.__enum}`);
      } else {
        // Otherwise we stringify the object
        const s = stringifyArgs(value);
        // If the object doesn't actually hve any properties, we don't include it
        if (s) {
          parts.push(`${key}: {\n${s}\n}`);
        }
      }
    } else {
      // If value is a primitive we can just JSON.stringify it
      parts.push(`${key}: ${JSON.stringify(value)}`);
    }
  });
  return parts.join("\n");
};

// Convert all fields into a string
const stringifySelect = (fields: Record<string, any>) => {
  const parts: string[] = [];

  Object.entries(fields).forEach(([key, value]) => {
    // If it's an object we need to recursively stringify it
    if (value && typeof value === "object") {
      parts.push(key);

      if (value.__isLinqQL) {
        // Object is a subquery so we can just call its own stringify method
        parts.push(value.stringify());
      } else {
        // Regular objects are stringified as a block
        parts.push("{", stringifySelect(value), "}");
      }
    } else if (typeof value === "string") {
      // If the value is a string, we treat it as an alias
      parts.push(`${value}: ${key}`);
    } else if (value) {
      // If the value is true, we just include the key
      parts.push(`${key}`);
    }
  });

  return parts.join("\n");
};

const formatQuery = (query: string) => {
  let i = 0;
  const result = query
    .split("\n")
    .map((ln) => {
      const idx = i;
      if (ln.includes("{") || ln.includes("(")) {
        i = i + 2;
      }
      if (ln.includes("}") || ln.includes(")")) {
        i = i - 2;
      }
      return ln.padStart(ln.length + idx, " ");
    })
    .join("\n");

  return result;
};

// Stringify the inner part of the query
// This would return something like this:
/*
(arg: "value") { field }
*/
const stringifyQuery = (
  args: Record<string, any>,
  fields: Record<string, any>
) => {
  const parts: string[] = [];
  if (Object.keys(args).length > 0) {
    const a = stringifyArgs(args);
    if (a) {
      parts.push("(", a, ")");
    }
  }
  if (Object.keys(fields).length > 0) {
    const s = stringifySelect(fields);
    parts.push("{", s, "}");
  }

  const result = parts.join("\n");

  return result;
};

// Stringify the entire query
// This would return something like this:
/*
query { name(arg: "value") { field } }
*/
// It also applies formatting
const toStringQuery = (
  name: string,
  type: string,
  args: Record<string, any>,
  fields: Record<string, any>
) => {
  const parts: string[] = [];
  parts.push(`${type} {`, name, stringifyQuery(args, fields), "}");
  const result = parts.join("\n");

  return formatQuery(result);
};

const build = (name: string) => {
  let type = "query";
  const args: Record<string, any> = {};
  let fields: Record<string, any> = {};

  const proxy = new Proxy(
    {},
    {
      get: (target, key: string) => {
        switch (key) {
          case "stringify":
            return () => stringifyQuery(args, fields);
          case "toString":
            return () => toStringQuery(name, type, args, fields);
          case "select":
            return (f: any): any => {
              if (Array.isArray(f)) {
                f = f.reduce((acc, key) => {
                  acc[key] = true;
                  return acc;
                }, {});
              }
              fields = f;
              return proxy;
            };
          case "query":
            return (): any => {
              type = "query";
              return proxy;
            };
          case "mutation":
            return (): any => {
              type = "mutation";
              return proxy;
            };
          case "__isLinqQL":
            return true;
          default: {
            // Anything else is considered an argument
            const fn = (arg: any): any => {
              args[key] = arg;
              return proxy;
            };
            fn.enum = (arg: any): any => {
              args[key] = { __enum: arg };
              return proxy;
            };
            return fn;
          }
        }
      },
    }
  );

  return proxy;
};

export default build as Build;
