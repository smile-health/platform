import { RefObject, useEffect } from 'react'

type Event = MouseEvent | TouchEvent
type Handler = (event: MouseEvent | TouchEvent) => void

export function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  handler: Handler,
  ignoredElements: string[] = ['svg', 'path', 'circle'] // ['svg', 'path', 'circle', etc.]
) {
  useEffect(() => {
    const listener = (event: Event) => {
      const target = event.target as Element
      // Ignore if clicking on specified elements
      if (
        ignoredElements.includes(target.tagName.toLowerCase()) ||
        target.closest('button') ||
        target.closest('.ui-form-select') ||
        target.closest('.ui-date-picker-popover') ||
        target.id?.includes('date-picker') ||
        target.id?.includes('month-picker')
      ) {
        return
      }

      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
