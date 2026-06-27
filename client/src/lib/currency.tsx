import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

// The "official" currency a shopper can toggle between. Prices are stored in USD;
// CNY is derived (cars are sourced from China) and TZS is always shown as the
// local converted price underneath.
export type BaseCurrency = "USD" | "CNY"

const BASE_KEY = "fa_base_currency"
const RATES_KEY = "fa_fx_rates_v2"
const RATES_TTL = 1000 * 60 * 60 * 24 // refresh once a day

// Used only if the API/key is unavailable, so the UI still shows sensible numbers.
const FALLBACK = { usdTzs: 2605, usdCny: 7.1 }

interface Rates { usdTzs: number; usdCny: number }

interface CurrencyCtx {
  base: BaseCurrency
  setBase: (b: BaseCurrency) => void
  rates: Rates
  ready: boolean
}

const Ctx = createContext<CurrencyCtx>(null!)

export function formatUSD(n: number) { return `$${Math.round(n).toLocaleString()}` }
export function formatCNY(n: number) { return `¥${Math.round(n).toLocaleString()}` }
export function formatTZS(n: number) { return `TSh ${Math.round(n).toLocaleString()}` }

// exchangerate-api v6 "pair" endpoint -> { conversion_rate }
async function fetchPair(key: string, from: string, to: string): Promise<number | null> {
  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${key}/pair/${from}/${to}`)
    const data = await res.json()
    return data?.result === "success" && typeof data.conversion_rate === "number" ? data.conversion_rate : null
  } catch { return null }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [base, setBaseState] = useState<BaseCurrency>(
    () => ((typeof localStorage !== "undefined" && localStorage.getItem(BASE_KEY)) as BaseCurrency) || "USD"
  )
  const [rates, setRates] = useState<Rates>(FALLBACK)
  const [ready, setReady] = useState(false)

  const setBase = useCallback((b: BaseCurrency) => {
    setBaseState(b)
    try { localStorage.setItem(BASE_KEY, b) } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    // Fresh cached rates?
    try {
      const raw = localStorage.getItem(RATES_KEY)
      if (raw) {
        const c = JSON.parse(raw)
        if (c?.usdTzs && c?.usdCny && Date.now() - c.ts < RATES_TTL) {
          setRates({ usdTzs: c.usdTzs, usdCny: c.usdCny }); setReady(true); return
        }
      }
    } catch { /* ignore */ }

    const key = import.meta.env.VITE_EXCHANGERATE_API_KEY
    if (!key) { setReady(true); return } // keep fallback

    Promise.all([fetchPair(key, "USD", "TZS"), fetchPair(key, "USD", "CNY")])
      .then(([usdTzs, usdCny]) => {
        const next = { usdTzs: usdTzs ?? FALLBACK.usdTzs, usdCny: usdCny ?? FALLBACK.usdCny }
        setRates(next)
        try { localStorage.setItem(RATES_KEY, JSON.stringify({ ...next, ts: Date.now() })) } catch { /* ignore */ }
      })
      .finally(() => setReady(true))
  }, [])

  return <Ctx.Provider value={{ base, setBase, rates, ready }}>{children}</Ctx.Provider>
}

export function useCurrency() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}

// Given a USD price, return the official price string in the selected base currency.
export function usePriceFormatter() {
  const { base, rates } = useCurrency()
  return (usd?: number | null) => {
    if (usd == null) return "Price on request"
    return base === "USD" ? formatUSD(usd) : formatCNY(usd * rates.usdCny)
  }
}
