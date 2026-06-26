import { useState, useMemo } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/lib/toast"

// Password rules for an app that stores personal data.
function scorePassword(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  }
}

export default function SignUpPage() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const checks = useMemo(() => scorePassword(password), [password])
  const strong = Object.values(checks).every(Boolean)
  const matches = confirm.length > 0 && password === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!strong) return setError("Please choose a stronger password (see requirements below).")
    if (!matches) return setError("Passwords do not match.")
    setLoading(true)
    try {
      // Public sign-up always creates a CUSTOMER account (role: user).
      // Admin/editor roles can only be granted by an existing admin.
      const user = await register(email, password, fullName)
      toast.success("Account created — welcome to Future Automotive!")
      const from = (location.state as any)?.from
      navigate(user.role === "admin" || user.role === "operator" ? "/admin" : (from || "/"))
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const Req = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-muted-foreground"}`}>
      {ok ? <FiCheck size={12} /> : <FiX size={12} />} {label}
    </li>
  )

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <div className="border border-border p-10">
            <h1 className="text-3xl font-archivo font-extrabold uppercase tracking-tighter mb-2">
              SIGN <span className="text-primary">UP</span>
            </h1>
            <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs mb-10">
              CREATE A CUSTOMER ACCOUNT
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-500 font-mono">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2 text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-inter"
                  placeholder="Alex Rivera"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2 text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-inter"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2 text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border border-border px-4 py-3 pr-12 text-sm focus:outline-none focus:border-primary transition-colors font-inter"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-1 text-[11px] font-mono">
                  <Req ok={checks.length} label="8+ characters" />
                  <Req ok={checks.upper} label="Uppercase" />
                  <Req ok={checks.number} label="Number" />
                  <Req ok={checks.symbol} label="Symbol" />
                </ul>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2 text-muted-foreground">
                  Confirm Password
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full bg-transparent border px-4 py-3 text-sm focus:outline-none transition-colors font-inter ${
                    confirm.length === 0 ? "border-border focus:border-primary"
                      : matches ? "border-green-500" : "border-red-500"
                  }`}
                  placeholder="••••••••"
                  required
                />
                {confirm.length > 0 && !matches && (
                  <p className="text-red-500 text-[11px] font-mono mt-2">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-mono font-bold uppercase tracking-widest text-xs py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "CREATING..." : "CREATE ACCOUNT"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-muted-foreground font-mono">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
