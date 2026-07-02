import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import {
  FiUser, FiMail, FiEdit3, FiLoader, FiHeart, FiCalendar, FiInbox,
  FiSliders, FiTrash2, FiExternalLink, FiCheck, FiClock, FiBell, FiBellOff,
} from "react-icons/fi"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Price } from "@/components/ui/Price"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/lib/toast"
import {
  updateProfile, getSavedCars, unsaveCar, getMyTestDrives, getMyInquiries,
  getPreferences, updatePreferences,
} from "@/lib/api"
import { BODY_STYLES, FUEL_TYPES, FALLBACK_IMAGE } from "@/lib/constants"
import type { SavedCar, TestDrive, TestDriveStatus, Lead, UserPreference } from "@/lib/types"

type Section = "profile" | "garage" | "testdrives" | "inquiries" | "preferences"

export default function ProfilePage() {
  const { user, loading, isAuthenticated, isStaff } = useAuth()
  const [section, setSection] = useState<Section>("profile")
  const [savedCount, setSavedCount] = useState<number | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6">
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Loading profile…</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated || !user) return <Navigate to="/signin" replace />
  // This hub is for customers. Staff/admins have the admin console.
  if (isStaff) return <Navigate to="/admin" replace />

  const nav: { id: Section; label: string; icon: any; badge?: number | null }[] = [
    { id: "profile", label: "Personal Details", icon: FiUser },
    { id: "garage", label: "Virtual Garage", icon: FiHeart, badge: savedCount },
    { id: "testdrives", label: "Test Drives", icon: FiCalendar },
    { id: "inquiries", label: "My Inquiries", icon: FiInbox },
    { id: "preferences", label: "Preferences", icon: FiSliders },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-inter flex flex-col">
      <Header />
      <main className="flex-1 px-4 sm:px-6 md:px-12 py-10 md:py-16 max-w-6xl mx-auto w-full">
        {/* Greeting */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FiUser size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Welcome back</p>
            <h1 className="text-2xl font-archivo font-extrabold uppercase tracking-tight truncate">
              {user.full_name || user.email}
            </h1>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Section nav — horizontal scroll on mobile, sidebar on desktop */}
          <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible border-b border-border pb-3 lg:border-b-0 lg:pb-0">
            {nav.map((n) => (
              <button key={n.id} onClick={() => setSection(n.id)}
                className={`flex shrink-0 items-center gap-3 px-3 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors whitespace-nowrap ${
                  section === n.id ? "bg-foreground text-background" : "hover:bg-muted/40"
                }`}>
                <n.icon size={14} /> {n.label}
                {n.badge != null && n.badge > 0 && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 ${section === n.id ? "bg-background/20" : "bg-primary/10 text-primary"}`}>{n.badge}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="min-w-0">
            {section === "profile" && <PersonalDetails />}
            {section === "garage" && <VirtualGarage onCount={setSavedCount} />}
            {section === "testdrives" && <TestDrives />}
            {section === "inquiries" && <Inquiries />}
            {section === "preferences" && <Preferences />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

/* ─────────────── Personal details ─────────────── */
function PersonalDetails() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const [fullName, setFullName] = useState(user?.full_name || "")
  const [saving, setSaving] = useState(false)

  useEffect(() => { setFullName(user?.full_name || "") }, [user])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const name = fullName.trim()
    if (!name) return toast.error("Please add your full name.")
    setSaving(true)
    try {
      await updateProfile({ full_name: name })
      await refreshUser()
      toast.success("Profile updated successfully.")
    } catch (error: any) {
      toast.error(error?.message || "We could not update your profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionShell title="Personal Details" subtitle="This name is used when you post comments, reply, or like content across the site.">
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <label className="block">
          <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Full name</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="Enter your full name" />
        </label>
        <label className="block">
          <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Email</span>
          <div className="flex items-center gap-3 border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            <FiMail size={14} /> <span className="truncate">{user?.email}</span>
          </div>
        </label>
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-foreground transition-colors disabled:opacity-60">
          {saving ? <><FiLoader size={14} className="animate-spin" /> Updating...</> : <><FiEdit3 size={14} /> Save profile</>}
        </button>
      </form>
    </SectionShell>
  )
}

/* ─────────────── Virtual Garage ─────────────── */
function VirtualGarage({ onCount }: { onCount: (n: number) => void }) {
  const toast = useToast()
  const [cars, setCars] = useState<SavedCar[] | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    getSavedCars().then((data) => { setCars(data); onCount(data.length) }).catch(() => setCars([]))
  }, [onCount])

  const remove = async (reviewId: string) => {
    setRemoving(reviewId)
    try {
      await unsaveCar(reviewId)
      setCars((prev) => {
        const next = (prev || []).filter((c) => c.review_id !== reviewId)
        onCount(next.length)
        return next
      })
      toast.success("Removed from your garage.")
    } catch (e: any) {
      toast.error(e?.message || "Could not remove this vehicle.")
    } finally {
      setRemoving(null)
    }
  }

  return (
    <SectionShell title={`Saved Vehicles${cars ? ` [${cars.length}]` : ""}`} subtitle="Vehicles you've saved to revisit later.">
      {cars === null ? (
        <Loading label="Loading your garage…" />
      ) : cars.length === 0 ? (
        <EmptyState icon={FiHeart} message="You haven't saved any vehicles yet."
          action={<Link to="/cars" className="text-primary font-mono text-xs uppercase tracking-widest hover:underline">Browse the garage →</Link>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cars.map((c) => (
            <div key={c.id} className="group border border-border hover:border-primary transition-colors flex flex-col">
              <Link to={`/cars/${c.review.slug}`} className="block aspect-video overflow-hidden bg-muted">
                <img src={c.review.featured_image || FALLBACK_IMAGE} alt={c.review.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }} />
              </Link>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{c.review.manufacturer}{c.review.body_style ? ` · ${c.review.body_style}` : ""}</span>
                  <p className="font-archivo font-extrabold uppercase leading-tight">{c.review.model} <span className="text-muted-foreground font-normal">{c.review.year}</span></p>
                </div>
                <div className="mt-auto flex items-end justify-between gap-2">
                  <Price usd={c.review.specs?.price} size="sm" />
                  <div className="flex items-center gap-1">
                    <Link to={`/cars/${c.review.slug}`} title="View"
                      className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors">
                      <FiExternalLink size={14} />
                    </Link>
                    <button onClick={() => remove(c.review_id)} disabled={removing === c.review_id} title="Remove"
                      className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
                      {removing === c.review_id ? <FiLoader size={14} className="animate-spin" /> : <FiTrash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  )
}

/* ─────────────── Test Drives ─────────────── */
const TD_BADGE: Record<TestDriveStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/30",
  completed: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
}

function TestDrives() {
  const [items, setItems] = useState<TestDrive[] | null>(null)

  useEffect(() => { getMyTestDrives().then(setItems).catch(() => setItems([])) }, [])

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })

  return (
    <SectionShell title="Test Drive Appointments" subtitle="Track the status of the drives you've requested.">
      {items === null ? (
        <Loading label="Loading appointments…" />
      ) : items.length === 0 ? (
        <EmptyState icon={FiCalendar} message="You have no test-drive appointments yet."
          action={<Link to="/cars" className="text-primary font-mono text-xs uppercase tracking-widest hover:underline">Find a car to drive →</Link>} />
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-full sm:w-28 h-20 shrink-0 overflow-hidden bg-muted">
                <img src={t.review?.featured_image || FALLBACK_IMAGE} alt={t.review?.model || "Vehicle"}
                  className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-archivo font-extrabold uppercase leading-tight">
                  {t.review ? `${t.review.manufacturer} ${t.review.model}` : "Vehicle"}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                  <span className="inline-flex items-center gap-1.5"><FiCalendar size={12} /> {fmtDate(t.preferred_date)}</span>
                  {t.preferred_time && <span className="inline-flex items-center gap-1.5"><FiClock size={12} /> {t.preferred_time}</span>}
                  {t.preferred_location && <span className="truncate">{t.preferred_location}</span>}
                </div>
              </div>
              <span className={`self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1.5 border ${TD_BADGE[t.status]}`}>
                {t.status === "confirmed" && <FiCheck size={11} />} {t.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  )
}

/* ─────────────── Inquiries ─────────────── */
function Inquiries() {
  const [items, setItems] = useState<Lead[] | null>(null)

  useEffect(() => { getMyInquiries().then(setItems).catch(() => setItems([])) }, [])

  const LEAD_BADGE: Record<string, string> = {
    new: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    contacted: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    qualified: "bg-green-500/10 text-green-600 border-green-500/30",
    closed: "bg-muted text-muted-foreground border-border",
  }

  return (
    <SectionShell title="My Inquiries" subtitle="Enquiries you've sent to our sales team.">
      {items === null ? (
        <Loading label="Loading inquiries…" />
      ) : items.length === 0 ? (
        <EmptyState icon={FiInbox} message="You haven't sent any inquiries yet."
          action={<Link to="/cars" className="text-primary font-mono text-xs uppercase tracking-widest hover:underline">Explore vehicles →</Link>} />
      ) : (
        <div className="space-y-3">
          {items.map((l) => (
            <div key={l.id} className="border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {l.review ? (
                    <Link to={`/cars/${l.review.slug}`} className="font-archivo font-extrabold uppercase leading-tight hover:text-primary transition-colors">
                      {l.review.manufacturer} {l.review.model}
                    </Link>
                  ) : (
                    <p className="font-archivo font-extrabold uppercase leading-tight">General inquiry</p>
                  )}
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                    {new Date(l.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1.5 border ${LEAD_BADGE[l.status] || LEAD_BADGE.closed}`}>{l.status}</span>
              </div>
              {l.message && <p className="text-sm text-muted-foreground mt-3 leading-6">{l.message}</p>}
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  )
}

/* ─────────────── Preference Center ─────────────── */
function Preferences() {
  const toast = useToast()
  const [pref, setPref] = useState<UserPreference | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getPreferences().then(setPref).catch(() =>
      setPref({ body_styles: [], fuel_types: [], budget_min: null, budget_max: null, notify_on_match: false }))
  }, [])

  const toggle = (key: "body_styles" | "fuel_types", value: string) => {
    setPref((p) => {
      if (!p) return p
      const list = p[key]
      return { ...p, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] }
    })
  }

  const save = async () => {
    if (!pref) return
    setSaving(true)
    try {
      const saved = await updatePreferences(pref)
      setPref(saved)
      toast.success("Preferences saved.")
    } catch (e: any) {
      toast.error(e?.message || "Could not save your preferences.")
    } finally {
      setSaving(false)
    }
  }

  if (!pref) return <SectionShell title="Preference Center"><Loading label="Loading preferences…" /></SectionShell>

  return (
    <SectionShell title="Preference Center" subtitle="Set your smart filters so we can match you with the right stock.">
      <div className="space-y-8 max-w-2xl">
        <ChipGroup label="Preferred body style" options={BODY_STYLES} selected={pref.body_styles} onToggle={(v) => toggle("body_styles", v)} />
        <ChipGroup label="Fuel type" options={FUEL_TYPES} selected={pref.fuel_types} onToggle={(v) => toggle("fuel_types", v)} />

        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Budget range (USD)</p>
          <div className="flex items-center gap-3">
            <input type="number" min={0} placeholder="Min" value={pref.budget_min ?? ""}
              onChange={(e) => setPref({ ...pref, budget_min: e.target.value === "" ? null : Number(e.target.value) })}
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <span className="text-muted-foreground font-mono text-xs">to</span>
            <input type="number" min={0} placeholder="Max" value={pref.budget_max ?? ""}
              onChange={(e) => setPref({ ...pref, budget_max: e.target.value === "" ? null : Number(e.target.value) })}
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
        </div>

        <button type="button" onClick={() => setPref({ ...pref, notify_on_match: !pref.notify_on_match })}
          className={`w-full flex items-center gap-3 border p-4 text-left transition-colors ${pref.notify_on_match ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
          <span className={`w-10 h-10 flex items-center justify-center shrink-0 ${pref.notify_on_match ? "text-primary" : "text-muted-foreground"}`}>
            {pref.notify_on_match ? <FiBell size={18} /> : <FiBellOff size={18} />}
          </span>
          <span className="flex-1">
            <span className="block text-sm font-archivo font-bold uppercase tracking-wide">Email me when new stock matches</span>
            <span className="block text-xs text-muted-foreground mt-0.5">We'll alert you when a vehicle matching these preferences arrives.</span>
          </span>
          <span className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${pref.notify_on_match ? "bg-primary" : "bg-muted"}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${pref.notify_on_match ? "left-[22px]" : "left-0.5"}`} />
          </span>
        </button>

        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-foreground transition-colors disabled:opacity-60">
          {saving ? <><FiLoader size={14} className="animate-spin" /> Saving...</> : <><FiCheck size={14} /> Save preferences</>}
        </button>
      </div>
    </SectionShell>
  )
}

/* ─────────────── Shared bits ─────────────── */
function SectionShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-archivo font-extrabold uppercase tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-2xl">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      {children}
    </section>
  )
}

function ChipGroup({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o)
          return (
            <button key={o} type="button" onClick={() => onToggle(o)}
              className={`px-3 py-2 text-xs font-mono uppercase tracking-widest border transition-colors ${active ? "border-primary bg-primary text-white" : "border-border hover:border-primary"}`}>
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Loading({ label }: { label: string }) {
  return <p className="font-mono text-sm text-muted-foreground flex items-center gap-2"><FiLoader className="animate-spin" size={14} /> {label}</p>
}

function EmptyState({ icon: Icon, message, action }: { icon: any; message: string; action?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-border p-10 text-center">
      <Icon className="mx-auto text-muted-foreground mb-3" size={28} />
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      {action}
    </div>
  )
}
