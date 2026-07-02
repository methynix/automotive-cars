import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FiSearch, FiUser, FiLogOut, FiX } from "react-icons/fi"
import { MdMenu } from "react-icons/md"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/lib/auth"
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher"

const baseNavLinks = [
  { label: "Home", path: "/" },
  { label: "Cars", path: "/cars" },
  { label: "News", path: "/news" },
  { label: "Brands", path: "/brands" },
  { label: "Compare", path: "/compare" },
]

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(false)
  const [searchVal, setSearchVal] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [desktopModalOpen, setDesktopModalOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (saved === "dark" || (!saved && prefersDark)) {
      document.documentElement.classList.add("dark")
      setIsDark(true)
    } else {
      document.documentElement.classList.remove("dark")
      setIsDark(false)
    }
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  const runSearch = () => {
    if (searchVal.trim()) navigate(`/cars?search=${encodeURIComponent(searchVal.trim())}`)
  }
  const handleSearchKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") runSearch() }
  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <div className="h-16 md:h-20 w-full shrink-0" />
      <header className="bg-background/80 backdrop-blur-md fixed top-0 left-0 w-full z-50 border-b border-border">
      <nav className="flex justify-between items-center w-full px-5 md:px-12 max-w-[1400px] mx-auto h-16 md:h-20">
        <div className="flex items-center gap-8 lg:gap-12">
          <Link className="flex items-center gap-2.5 text-foreground" to="/">
            <span className="text-lg md:text-2xl font-archivo font-extrabold tracking-tighter uppercase whitespace-nowrap">
              Future Automotive
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {baseNavLinks.map((link) => (
              <Link key={link.label}
                className={`text-sm font-mono transition-all ${
                  isActive(link.path)
                    ? "text-primary border-b-2 border-primary pb-1 font-bold"
                    : "text-foreground/80 hover:text-primary hover:border-b-2 hover:border-primary/50 pb-1"
                }`}
                to={link.path}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button size="icon" className="md:hidden bg-red-600 hover:bg-red-700 text-white rounded-md" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            {menuOpen ? <FiX className="text-2xl" /> : <MdMenu className="text-2xl" />}
          </Button>
          <Button size="icon" className="hidden md:flex relative z-[210] bg-red-600 hover:bg-red-700 text-white rounded-md" onClick={() => setDesktopModalOpen((o) => !o)} aria-label="Settings">
            {desktopModalOpen ? <FiX className="text-2xl" /> : <MdMenu className="text-2xl" />}
          </Button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-background border-b border-border transition-all duration-300 origin-top z-[100] overflow-hidden ${
          menuOpen ? "h-[calc(100dvh-4rem)] max-h-[100dvh] opacity-100" : "h-0 max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 max-w-[1400px] mx-auto py-4 flex flex-col gap-1">
          <div className="flex items-center bg-muted/50 px-4 py-2.5 rounded-full border border-border/50 mb-3">
            <FiSearch className="text-muted-foreground" />
            <input className="bg-transparent border-none text-sm w-full ml-2 outline-none"
              placeholder="Search vehicles..." value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)} onKeyDown={handleSearchKeyDown} />
          </div>
          <div className="flex items-center justify-between py-3 px-2 border-b border-border/40">
            <span className="text-sm font-mono uppercase tracking-widest text-foreground/80">Currency</span>
            <CurrencySwitcher />
          </div>
          <div className="flex flex-col items-start gap-3 py-3 px-2 border-b border-border/40 pb-4">
            <span className="text-sm font-mono uppercase tracking-widest text-foreground/80">Theme</span>
            <div className="inline-flex border border-border">
              <button
                onClick={() => { if (isDark) toggleTheme(); }}
                className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                  !isDark ? "bg-foreground text-background" : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Light Mode
              </button>
              <button
                onClick={() => { if (!isDark) toggleTheme(); }}
                className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                  isDark ? "bg-foreground text-background" : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Dark Mode
              </button>
            </div>
          </div>
          {baseNavLinks.map((link) => (
            <Link key={link.label} to={link.path} onClick={() => setMenuOpen(false)}
              className={`py-3 px-2 text-sm font-mono uppercase tracking-widest border-b border-border/40 ${
                isActive(link.path) ? "text-primary font-bold" : "text-foreground/80"
              }`}>
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <Link to="/signin" onClick={() => setMenuOpen(false)} className="py-3 px-2 text-sm font-mono uppercase tracking-widest text-primary font-bold">ADMIN</Link>
          ) : (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-3 px-2 text-sm font-mono uppercase tracking-widest text-primary font-bold border-b border-border/40">Profile</Link>
              {(user?.role === "admin" || user?.role === "operator") && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="py-3 px-2 text-sm font-mono uppercase tracking-widest text-primary font-bold border-b border-border/40">Dashboard</Link>
              )}
              <button onClick={() => { logout(); setMenuOpen(false); }} className="py-3 px-2 text-sm font-mono uppercase tracking-widest text-destructive font-bold text-left">Logout</button>
            </>
          )}
        </div>
      </div>

      {/* Desktop Dropdown */}
      {desktopModalOpen && (
        <>
          {/* Click away overlay */}
          <div className="hidden md:block fixed inset-0 w-screen h-screen z-[190]" onClick={() => setDesktopModalOpen(false)} />
          
          <div className="hidden md:block absolute top-full right-5 md:right-12 mt-2 w-[320px] bg-background border border-border shadow-2xl p-6 z-[200] animate-in fade-in slide-in-from-top-4 duration-200">
            <h3 className="text-lg font-archivo font-bold uppercase mb-5 tracking-tighter border-b border-border/40 pb-3">Settings</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col items-start gap-3">
                <span className="text-sm font-mono uppercase tracking-widest text-foreground/80">Currency</span>
                <CurrencySwitcher />
              </div>
              
              <div className="flex flex-col items-start gap-3 border-b border-border/40 pb-4">
                <span className="text-sm font-mono uppercase tracking-widest text-foreground/80">Theme</span>
                <div className="inline-flex border border-border">
                  <button
                    onClick={() => { if (isDark) toggleTheme(); }}
                    className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                      !isDark ? "bg-foreground text-background" : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Light Mode
                  </button>
                  <button
                    onClick={() => { if (!isDark) toggleTheme(); }}
                    className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                      isDark ? "bg-foreground text-background" : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Dark Mode
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-start w-full">
                {!isAuthenticated ? (
                  <Link to="/signin" onClick={() => setDesktopModalOpen(false)} className="flex items-center justify-start gap-3 w-full p-3 bg-muted/50 hover:bg-muted text-primary font-bold transition-colors">
                    <FiUser className="text-xl" />
                    <span className="text-sm font-mono uppercase tracking-widest">ADMIN</span>
                  </Link>
                ) : (
                  <div className="space-y-3 w-full">
                    <div className="px-3 py-2 bg-muted/30 border border-border/50">
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Signed in as</p>
                      <p className="font-bold truncate text-sm">{user?.full_name || user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setDesktopModalOpen(false)} className="flex items-center justify-start w-full p-3 border border-border hover:bg-muted transition-colors">
                      <span className="text-sm font-mono uppercase tracking-widest">Profile</span>
                    </Link>
                    {(user?.role === "admin" || user?.role === "operator") && (
                      <Link to="/admin" onClick={() => setDesktopModalOpen(false)} className="flex items-center justify-start w-full p-3 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
                        <span className="text-sm font-mono uppercase tracking-widest">Dashboard</span>
                      </Link>
                    )}
                    <button onClick={() => { logout(); setDesktopModalOpen(false); }} className="flex items-center justify-start gap-2 w-full p-3 border border-destructive text-destructive font-bold hover:bg-destructive/10 transition-colors">
                      <FiLogOut className="text-lg" />
                      <span className="text-sm font-mono uppercase tracking-widest">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
    </>
  )
}
