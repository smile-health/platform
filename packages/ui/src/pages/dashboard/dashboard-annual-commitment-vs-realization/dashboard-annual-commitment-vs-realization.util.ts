import { OptionType } from "#components/react-select";

export function generateYearOptions(
  startYear = 2018
): OptionType[] {
  const currentYear = new Date().getFullYear();

  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => {
      const year = startYear + i;
      return {
        value: year,
        label: year.toString(),
      };
    }
  );
}
