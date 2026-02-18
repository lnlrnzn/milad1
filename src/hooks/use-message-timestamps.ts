"use client"

import { useState, useEffect, useRef } from "react"

/**
 * Tracks creation timestamps for chat messages.
 * Returns a ref containing a Map<messageId, Date>.
 */
export function useMessageTimestamps(messages: { id: string }[]) {
  const timestampsRef = useRef<Map<string, Date>>(new Map())
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    let updated = false
    for (const msg of messages) {
      if (!timestampsRef.current.has(msg.id)) {
        timestampsRef.current.set(msg.id, new Date())
        updated = true
      }
    }
    if (updated) forceUpdate((n) => n + 1)
  }, [messages])

  return timestampsRef
}
