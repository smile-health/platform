import { RefObject, useEffect, useState } from "react";

interface UseIntersectionObserverProps {
  ref: RefObject<Element>
  options?: IntersectionObserverInit
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  ref,
  options = {},
  freezeOnceVisible = false,
}: UseIntersectionObserverProps): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref?.current

    // Return early if element is not defined or if we already saw it and freeze is enabled
    if (!element || (freezeOnceVisible && isIntersecting)) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref, options, freezeOnceVisible, isIntersecting])

  return isIntersecting
}
