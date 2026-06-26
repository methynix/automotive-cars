import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type Currency = "USD" | "TZS"

const CURRENCY_KEY = "fa_currency"
const RATE_KEY = "fa_fx_usd_tzs"
const RATE_TTL = 1000 * 60 * 60 * 24 // refresh the rate once a day
const FALLBACK_RATE = 2600           // sane default if the API is unavailable

interface CurrencyCtx {
  currency: Currency
  setCurrency: (c: Currency) => void
  rate: number // TZS per 1 USD
  ready: boolean
}

const Ctx = createContext<CurrencyCtx>(null!)

export function formatUSD(n: number) { return `$${Math.round(n).toLocaleString()}` }
export function formatTZS(n: number) { return `TSh ${Math.round(n).toLocaleString()}` }

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Remembered across sessions so a returning visitor keeps their choice.
  const [currency, setCurrencyState] = useState<Currency>(
    () => ((typeof localStorage !== "undefined" && localStorage.getItem(CURRENCY_KEY)) as Currency) || "USD"
  )
  const [rate, setRate] = useState<number>(FALLBACK_RATE)
  const [ready, setReady] = useState(false)

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c)
    try { localStorage.setItem(CURRENCY_KEY, c) } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    // Use a cached rate if it's still fresh.
    try {
      const raw = localStorage.getItem(RATE_KEY)
      if (raw) {
        const cached = JSON.parse(raw)
        if (cached?.rate && Date.now() - cached.ts < RATE_TTL) { setRate(cached.rate); setReady(true); return }
      }
    } catch { /* ignore */ }

    const key = import.meta.env.VITE_EXCHANGERATE_API_KEY
    if (!key) { setReady(true); return } // fall back to FALLBACK_RATE

    fetch(`https://v6.exchangerate-api.com/v6/${key}/latest/USD`)
      .then((r) => r.json())
      .then((d) => {
        const r = d?.conversion_rates?.TZS
        if (r) {
          setRate(r)
          try { localStorage.setItem(RATE_KEY, JSON.stringify({ rate: r, ts: Date.now() })) } catch { /* ignore */ }
        }
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => setReady(true))
  }, [])

  return <Ctx.Provider value={{ currency, setCurrency, rate, ready }}>{children}</Ctx.Provider>
}

export function useCurrency() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}

// Returns the price string in whichever currency is currently selected.
export function usePriceFormatter() {
  const { currency, rate } = useCurrency()
  return (usd?: number | null) => {
    if (usd == null) return "Price on request"
    return currency === "USD" ? formatUSD(usd) : formatTZS(usd * rate)
  }
}
