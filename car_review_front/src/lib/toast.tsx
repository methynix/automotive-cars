import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi"

type ToastKind = "success" | "error" | "info"
interface Toast { id: number; kind: ToastKind; message: string }

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void
  success: (message: string) => void
  error: (message: string) => void
}

const Ctx = createContext<ToastCtx>(null!)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, kind, message }])
    setTimeout(() => remove(id), 3500)
  }, [remove])

  const success = useCallback((m: string) => toast(m, "success"), [toast])
  const error = useCallback((m: string) => toast(m, "error"), [toast])

  return (
    <Ctx.Provider value={{ toast, success, error }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-[320px] max-w-[calc(100vw-3rem)]">
        {toasts.map((t) => (
          <div key={t.id}
            className={`flex items-start gap-3 border bg-background shadow-lg px-4 py-3 animate-[slideIn_0.2s_ease-out] ${
              t.kind === "success" ? "border-green-600" : t.kind === "error" ? "border-primary" : "border-border"
            }`}>
            {t.kind === "error"
              ? <FiAlertCircle className="text-primary shrink-0 mt-0.5" size={18} />
              : <FiCheckCircle className="text-green-600 shrink-0 mt-0.5" size={18} />}
            <p className="text-sm flex-1 leading-snug">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-foreground shrink-0"><FiX size={14} /></button>
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
