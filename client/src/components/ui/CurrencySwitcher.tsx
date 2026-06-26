import { useCurrency, type Currency } from "@/lib/currency"

const OPTIONS: { value: Currency; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "TZS", label: "TSH" },
]

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency()
  return (
    <div className={`inline-flex border border-border rounded-full overflow-hidden ${className}`}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setCurrency(o.value)}
          aria-pressed={currency === o.value}
          className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
            currency === o.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
