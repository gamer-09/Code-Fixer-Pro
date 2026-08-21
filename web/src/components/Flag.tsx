import React, { useState } from 'react'

/** Windows cannot render emoji flags (shows "JP"). Use a real flag image instead. */
export function emojiToIso(emoji: string): string {
  return [...emoji]
    .map((ch) => {
      const cp = ch.codePointAt(0) ?? 0
      return String.fromCharCode(cp - 0x1f1e6 + 65)
    })
    .join('')
    .toLowerCase()
}

export default function Flag({ emoji, title }: { emoji: string; title?: string }) {
  const iso = emojiToIso(emoji)
  const [failed, setFailed] = useState(false)
  if (!iso || iso.length !== 2 || failed) {
    return <span className="hours-flag hours-flag-fallback">{emoji}</span>
  }
  return (
    <img
      className="hours-flag"
      src={`https://flagcdn.com/h24/${iso}.png`}
      srcSet={`https://flagcdn.com/h48/${iso}.png 2x`}
      width={24}
      height={18}
      alt={title || iso.toUpperCase()}
      title={title}
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
