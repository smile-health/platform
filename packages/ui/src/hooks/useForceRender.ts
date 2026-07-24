import { useState } from 'react'

export default function useForceRender() {
  const [count, setCount] = useState(0)

  return {
    count,
    setCount,
    forceRender: () => setCount((prev) => prev + 1),
  }
}
