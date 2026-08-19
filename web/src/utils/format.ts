export function fmt(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtChg(n: number | null | undefined): string {
  if (n == null) return '—'
  return (n >= 0 ? '+' : '') + fmt(n) + '%'
}

export function fmtMcap(v: number | null | undefined, compact = true): string {
  if (!v) return '—'
  if (!compact) {
    return '$' + Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  if (v > 1e12) return '$' + fmt(v / 1e12, 2) + 'T'
  if (v > 1e9) return '$' + fmt(v / 1e9, 1) + 'B'
  return '$' + fmt(v / 1e6, 0) + 'M'
}

export function chgDir(n: number | null | undefined): 'up' | 'dn' | 'flat' {
  if (n == null) return 'flat'
  return n > 0 ? 'up' : n < 0 ? 'dn' : 'flat'
}
