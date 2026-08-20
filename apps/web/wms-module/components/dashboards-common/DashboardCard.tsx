import { PropsWithChildren, ReactNode } from 'react';

type RootProps = PropsWithChildren<{
  className?: string;
}>;

function Root({ children, className }: RootProps) {
  return (
    <div
      className={`ui-bg-white ui-rounded-lg ui-border ui-border-gray-200 ui-shadow-sm ui-p-4 ${
        className ?? ''
      }`}
    >
      {children}
    </div>
  );
}

type HeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="ui-flex ui-items-start ui-justify-between ui-gap-4 ui-mb-4">
      <div>
        <h3 className="ui-text-base ui-font-semibold ui-text-gray-900">
          {title}
        </h3>
        {subtitle && (
          <p className="ui-text-sm ui-text-gray-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function Body({ children }: PropsWithChildren<{}>) {
  return <div className="ui-w-full">{children}</div>;
}

/**
 * Lightweight local Card primitive for dashboard pages.
 *
 * There is no shared Card/StatTile primitive in @repo/ui yet, so this is a
 * simple Tailwind-based Root/Header/Body compound component (a scaled-down
 * cousin of the transaction-monitoring `DashboardBox` pattern, without the
 * export/filter context wiring those dashboards need). Shared here so the 9
 * new dashboard pages under `components/dashboards/*` don't each reinvent it.
 */
const DashboardCard = { Root, Header, Body };

export default DashboardCard;
