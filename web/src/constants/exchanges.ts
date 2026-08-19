export interface Session { oh: number; om: number; ch: number; cm: number }
export interface Exchange {
  name: string
  full: string
  flag: string
  tz: string
  sessions: Session[]
  region: string
  weekends?: number[]
}

export const EXCHANGES: Exchange[] = [
  { name: 'NYSE', full: 'New York Stock Exchange', flag: '🇺🇸', tz: 'America/New_York', sessions: [{ oh: 9, om: 30, ch: 16, cm: 0 }], region: 'Americas' },
  { name: 'NASDAQ', full: 'NASDAQ', flag: '🇺🇸', tz: 'America/New_York', sessions: [{ oh: 9, om: 30, ch: 16, cm: 0 }], region: 'Americas' },
  { name: 'TSX', full: 'Toronto Stock Exchange', flag: '🇨🇦', tz: 'America/Toronto', sessions: [{ oh: 9, om: 30, ch: 16, cm: 0 }], region: 'Americas' },
  { name: 'BMV', full: 'Bolsa Mexicana de Valores', flag: '🇲🇽', tz: 'America/Mexico_City', sessions: [{ oh: 8, om: 30, ch: 15, cm: 0 }], region: 'Americas' },
  { name: 'B3', full: 'B3 Brazil', flag: '🇧🇷', tz: 'America/Sao_Paulo', sessions: [{ oh: 10, om: 0, ch: 17, cm: 55 }], region: 'Americas' },
  { name: 'BYMA', full: 'Buenos Aires Stock Exchange', flag: '🇦🇷', tz: 'America/Argentina/Buenos_Aires', sessions: [{ oh: 11, om: 0, ch: 17, cm: 0 }], region: 'Americas' },
  { name: 'LSE', full: 'London Stock Exchange', flag: '🇬🇧', tz: 'Europe/London', sessions: [{ oh: 8, om: 0, ch: 16, cm: 30 }], region: 'Europe' },
  { name: 'XETRA', full: 'Deutsche Börse', flag: '🇩🇪', tz: 'Europe/Berlin', sessions: [{ oh: 9, om: 0, ch: 17, cm: 30 }], region: 'Europe' },
  { name: 'Euronext', full: 'Euronext Paris / Amsterdam', flag: '🇫🇷', tz: 'Europe/Paris', sessions: [{ oh: 9, om: 0, ch: 17, cm: 30 }], region: 'Europe' },
  { name: 'SIX', full: 'SIX Swiss Exchange', flag: '🇨🇭', tz: 'Europe/Zurich', sessions: [{ oh: 9, om: 0, ch: 17, cm: 30 }], region: 'Europe' },
  { name: 'OMX', full: 'OMX Stockholm', flag: '🇸🇪', tz: 'Europe/Stockholm', sessions: [{ oh: 9, om: 0, ch: 17, cm: 30 }], region: 'Europe' },
  { name: 'Oslo', full: 'Oslo Børs', flag: '🇳🇴', tz: 'Europe/Oslo', sessions: [{ oh: 9, om: 0, ch: 16, cm: 30 }], region: 'Europe' },
  { name: 'MOEX', full: 'Moscow Exchange', flag: '🇷🇺', tz: 'Europe/Moscow', sessions: [{ oh: 9, om: 50, ch: 18, cm: 50 }], region: 'Europe' },
  { name: 'WSE', full: 'Warsaw Stock Exchange', flag: '🇵🇱', tz: 'Europe/Warsaw', sessions: [{ oh: 9, om: 0, ch: 17, cm: 5 }], region: 'Europe' },
  { name: 'BVB', full: 'Bucharest Stock Exchange', flag: '🇷🇴', tz: 'Europe/Bucharest', sessions: [{ oh: 10, om: 0, ch: 18, cm: 0 }], region: 'Europe' },
  { name: 'IBEX', full: 'BME (Madrid)', flag: '🇪🇸', tz: 'Europe/Madrid', sessions: [{ oh: 9, om: 0, ch: 17, cm: 30 }], region: 'Europe' },
  { name: 'TSE', full: 'Tokyo Stock Exchange', flag: '🇯🇵', tz: 'Asia/Tokyo', sessions: [{ oh: 9, om: 0, ch: 11, cm: 30 }, { oh: 12, om: 30, ch: 15, cm: 30 }], region: 'Asia-Pacific' },
  { name: 'SSE', full: 'Shanghai Stock Exchange', flag: '🇨🇳', tz: 'Asia/Shanghai', sessions: [{ oh: 9, om: 30, ch: 11, cm: 30 }, { oh: 13, om: 0, ch: 15, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'HKEX', full: 'Hong Kong Exchange', flag: '🇭🇰', tz: 'Asia/Hong_Kong', sessions: [{ oh: 9, om: 30, ch: 12, cm: 0 }, { oh: 13, om: 0, ch: 16, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'SGX', full: 'Singapore Exchange', flag: '🇸🇬', tz: 'Asia/Singapore', sessions: [{ oh: 9, om: 0, ch: 17, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'BSE', full: 'BSE / NSE India', flag: '🇮🇳', tz: 'Asia/Kolkata', sessions: [{ oh: 9, om: 15, ch: 15, cm: 30 }], region: 'Asia-Pacific' },
  { name: 'ASX', full: 'Australian Securities Exchange', flag: '🇦🇺', tz: 'Australia/Sydney', sessions: [{ oh: 10, om: 0, ch: 16, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'KRX', full: 'Korea Exchange', flag: '🇰🇷', tz: 'Asia/Seoul', sessions: [{ oh: 9, om: 0, ch: 15, cm: 30 }], region: 'Asia-Pacific' },
  { name: 'TWSE', full: 'Taiwan Stock Exchange', flag: '🇹🇼', tz: 'Asia/Taipei', sessions: [{ oh: 9, om: 0, ch: 13, cm: 30 }], region: 'Asia-Pacific' },
  { name: 'NZX', full: 'NZX New Zealand', flag: '🇳🇿', tz: 'Pacific/Auckland', sessions: [{ oh: 10, om: 0, ch: 17, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'SET', full: 'Stock Exchange of Thailand', flag: '🇹🇭', tz: 'Asia/Bangkok', sessions: [{ oh: 10, om: 0, ch: 12, cm: 30 }, { oh: 14, om: 30, ch: 16, cm: 30 }], region: 'Asia-Pacific' },
  { name: 'IDX', full: 'Indonesia Stock Exchange', flag: '🇮🇩', tz: 'Asia/Jakarta', sessions: [{ oh: 9, om: 0, ch: 11, cm: 30 }, { oh: 13, om: 30, ch: 16, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'Tadawul', full: 'Saudi Exchange', flag: '🇸🇦', tz: 'Asia/Riyadh', sessions: [{ oh: 10, om: 0, ch: 15, cm: 0 }], weekends: [5, 6], region: 'Mid East & Africa' },
  { name: 'DFM', full: 'Dubai Financial Market', flag: '🇦🇪', tz: 'Asia/Dubai', sessions: [{ oh: 10, om: 0, ch: 14, cm: 0 }], weekends: [5, 6], region: 'Mid East & Africa' },
  { name: 'TASE', full: 'Tel Aviv Stock Exchange', flag: '🇮🇱', tz: 'Asia/Jerusalem', sessions: [{ oh: 9, om: 59, ch: 17, cm: 25 }], weekends: [5, 6], region: 'Mid East & Africa' },
  { name: 'JSE', full: 'Johannesburg Stock Exchange', flag: '🇿🇦', tz: 'Africa/Johannesburg', sessions: [{ oh: 9, om: 0, ch: 17, cm: 0 }], region: 'Mid East & Africa' },
  { name: 'EGX', full: 'Egyptian Exchange', flag: '🇪🇬', tz: 'Africa/Cairo', sessions: [{ oh: 10, om: 0, ch: 14, cm: 30 }], weekends: [5, 6], region: 'Mid East & Africa' },
  { name: 'NGX', full: 'Nigerian Exchange Group', flag: '🇳🇬', tz: 'Africa/Lagos', sessions: [{ oh: 9, om: 30, ch: 14, cm: 30 }], region: 'Mid East & Africa' },
]

export function getLocalTimeStr(tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date())
  } catch { return '' }
}

export function getExchangeStatus(ex: Exchange): { open: boolean; localTime: string } {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: ex.tz, hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false }).formatToParts(new Date())
    const weekdayStr = parts.find((p) => p.type === 'weekday')?.value ?? ''
    const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    const weekday = weekdayMap[weekdayStr] ?? 0
    const weekends = ex.weekends ?? [0, 6]
    if (weekends.includes(weekday)) return { open: false, localTime: getLocalTimeStr(ex.tz) }
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0')
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0')
    const mins = h * 60 + m
    for (const s of ex.sessions) {
      if (mins >= s.oh * 60 + s.om && mins < s.ch * 60 + s.cm) return { open: true, localTime: getLocalTimeStr(ex.tz) }
    }
    return { open: false, localTime: getLocalTimeStr(ex.tz) }
  } catch { return { open: false, localTime: '' } }
}
