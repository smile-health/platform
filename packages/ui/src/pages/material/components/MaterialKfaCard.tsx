type MaterialKfaCardProps = {
  label: string
  value?: number | string | null
}

export const MaterialKfaCard = ({ label, value }: MaterialKfaCardProps) => {
  return (
    <div className="ui-border ui-rounded-lg ui-bg-gray-100 ui-space-y-1 p-3">
      <div className="ui-text-gray-500">{label}</div>
      <div className="ui-text-primary-500">{value ?? '-'}</div>
    </div>
  )
}
