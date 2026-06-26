import { useState, useEffect, useMemo } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FiSearch, FiUser, FiSun, FiMoon, FiLogOut } from "react-icons/fi"
import { MdMenu } from "react-icons/md"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/lib/auth"

const baseNavLinks = [
  { label: "Home", path: "/" },
  { label: "Cars", path: "/cars" },
  { label: "News", path: "/news" },
  { label: "Compare", path: "/compare" },
]

export function Header() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const navLinks = useMemo(() => 
    isAdmin ? [...baseNavLinks, { label: "Admin", path: "/admin" }] : baseNavLinks
  , [isAdmin])
  const location = useLocation()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(false)
  const [searchVal, setSearchVal] = useState("")

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

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchVal.trim()) {
      navigate(`/cars?search=${encodeURIComponent(searchVal.trim())}`)
    }
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
      <nav className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1280px] mx-auto h-20">
        <div className="flex items-center gap-12">
          <Link
            className="text-2xl font-archivo font-extrabold tracking-tighter text-foreground"
            to="/"
          >
            FUTURE AUTOMOTIVE
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                className={`text-sm font-mono transition-all ${
                  isActive(link.path)
                    ? "text-primary border-b-2 border-primary pb-1 font-bold"
                    : "text-foreground/80 hover:text-primary hover:border-b-2 hover:border-primary/50 pb-1"
                }`}
                to={link.path}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-muted/50 px-4 py-2 rounded-full border border-border/50">
            <button onClick={() => { if (searchVal.trim()) navigate(`/cars?search=${encodeURIComponent(searchVal.trim())}`) }}>
              <FiSearch className="text-muted-foreground hover:text-primary transition-colors" />
            </button>
            <input
              className="bg-transparent border-none focus:ring-0 text-xs placeholder-muted-foreground/50 w-48 ml-2 outline-none"
              placeholder="Search vehicles..."
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
            {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
          </Button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:block text-xs font-mono text-muted-foreground">
                {user?.full_name || user?.email}
              </span>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={logout}>
                <FiLogOut className="text-xl" />
              </Button>
            </div>
          ) : (
            <Link to="/signin">
              <Button variant="ghost" size="icon" className="rounded-full">
                <FiUser className="text-xl" />
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <MdMenu className="text-2xl" />
          </Button>
        </div>
      </nav>
    </header>
  )
}
