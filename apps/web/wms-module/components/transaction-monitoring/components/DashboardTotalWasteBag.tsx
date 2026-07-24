import DashboardBox from './DashboardBox';

type Props = Readonly<{
  id: string;
  value?: string | number;
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  exportFileName: string;
}>;

export default function DashboardTotalWasteBag({
  id,
  value,
  title,
  subtitle,
  isLoading,
  exportFileName,
}: Props) {
  return (
    <div className="ui-col-span-3">
      <DashboardBox.Root id={id}>
        <DashboardBox.Header>
          <h4>
            <strong>{title}</strong>
          </h4>
          {subtitle && <p className="ui-text-base">{subtitle}</p>}
        </DashboardBox.Header>
        <DashboardBox.Body>
          <DashboardBox.Config
            download={{
              targetElementId: id,
              fileName: exportFileName,
            }}
          />
          <DashboardBox.Content isLoading={isLoading}>
            <div className="ui-text-center ui-p-20">
              <p className="ui-text-3xl">
                <strong>{value}</strong>
              </p>
            </div>
          </DashboardBox.Content>
        </DashboardBox.Body>
      </DashboardBox.Root>
    </div>
  );
}
