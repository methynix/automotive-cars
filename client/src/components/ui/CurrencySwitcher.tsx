import { useCurrency, type BaseCurrency } from "@/lib/currency"

const OPTIONS: { value: BaseCurrency; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "CNY", label: "CNY" },
]

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { base, setBase } = useCurrency()
  return (
    <div className={`inline-flex border border-border rounded-full overflow-hidden ${className}`}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setBase(o.value)}
          aria-pressed={base === o.value}
          className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
            base === o.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
