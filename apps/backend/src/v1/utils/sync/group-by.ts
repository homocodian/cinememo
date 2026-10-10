export function groupByOmittingKey<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, Omit<T, K>[]> {
  return array.reduce(
    (accumulator, currentValue) => {
      // Extract the value of the key we want to group by
      const groupKeyValue = currentValue[key] as unknown as string;

      // Omit the key-value pair that we are grouping by from the current object
      const { [key]: omitted, ...rest } = currentValue;

      // Initialize the group in the accumulator if it doesn't exist
      if (!accumulator[groupKeyValue]) {
        accumulator[groupKeyValue] = [];
      }

      // Push the rest of the object (without the group by key) into the appropriate group
      accumulator[groupKeyValue].push(rest as Omit<T, K>);
      return accumulator;
    },
    {} as Record<string, Omit<T, K>[]>
  );
}
