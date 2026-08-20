export type DashboardFilterOption = {
  label: string;
  value: string;
};

export type DashboardFiltersValue = {
  facility: string;
  startDate: string;
  endDate: string;
};

type DashboardFiltersProps = {
  value: DashboardFiltersValue;
  onChange: (value: DashboardFiltersValue) => void;
  facilityOptions: DashboardFilterOption[];
  facilityLabel?: string;
};

const inputClassName =
  'ui-h-9 ui-rounded-md ui-border ui-border-gray-300 ui-px-3 ui-text-sm ui-text-gray-900 focus:ui-outline-none focus:ui-ring-2 focus:ui-ring-primary-300';

/**
 * Placeholder filters row shared by the 9 new dashboards. Plain HTML
 * `<select>` / `<input type="date">` styled with Tailwind — no dedicated
 * Select/DatePicker component was found in @repo/ui quickly enough to be
 * worth pulling in for a mock-data placeholder screen.
 */
export default function DashboardFilters({
  value,
  onChange,
  facilityOptions,
  facilityLabel = 'Facility',
}: DashboardFiltersProps) {
  return (
    <div className="ui-flex ui-flex-wrap ui-items-end ui-gap-4 ui-mb-6">
      <div className="ui-flex ui-flex-col ui-gap-1">
        <label className="ui-text-xs ui-font-medium ui-text-gray-500">
          {facilityLabel}
        </label>
        <select
          className={inputClassName}
          value={value.facility}
          onChange={(e) => onChange({ ...value, facility: e.target.value })}
        >
          {facilityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="ui-flex ui-flex-col ui-gap-1">
        <label className="ui-text-xs ui-font-medium ui-text-gray-500">
          Start Date
        </label>
        <input
          type="date"
          className={inputClassName}
          value={value.startDate}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
        />
      </div>
      <div className="ui-flex ui-flex-col ui-gap-1">
        <label className="ui-text-xs ui-font-medium ui-text-gray-500">
          End Date
        </label>
        <input
          type="date"
          className={inputClassName}
          value={value.endDate}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
        />
      </div>
    </div>
  );
}

export const DEFAULT_DASHBOARD_FACILITY_OPTIONS: DashboardFilterOption[] = [
  { label: 'All Facilities', value: 'all' },
  { label: 'RSUD Example', value: 'rsud-example' },
  { label: 'Puskesmas Example', value: 'puskesmas-example' },
];

export function getDefaultDashboardFilters(): DashboardFiltersValue {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 30);

  const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

  return {
    facility: 'all',
    startDate: toDateInput(start),
    endDate: toDateInput(today),
  };
}
