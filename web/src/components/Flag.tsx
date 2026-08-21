import React from 'react'

export function emojiToIso(emoji: string): string {
  return [...emoji]
    .map((ch) => String.fromCharCode((ch.codePointAt(0) ?? 0) - 0x1f1e6 + 65))
    .join('')
    .toLowerCase()
}

const FLAGS: Record<string, React.ReactNode> = {
  us: (
    <>
      <rect width="24" height="18" fill="#b22234" />
      <rect y="1.4" width="24" height="1.4" fill="#fff" />
      <rect y="4.2" width="24" height="1.4" fill="#fff" />
      <rect y="7" width="24" height="1.4" fill="#fff" />
      <rect y="9.8" width="24" height="1.4" fill="#fff" />
      <rect y="12.6" width="24" height="1.4" fill="#fff" />
      <rect y="15.4" width="24" height="1.4" fill="#fff" />
      <rect width="10" height="9.8" fill="#3c3b6e" />
    </>
  ),
  ca: (
    <>
      <rect width="24" height="18" fill="#fff" />
      <rect width="6" height="18" fill="#ff0000" />
      <rect x="18" width="6" height="18" fill="#ff0000" />
      <path d="M12 4l1 3h3l-2.5 2 1 3L12 10l-2.5 2 1-3L8 7h3z" fill="#ff0000" />
    </>
  ),
  mx: (
    <>
      <rect width="8" height="18" fill="#006847" />
      <rect x="8" width="8" height="18" fill="#fff" />
      <rect x="16" width="8" height="18" fill="#ce1126" />
    </>
  ),
  br: (
    <>
      <rect width="24" height="18" fill="#009b3a" />
      <polygon points="12,3 21,9 12,15 3,9" fill="#fedf00" />
      <circle cx="12" cy="9" r="3.2" fill="#002776" />
    </>
  ),
  ar: (
    <>
      <rect width="24" height="6" fill="#74acdf" />
      <rect y="6" width="24" height="6" fill="#fff" />
      <rect y="12" width="24" height="6" fill="#74acdf" />
      <circle cx="12" cy="9" r="1.8" fill="#f6b40e" />
    </>
  ),
  gb: (
    <>
      <rect width="24" height="18" fill="#012169" />
      <path d="M0 0l24 18M24 0L0 18" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0l24 18M24 0L0 18" stroke="#c8102e" strokeWidth="1.6" />
      <path d="M12 0v18M0 9h24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0v18M0 9h24" stroke="#c8102e" strokeWidth="3" />
    </>
  ),
  de: (
    <>
      <rect width="24" height="6" fill="#000" />
      <rect y="6" width="24" height="6" fill="#dd0000" />
      <rect y="12" width="24" height="6" fill="#ffce00" />
    </>
  ),
  fr: (
    <>
      <rect width="8" height="18" fill="#002395" />
      <rect x="8" width="8" height="18" fill="#fff" />
      <rect x="16" width="8" height="18" fill="#ed2939" />
    </>
  ),
  ch: (
    <>
      <rect width="24" height="18" fill="#ff0000" />
      <rect x="10" y="3.5" width="4" height="11" fill="#fff" />
      <rect x="6.5" y="7" width="11" height="4" fill="#fff" />
    </>
  ),
  se: (
    <>
      <rect width="24" height="18" fill="#006aa7" />
      <rect x="7" width="4" height="18" fill="#fecc00" />
      <rect y="7" width="24" height="4" fill="#fecc00" />
    </>
  ),
  no: (
    <>
      <rect width="24" height="18" fill="#ef2b2d" />
      <rect x="7" width="4" height="18" fill="#fff" />
      <rect y="7" width="24" height="4" fill="#fff" />
      <rect x="8" width="2" height="18" fill="#002868" />
      <rect y="8" width="24" height="2" fill="#002868" />
    </>
  ),
  ru: (
    <>
      <rect width="24" height="6" fill="#fff" />
      <rect y="6" width="24" height="6" fill="#0039a6" />
      <rect y="12" width="24" height="6" fill="#d52b1e" />
    </>
  ),
  pl: (
    <>
      <rect width="24" height="9" fill="#fff" />
      <rect y="9" width="24" height="9" fill="#dc143c" />
    </>
  ),
  ro: (
    <>
      <rect width="8" height="18" fill="#002b7f" />
      <rect x="8" width="8" height="18" fill="#fcd116" />
      <rect x="16" width="8" height="18" fill="#ce1126" />
    </>
  ),
  es: (
    <>
      <rect width="24" height="18" fill="#c60b1e" />
      <rect y="4.5" width="24" height="9" fill="#ffc400" />
    </>
  ),
  jp: (
    <>
      <rect width="24" height="18" fill="#fff" />
      <circle cx="12" cy="9" r="5" fill="#bc002d" />
    </>
  ),
  cn: (
    <>
      <rect width="24" height="18" fill="#de2910" />
      <polygon points="5,3.2 6.1,6.4 9.5,6.4 6.8,8.4 7.8,11.6 5,9.6 2.2,11.6 3.2,8.4 0.5,6.4 3.9,6.4" fill="#ffde00" />
    </>
  ),
  hk: (
    <>
      <rect width="24" height="18" fill="#de2910" />
      <circle cx="12" cy="9" r="4.2" fill="#fff" />
      <circle cx="12" cy="9" r="1.6" fill="#de2910" />
    </>
  ),
  sg: (
    <>
      <rect width="24" height="9" fill="#ef3340" />
      <rect y="9" width="24" height="9" fill="#fff" />
      <circle cx="5.5" cy="4.6" r="2.4" fill="#fff" />
      <circle cx="6.6" cy="4.6" r="2" fill="#ef3340" />
    </>
  ),
  in: (
    <>
      <rect width="24" height="6" fill="#ff9933" />
      <rect y="6" width="24" height="6" fill="#fff" />
      <rect y="12" width="24" height="6" fill="#138808" />
      <circle cx="12" cy="9" r="2.2" fill="none" stroke="#000080" strokeWidth="0.7" />
    </>
  ),
  au: (
    <>
      <rect width="24" height="18" fill="#012169" />
      <rect width="12" height="9" fill="#012169" />
      <path d="M0 0l12 9M12 0L0 9" stroke="#fff" strokeWidth="1.4" />
      <path d="M6 0v9M0 4.5h12" stroke="#fff" strokeWidth="2.2" />
      <path d="M6 0v9M0 4.5h12" stroke="#c8102e" strokeWidth="1.1" />
      <circle cx="17" cy="12" r="1.1" fill="#fff" />
      <circle cx="20.5" cy="8.5" r="0.7" fill="#fff" />
      <circle cx="15" cy="8" r="0.7" fill="#fff" />
      <circle cx="21" cy="14.5" r="0.6" fill="#fff" />
      <circle cx="14.2" cy="14.2" r="0.6" fill="#fff" />
    </>
  ),
  kr: (
    <>
      <rect width="24" height="18" fill="#fff" />
      <circle cx="12" cy="9" r="4" fill="#cd2e3a" />
      <path d="M8 9a4 4 0 0 0 8 0" fill="#0047a0" />
    </>
  ),
  tw: (
    <>
      <rect width="24" height="18" fill="#fe0000" />
      <rect width="12" height="9.5" fill="#000095" />
      <polygon points="6,1.4 7,4.4 10.2,4.4 7.6,6.2 8.6,9.2 6,7.4 3.4,9.2 4.4,6.2 1.8,4.4 5,4.4" fill="#fff" />
    </>
  ),
  nz: (
    <>
      <rect width="24" height="18" fill="#012169" />
      <path d="M0 0l12 9M12 0L0 9" stroke="#fff" strokeWidth="1.4" />
      <path d="M6 0v9M0 4.5h12" stroke="#fff" strokeWidth="2.2" />
      <path d="M6 0v9M0 4.5h12" stroke="#c8102e" strokeWidth="1.1" />
      <polygon points="16.5,7 17.1,8.8 19,8.8 17.5,9.9 18.1,11.7 16.5,10.6 14.9,11.7 15.5,9.9 14,8.8 15.9,8.8" fill="#fff" />
      <polygon points="16.5,7.4 17,8.8 18.6,8.8 17.3,9.7 17.8,11.2 16.5,10.3 15.2,11.2 15.7,9.7 14.4,8.8 16,8.8" fill="#c8102e" />
    </>
  ),
  th: (
    <>
      <rect width="24" height="18" fill="#a51931" />
      <rect y="3" width="24" height="12" fill="#fff" />
      <rect y="6" width="24" height="6" fill="#2d2a4a" />
    </>
  ),
  id: (
    <>
      <rect width="24" height="9" fill="#ce1126" />
      <rect y="9" width="24" height="9" fill="#fff" />
    </>
  ),
  sa: (
    <>
      <rect width="24" height="18" fill="#006c35" />
      <rect x="5" y="11.5" width="14" height="1.4" fill="#fff" />
    </>
  ),
  ae: (
    <>
      <rect width="24" height="6" fill="#00732f" />
      <rect y="6" width="24" height="6" fill="#fff" />
      <rect y="12" width="24" height="6" fill="#000" />
      <rect width="7" height="18" fill="#ff0000" />
    </>
  ),
  il: (
    <>
      <rect width="24" height="18" fill="#fff" />
      <rect y="2" width="24" height="2.2" fill="#0038b8" />
      <rect y="13.8" width="24" height="2.2" fill="#0038b8" />
      <path d="M12 5.6l3.2 5.4H8.8z" fill="none" stroke="#0038b8" strokeWidth="0.8" />
      <path d="M12 12.4l3.2-5.4H8.8z" fill="none" stroke="#0038b8" strokeWidth="0.8" />
    </>
  ),
  za: (
    <>
      <rect width="24" height="18" fill="#de3831" />
      <rect y="9" width="24" height="9" fill="#002395" />
      <polygon points="0,0 10,9 0,18" fill="#007a4d" />
      <polygon points="0,3 8,9 0,15" fill="#ffb81c" />
      <polygon points="0,5 6,9 0,13" fill="#000" />
    </>
  ),
  eg: (
    <>
      <rect width="24" height="6" fill="#ce1126" />
      <rect y="6" width="24" height="6" fill="#fff" />
      <rect y="12" width="24" height="6" fill="#000" />
      <circle cx="12" cy="9" r="1.6" fill="#c09300" />
    </>
  ),
  ng: (
    <>
      <rect width="8" height="18" fill="#008751" />
      <rect x="8" width="8" height="18" fill="#fff" />
      <rect x="16" width="8" height="18" fill="#008751" />
    </>
  ),
}

export default function Flag({ emoji, title }: { emoji: string; title?: string }) {
  const iso = emojiToIso(emoji)
  const inner = FLAGS[iso]
  return (
    <svg
      className="hours-flag"
      viewBox="0 0 24 18"
      width={24}
      height={18}
      aria-label={title || iso.toUpperCase()}
      role="img"
    >
      {inner ?? <rect width="24" height="18" fill="#263050" />}
    </svg>
  )
}
