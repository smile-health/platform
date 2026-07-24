import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Spinner } from '#components/spinner'

type Props = {
  children: ReactNode
  hasMore: boolean
  loadMore: () => void
  loading: boolean
  threshold?: number
  maxHeight?: string
  minHeight?: string
}

const InfiniteScrollContainer: React.FC<Props> = ({
  children,
  hasMore,
  loadMore,
  loading,
  threshold = 25,
  maxHeight = '500px',
  minHeight = '400px',
}) => {
  const observerRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    if (loading || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore()
        }
      },
      {
        root: containerRef.current,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0,
      }
    )

    const currentObserverRef = observerRef.current
    if (currentObserverRef) observer.observe(currentObserverRef)

    return () => {
      if (currentObserverRef) observer.unobserve(currentObserverRef)
    }
  }, [loading, hasMore, loadMore, threshold])

  // Track scroll position and container height for overlay positioning
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
      setContainerHeight(container.clientHeight)
    }

    // Initial values
    handleScroll()

    container.addEventListener('scroll', handleScroll)

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="ui-overflow-y-auto ui-relative"
      style={{
        minHeight,
        maxHeight,
      }}
    >
      {/* Always render children - don't hide them during loading */}
      {children}

      {/* Observer element - only show when there's more content */}
      {hasMore && (
        <div ref={observerRef} style={{ height: "1px" }} />
      )}

      {/* Loading overlay - positioned based on scroll position */}
      {loading && (
        <div
          className="ui-absolute ui-left-0 ui-right-0 ui-bg-white ui-bg-opacity-40 ui-flex ui-justify-center ui-items-center ui-z-10"
          style={{
            top: scrollTop,
            height: containerHeight,
          }}
        >
          <Spinner className="ui-w-8 ui-h-8" />
        </div>
      )}
    </div>
  )
}

export default InfiniteScrollContainer