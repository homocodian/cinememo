import type { PullChangesBody } from "@cinememo/schemas/sync";

import { Note } from "@/db/schema/note";
import { SharedWith } from "@/v1/controllers/sync/pull-changes";

type Data = Record<
  string,
  {
    created: Note[] | SharedWith[];
    updated: Note[] | SharedWith[];
    deleted: { id: string }[];
  }
>;

type Collection = Record<string, unknown>;

export function getTransformData(data: Data, transformInto: PullChangesBody) {
  const changes: Record<
    string,
    { created: Collection[]; updated: Collection[]; deleted: string[] }
  > = {};

  for (const key in transformInto) {
    if (Object.prototype.hasOwnProperty.call(transformInto, key)) {
      const element = transformInto[key]!;
      const created =
        data?.[key]?.created.map((createdValue: Record<string, unknown>) => {
          const data: Collection = {};
          for (const key in createdValue) {
            if (Object.prototype.hasOwnProperty.call(createdValue, key)) {
              const snakeCase = key.replace(
                /[A-Z]/g,
                (letter) => `_${letter.toLowerCase()}`
              );
              // snake_case must be returned in the response
              if (element.includes(snakeCase)) {
                data[snakeCase] = !snakeCase.endsWith("_at")
                  ? // camelCase must be used to access drizzle data
                    createdValue[key]
                  : toEpochTimestamp(createdValue[key]);

                // console.log(data[snakeCase]);
              }
            }
          }
          return data;
        }) ?? [];
      const updated =
        data?.[key]?.updated.map((updatedValue: Record<string, unknown>) => {
          const data: Collection = {};
          for (const key in updatedValue) {
            if (Object.prototype.hasOwnProperty.call(updatedValue, key)) {
              const snakeCase = key.replace(
                /[A-Z]/g,
                (letter) => `_${letter.toLowerCase()}`
              );
              // snake_case must be returned in the response
              if (element.includes(snakeCase)) {
                data[snakeCase] = !snakeCase.endsWith("_at")
                  ? // camelCase must be used to access drizzle data
                    updatedValue[key]
                  : toEpochTimestamp(updatedValue[key]);
              }
            }
          }
          return data;
        }) ?? [];
      const deleted = data?.[key]?.deleted.map((note) => note.id) ?? [];
      changes[key] = { created, updated, deleted };
    }
  }

  return changes;
}

function toEpochTimestamp(date: unknown) {
  if (!date) return null;
  if (date instanceof Date) {
    return date.getTime();
  }
  throw new Error("invalid date format to convert to epoch timestamp");
}
