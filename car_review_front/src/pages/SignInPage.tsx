import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useAuth } from "@/lib/auth"

export default function SignInPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const user = await login(email, password)
      // Role-based redirect: staff go to the dashboard, customers go home
      // (or back to wherever they were heading).
      const from = (location.state as any)?.from
      if (user.role === "admin" || user.role === "editor") navigate("/admin")
      else navigate(from || "/")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <div className="border border-border p-10">
            <h1 className="text-3xl font-archivo font-extrabold uppercase tracking-tighter mb-2">
              SIGN <span className="text-primary">IN</span>
            </h1>
            <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs mb-10">
              ACCESS YOUR ACCOUNT
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-500 font-mono">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2 text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-inter"
                  placeholder="alex@futureauto.com"
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-mono font-bold uppercase tracking-widest text-xs py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-muted-foreground font-mono">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
