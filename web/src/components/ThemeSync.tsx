import { useEffect } from 'react'
import { useColors } from '../hooks/useColors'
import { useSettings } from '../context/SettingsContext'

export default function ThemeSync() {
  const c = useColors()
  const { settings } = useSettings()

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', settings.theme)
    root.style.colorScheme = settings.theme === 'light' ? 'light' : 'dark'
    const vars: Record<string, string | number> = {
      '--void': c.void,
      '--base': c.base,
      '--surface': c.surface,
      '--card': c.card,
      '--rim': c.rim,
      '--rim2': c.rim2,
      '--gain': c.gain,
      '--gain-dim': c.gainDim,
      '--loss': c.loss,
      '--loss-dim': c.lossDim,
      '--amber': c.amber,
      '--amber-dim': c.amberDim,
      '--blue': c.blue,
      '--blue-dim': c.blueDim,
      '--t1': c.t1,
      '--t2': c.t2,
      '--t3': c.t3,
      '--t4': c.t4,
      '--primary': c.primary,
      '--radius': `${c.radius + 4}px`,
    }
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, String(v)))
    document.body.style.background = c.void
    document.body.style.color = c.t1
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', c.void)
  }, [c, settings.theme])

  return null
}
