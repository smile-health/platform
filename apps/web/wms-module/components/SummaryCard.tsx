interface SummaryCardProps {
  label: string;
  value: string | number;
  description?: string;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  description,
  className = '',
}) => {
  return (
    <div
      className={`ui-bg-neutral-50 ui-border ui-border-neutral-300 ui-rounded-md ui-p-4 ui-w-full ${className}`}
    >
      <p className="ui-text-sm ui-text-neutral-500">{label}</p>
      <div className="ui-flex ui-flex-row ui-items-center">
        <p className="ui-text-2xl ui-font-bold ui-text-neutral-900">{value}</p>
        {description && (
          <p className="ui-text-xl ui-font-bold ui-text-neutral-600 ui-ml-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
