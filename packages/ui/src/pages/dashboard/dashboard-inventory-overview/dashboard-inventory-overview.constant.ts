export enum DashboardInventoryOverviewColor {
  Green = 'green',
  Blue = 'blue',
  Yellow = 'yellow',
  Red = 'red',
  Gray = 'gray',
}

export enum DashboardInventoryOverviewColorHEX {
  Green = '#22C55E',
  GreenLight = '#F0FDF4',
  Blue = '#38BDF8',
  BlueLight = '#F0F9FF',
  Yellow = '#FACC15',
  YellowLight = '#FEFCE8',
  Red = '#EF4444',
  RedLight = '#FEF2F2',
  Gray = '#4B5563',
  GrayLight = '#F9FAFB',
}

export const EMA_COLOR = [
  DashboardInventoryOverviewColorHEX.Green,
  DashboardInventoryOverviewColorHEX.Yellow,
  DashboardInventoryOverviewColorHEX.Blue,
  DashboardInventoryOverviewColorHEX.Red,
]

export const TEMPERATURE_COLOR = [
  DashboardInventoryOverviewColorHEX.Green,
  DashboardInventoryOverviewColorHEX.Blue,
  DashboardInventoryOverviewColorHEX.Red,
  DashboardInventoryOverviewColorHEX.Gray,
]

export enum DashboardInventoryType {
  Normal = 'normal',
  Min = 'min',
  Max = 'max',
  ZeroStock = 'zero_stock',
  Low = 'low',
  High = 'high',
  Unknown = 'unknown',
  Active = 'active',
  Inactive = 'inactive',
}

export const DASHBOARD_INVENTORY_COLOR_MAP = {
  [DashboardInventoryType.Normal]: DashboardInventoryOverviewColor.Green,
  [DashboardInventoryType.Min]: DashboardInventoryOverviewColor.Yellow,
  [DashboardInventoryType.Max]: DashboardInventoryOverviewColor.Blue,
  [DashboardInventoryType.Low]: DashboardInventoryOverviewColor.Blue,
  [DashboardInventoryType.ZeroStock]: DashboardInventoryOverviewColor.Red,
  [DashboardInventoryType.High]: DashboardInventoryOverviewColor.Red,
  [DashboardInventoryType.Unknown]: DashboardInventoryOverviewColor.Gray,
  [DashboardInventoryType.Active]: DashboardInventoryOverviewColor.Green,
  [DashboardInventoryType.Inactive]: DashboardInventoryOverviewColor.Red,
}

export const DASHBOARD_INVENTORY_LABEL_COLOR = {
  [DashboardInventoryOverviewColor.Green]: {
    color: DashboardInventoryOverviewColorHEX.Green,
    colorLight: DashboardInventoryOverviewColorHEX.GreenLight,
  },
  [DashboardInventoryOverviewColor.Blue]: {
    color: DashboardInventoryOverviewColorHEX.Blue,
    colorLight: DashboardInventoryOverviewColorHEX.BlueLight,
  },
  [DashboardInventoryOverviewColor.Yellow]: {
    color: DashboardInventoryOverviewColorHEX.Yellow,
    colorLight: DashboardInventoryOverviewColorHEX.YellowLight,
  },
  [DashboardInventoryOverviewColor.Red]: {
    color: DashboardInventoryOverviewColorHEX.Red,
    colorLight: DashboardInventoryOverviewColorHEX.RedLight,
  },
  [DashboardInventoryOverviewColor.Gray]: {
    color: DashboardInventoryOverviewColorHEX.Gray,
    colorLight: DashboardInventoryOverviewColorHEX.GrayLight,
  },
}

export const DashboardInventoryMapsColor = {
  [DashboardInventoryOverviewColor.Green]: [
    '#DCFCE7',
    '#86EFAC',
    '#22C55E',
    '#15803D',
    '#166534',
  ],
  [DashboardInventoryOverviewColor.Blue]: [
    '#E0F2FE',
    '#7DD3FC',
    '#38BDF8',
    '#0284C7',
    '#075985',
  ],
  [DashboardInventoryOverviewColor.Yellow]: [
    '#FEF9C3',
    '#FEF08A',
    '#FDE047',
    '#FACC15',
    '#A16207',
  ],
  [DashboardInventoryOverviewColor.Red]: [
    '#FEE2E2',
    '#FCA5A5',
    '#EF4444',
    '#DC2626',
    '#991B1B',
  ],
  [DashboardInventoryOverviewColor.Gray]: [
    '#F3F4F6',
    '#E5E7EB',
    '#9CA3AF',
    '#4B5563',
    '#1F2937',
  ],
}

export const DashboardInventoryMapsColorClass = {
  [DashboardInventoryOverviewColor.Green]: [
    'ui-bg-green-100',
    'ui-bg-green-300',
    'ui-bg-green-500',
    'ui-bg-green-700',
    'ui-bg-green-800',
  ],
  [DashboardInventoryOverviewColor.Blue]: [
    'ui-bg-sky-100',
    'ui-bg-sky-300',
    'ui-bg-sky-500',
    'ui-bg-sky-700',
    'ui-bg-sky-800',
  ],
  [DashboardInventoryOverviewColor.Yellow]: [
    'ui-bg-yellow-100',
    'ui-bg-yellow-300',
    'ui-bg-yellow-400',
    'ui-bg-yellow-500',
    'ui-bg-yellow-800',
  ],
  [DashboardInventoryOverviewColor.Red]: [
    'ui-bg-red-100',
    'ui-bg-red-300',
    'ui-bg-red-500',
    'ui-bg-red-600',
    'ui-bg-red-800',
  ],
  [DashboardInventoryOverviewColor.Gray]: [
    'ui-bg-gray-100',
    'ui-bg-gray-200',
    'ui-bg-gray-400',
    'ui-bg-gray-600',
    'ui-bg-gray-800',
  ],
}

export const LEGEND_LABELS = ['0-10%', '10-25%', '25-50%', '50-90%', '90-100%']
