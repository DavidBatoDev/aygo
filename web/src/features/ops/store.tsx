import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createSeed } from './seed'
import { uid, type DemoData, type Sheet } from './model'

interface OpsContextValue {
  data: DemoData
  sheet: Sheet | null
  open: (sheet: Sheet | null) => void
  commit: (update: (current: DemoData) => DemoData, message: string) => void
  notify: (message: string) => void
  reset: () => void
  toast: { id: string; message: string } | null
}
const OpsContext = createContext<OpsContextValue | null>(null)

export function OpsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(createSeed)
  const [sheet, open] = useState<Sheet | null>(null)
  const [toast, setToast] = useState<OpsContextValue['toast']>(null)
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])
  const notify = (message: string) => setToast({ id: uid(), message })
  const commit = (update: (current: DemoData) => DemoData, message: string) => { setData(update); notify(message) }
  const reset = () => { setData(createSeed()); open(null); notify('Demo reset. You’re ready for a fresh walkthrough.') }
  return <OpsContext.Provider value={{ data, sheet, open, commit, notify, reset, toast }}>{children}</OpsContext.Provider>
}

export function useOps() {
  const context = useContext(OpsContext)
  if (!context) throw new Error('OpsProvider is required')
  return context
}
