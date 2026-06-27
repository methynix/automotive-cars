import { useCurrency, formatUSD, formatCNY, formatTZS } from "@/lib/currency"

// Dual-price: the selected official currency (USD or CNY) is the bold primary,
// and the converted local TZS price sits beneath it in muted grey.
export function Price({
  usd, size = "md", className = "",
}: { usd?: number | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const { base, rates } = useCurrency()

  if (usd == null) {
    return <span className={`font-archivo font-extrabold ${className}`}>Price on request</span>
  }

  const primary = base === "USD" ? formatUSD(usd) : formatCNY(usd * rates.usdCny)
  const tzs = formatTZS(usd * rates.usdTzs) // conversion_rate × base price → TZS

  const primaryCls = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-lg"

  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span className={`font-archivo font-extrabold text-foreground ${primaryCls}`}>{primary}</span>
      <span className="text-[11px] font-mono text-muted-foreground">{tzs}</span>
    </span>
  )
}
