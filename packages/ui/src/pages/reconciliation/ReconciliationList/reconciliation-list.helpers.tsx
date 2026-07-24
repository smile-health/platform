import { Skeleton } from '#components/skeleton'

export const capitalize = (text: string) => {
  if (text.includes(' '))
    return text
      .split(' ')
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
      .join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() || ''
}

export const textGrouper = ({
  text1,
  text2 = null,
  separator = ', ',
}: {
  text1: string
  text2?: string | null
  separator?: string
}) => {
  if (!text2 || text2 === null) return text1
  return `${text1}${separator}${text2}`
}

export const TitleBlock = ({
  arrText,
}: {
  arrText: Array<{
    label: string
    className?: string
    isLoading?: boolean
  }>
}) => (
  <div>
    {arrText.map(
      (item, index) =>
        item.label && (
          <div
            key={`_${index.toString()}`}
            className={`${item.className ?? 'ui-text-dark-teal'} ui-text-sm`}
          >
            {item.isLoading ? (
              <Skeleton className="ui-w-1/2 ui-h-5" />
            ) : (
              item.label
            )}
          </div>
        )
    )}
  </div>
)
