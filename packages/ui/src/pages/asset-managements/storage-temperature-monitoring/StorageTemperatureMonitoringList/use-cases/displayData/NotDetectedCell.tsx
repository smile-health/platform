export const NotDetectedCell = ({ message }: { message: string }) => {
  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-flex ui-items-center ui-gap-1">
        <span className="ui-text-sm">{message}</span>
      </div>
    </div>
  )
}
