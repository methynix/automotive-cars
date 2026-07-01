import { useCurrency, type BaseCurrency } from "@/lib/currency"

const OPTIONS: { value: BaseCurrency; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "CNY", label: "CNY" },
]

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { base, setBase } = useCurrency()
  return (
    <div className={`inline-flex border border-border -skew-x-[8deg] ${className}`}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setBase(o.value)}
          aria-pressed={base === o.value}
          className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
            base === o.value ? "bg-foreground text-background" : "bg-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="skew-x-[8deg]">{o.label}</div>
        </button>
      ))}
    </div>
  )
}
