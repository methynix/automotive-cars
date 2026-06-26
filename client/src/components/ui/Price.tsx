import { useCurrency, formatUSD, formatTZS } from "@/lib/currency"

// Dual-price display: the selected currency is primary (bold), the other is a
// small muted secondary line beneath it (Porsche-style).
export function Price({
  usd, size = "md", className = "",
}: { usd?: number | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const { currency, rate } = useCurrency()

  if (usd == null) {
    return <span className={`font-archivo font-extrabold ${className}`}>Price on request</span>
  }

  const usdStr = formatUSD(usd)
  const tzsStr = formatTZS(usd * rate)
  const primary = currency === "USD" ? usdStr : tzsStr
  const secondary = currency === "USD" ? tzsStr : usdStr

  const primaryCls = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-lg"

  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span className={`font-archivo font-extrabold text-foreground ${primaryCls}`}>{primary}</span>
      <span className="text-[11px] font-mono text-muted-foreground">{secondary}</span>
    </span>
  )
}
