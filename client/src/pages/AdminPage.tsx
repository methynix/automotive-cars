import { useState, Fragment, useEffect } from "react"
import { Navigate } from "react-router-dom"
import {
  FiGrid, FiBox, FiUsers, FiTag, FiInbox, FiSettings, FiLogOut, FiCopy,
  FiPlus, FiEdit, FiTrash2, FiUploadCloud, FiEye, FiEyeOff, FiX, FiCheck, FiLoader, FiAlertTriangle, FiMessageSquare,
  FiBold, FiItalic, FiList, FiMenu, FiCalendar,
} from "react-icons/fi"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from "@/lib/auth"
import { useToast } from "@/lib/toast"
import { uploadImage, createComment } from "@/lib/api"
import {
  useAdminReviews, useCreateReview, useUpdateReview, useDeleteReview, useSetPublish,
  useAdminComments, useModerateComment, useDeleteComment,
  useAdminBrands, useCreateBrand, useUpdateBrand, useDeleteBrand,
  useUsers, useUpdateUser, useDeleteUser,
  useLeads, useUpdateLead, useDeleteLead,
  useTestDrives, useUpdateTestDrive,
  useAnalytics,
  useSettings, useUpdateSettings
} from "@/hooks/useApi"
import { BODY_STYLES, CONDITIONS } from "@/lib/constants"
import type { Review, ReviewInput, ReviewSpec, GalleryImage, Brand, Lead, TestDriveStatus, Comment as AppComment } from "@/lib/types"

// Module-level so inputs keep focus across re-renders (defining this inside a
// component would remount every field on each keystroke).
const inputCls = "w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary outline-none"
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  )
}

// Reusable confirmation modal (replaces the native window.confirm()).
// Usage: const { confirm, dialog } = useConfirm(); if (await confirm("...")) {...}; render {dialog}
function useConfirm() {
  const [state, setState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null)
  const confirm = (message: string) => new Promise<boolean>((resolve) => setState({ message, resolve }))
  const close = (v: boolean) => { state?.resolve(v); setState(null) }
  const dialog = state ? (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-6" onClick={() => close(false)}>
      <div className="bg-background border border-border w-full max-w-sm p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"><FiAlertTriangle size={16} /></span>
          <h3 className="text-lg font-archivo font-extrabold uppercase">Are you sure?</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{state.message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => close(false)} className="px-4 py-2 text-xs font-mono uppercase tracking-widest border border-border hover:border-primary transition-colors">Cancel</button>
          <button onClick={() => close(true)} className="px-5 py-2 text-xs font-mono font-black uppercase tracking-widest bg-primary text-white hover:bg-foreground transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  ) : null
  return { confirm, dialog }
}

type Tab = "dashboard" | "vehicles" | "brands" | "comments" | "leads" | "testdrives" | "users" | "settings"

const emptyForm: ReviewInput = {
  title: "", excerpt: "", featured_image: "", manufacturer: "", model: "",
  year: new Date().getFullYear(), body_style: "Sedan", condition: "new",
  content: { body: "", pros: [], cons: [] }, rating: 8, status: "draft", featured: false,
  specs: { engine: "", horsepower: undefined, torque: undefined, drivetrain: "All-Wheel Drive", fuel_type: "Electric", acceleration: "", top_speed: "", seating: 5, mileage: 0, price: 0 },
}

export default function AdminPage() {
  const { user, isAdmin, isStaff, loading, logout, isAuthenticated } = useAuth()
  const [tab, setTab] = useState<Tab>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-sm">Loading…</div>
  if (!isStaff) return <Navigate to={isAuthenticated ? "/profile" : "/signin"} replace />

  const nav: { id: Tab; label: string; icon: any; adminOnly?: boolean }[] = [
    { id: "dashboard", label: "Dashboard", icon: FiGrid },
    { id: "vehicles", label: "Vehicles", icon: FiBox },
    { id: "brands", label: "Brands", icon: FiTag, adminOnly: true },
    { id: "comments", label: "Comments", icon: FiMessageSquare },
    { id: "leads", label: "Leads", icon: FiInbox },
    { id: "testdrives", label: "Test Drives", icon: FiCalendar },
    { id: "users", label: "Users", icon: FiUsers, adminOnly: true },
    { id: "settings", label: "Settings", icon: FiSettings },
  ]

  const activeLabel = nav.find((n) => n.id === tab)?.label ?? ""
  const go = (id: Tab) => { setTab(id); setSidebarOpen(false) }

  return (
    <div className="min-h-screen bg-background font-inter text-foreground flex flex-col lg:flex-row">
      {/* Mobile top bar with hamburger (drawer toggle) */}
      <header className="lg:hidden flex items-center justify-between gap-3 border-b border-border p-4 sticky top-0 z-30 bg-background">
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="p-2 border border-border hover:border-primary transition-colors">
          <FiMenu size={18} />
        </button>
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{activeLabel}</span>
        <h1 className="font-archivo font-extrabold uppercase tracking-tighter text-base">FUTURE <span className="text-primary">AUTO</span></h1>
      </header>

      {/* Backdrop (mobile only, when drawer is open) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — off-canvas drawer on mobile, static column on desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border p-6 flex flex-col gap-2 overflow-y-auto transition-transform duration-300 lg:z-auto lg:w-60 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-archivo font-extrabold uppercase tracking-tighter text-lg">FUTURE <span className="text-primary">AUTO</span></h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Admin Console</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="lg:hidden p-1 text-muted-foreground hover:text-foreground">
            <FiX size={18} />
          </button>
        </div>
        {nav.filter((n) => !n.adminOnly || isAdmin).map((n) => (
          <button key={n.id} onClick={() => go(n.id)}
            className={`flex shrink-0 items-center gap-3 px-3 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors whitespace-nowrap ${
              tab === n.id ? "bg-foreground text-background" : "hover:bg-muted/40"
            }`}>
            <n.icon size={14} /> {n.label}
          </button>
        ))}
        <div className="mt-auto flex flex-col gap-2 text-left pt-6">
          <p className="text-[10px] font-mono text-muted-foreground mb-2 truncate">{user?.email}</p>
          <button onClick={logout} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary hover:underline">
            <FiLogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {tab === "dashboard" && <DashboardTab setTab={setTab} />}
        {tab === "vehicles" && <VehiclesTab />}
        {tab === "brands" && isAdmin && <BrandsTab />}
        {tab === "comments" && <CommentsTab />}
        {tab === "leads" && <LeadsTab />}
        {tab === "testdrives" && <TestDrivesTab />}
        {tab === "users" && isAdmin && <UsersTab currentUserId={user!.id} />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  )
}

/* ─────────────── Dashboard ─────────────── */
function Stat({ label, value, onClick }: { label: string; value: string | number; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`border border-border p-5 ${onClick ? 'cursor-pointer hover:border-primary transition-colors group' : ''}`}>
      <div className={`text-3xl font-archivo font-extrabold ${onClick ? 'group-hover:text-primary' : ''}`}>{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

function DashboardTab({ setTab }: { setTab: (tab: Tab) => void }) {
  const [range, setRange] = useState("all")
  const { data, isLoading } = useAnalytics(range)

  if (isLoading || !data) return <p className="font-mono text-sm">Loading analytics…</p>
  const t = data.totals

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-archivo font-extrabold uppercase tracking-tight">Dashboard</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="w-full sm:w-auto bg-background border border-border px-3 py-2 text-xs font-mono uppercase tracking-widest outline-none focus:border-primary"
        >
          <option value="all">All Time</option>
          <option value="30d">Last 30 Days</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <Stat label="Published" value={t.published} onClick={() => setTab("vehicles")} />
        <Stat label="Drafts" value={t.drafts} onClick={() => setTab("vehicles")} />
        <Stat label="Total Views" value={t.views.toLocaleString()} />
        <Stat label="Avg Rating" value={`${t.avgRating}/10`} />
        <Stat label="New Leads" value={t.newLeads} onClick={() => setTab("leads")} />
        <Stat label="Pending Comments" value={t.pendingComments} onClick={() => setTab("comments")} />
        <Stat label="Brands" value={t.brands} onClick={() => setTab("brands")} />
        <Stat label="Users" value={t.users} onClick={() => setTab("users")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-border p-6 lg:col-span-2">
          <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-6">Most-viewed vehicles</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.topReviews}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#E31837" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-border p-6 overflow-hidden flex flex-col h-[380px]">
          <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-6 shrink-0">Recent Activity</h3>
          <div className="overflow-y-auto pr-2 space-y-4 flex-grow">
            {(data.recentActivity || []).length === 0 ? (
              <p className="text-[11px] font-mono text-muted-foreground italic">No recent activity.</p>
            ) : (
              (data.recentActivity || []).map((act: any) => (
                <div key={act.id} className="text-sm border-l-2 border-primary/30 pl-3 py-1">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">
                    {new Date(act.date).toLocaleString()}
                  </span>
                  <span className="leading-snug">{act.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────── Vehicles ─────────────── */
function VehiclesTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Simple debounce for search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 500)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useAdminReviews({ page, limit: 10, search: debouncedSearch })
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()
  const setPublish = useSetPublish()

  const [editing, setEditing] = useState<Review | null>(null)
  const [isClone, setIsClone] = useState(false)
  const [open, setOpen] = useState(false)
  const { confirm, dialog } = useConfirm()
  const toast = useToast()
  const { isAdmin } = useAuth()

  const rows = data?.data ?? []
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  const [selected, setSelected] = useState<string[]>([])
  const toggleAll = (e: any) => setSelected(e.target.checked ? rows.map((r: any) => r.id) : [])
  const toggleOne = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const bulkDelete = async () => {
    if (await confirm(`Delete ${selected.length} vehicles?`)) {
      try { await Promise.all(selected.map(id => deleteReview.mutateAsync(id))); toast.success("Vehicles deleted."); setSelected([]) }
      catch (e: any) { toast.error("Failed to delete some vehicles.") }
    }
  }

  const bulkStatus = async (status: 'published' | 'draft') => {
    try { await Promise.all(selected.map(id => setPublish.mutateAsync({ id, status }))); toast.success(`Vehicles marked as ${status}.`); setSelected([]) }
    catch (e: any) { toast.error("Failed to update status.") }
  }

  const bulkFeatured = async (featured: boolean) => {
    try { await Promise.all(selected.map(id => updateReview.mutateAsync({ id, data: { featured } }))); toast.success(`Vehicles marked as ${featured ? "featured" : "not featured"}.`); setSelected([]) }
    catch (e: any) { toast.error("Failed to update featured status.") }
  }

  const openNew = () => { setEditing(null); setIsClone(false); setOpen(true) }
  const openEdit = (r: Review) => { setEditing(r); setIsClone(false); setOpen(true) }
  const openClone = (r: Review) => { setEditing(r); setIsClone(true); setOpen(true) }

  const onDelete = async (r: Review) => {
    if (await confirm(`Delete "${r.title}"? It will be hidden from the site but can be restored from the database.`)) {
      try { await deleteReview.mutateAsync(r.id); toast.success("Vehicle deleted.") }
      catch (e: any) { toast.error(e?.message || "Delete failed.") }
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-archivo font-extrabold uppercase tracking-tight">Vehicles</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="w-full sm:min-w-[240px] border border-border bg-background px-3 py-2 text-sm focus:border-primary outline-none"
            placeholder="Search make, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={openNew} className="inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest hover:bg-foreground transition-colors">
            <FiPlus size={14} /> Add Vehicle
          </button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex items-center gap-3 p-3 border border-primary/20 bg-primary/5">
          <span className="text-xs font-mono uppercase text-primary font-bold">{selected.length} selected</span>
          {isAdmin && (
            <>
              <button onClick={() => bulkStatus("published")} className="text-xs font-mono uppercase tracking-widest px-3 py-1.5 border border-border bg-background hover:border-primary transition-colors">Publish</button>
              <button onClick={() => bulkStatus("draft")} className="text-xs font-mono uppercase tracking-widest px-3 py-1.5 border border-border bg-background hover:border-primary transition-colors">Draft</button>
              <button onClick={() => bulkFeatured(true)} className="text-xs font-mono uppercase tracking-widest px-3 py-1.5 border border-border bg-background hover:border-primary transition-colors">Feature</button>
              <button onClick={() => bulkFeatured(false)} className="text-xs font-mono uppercase tracking-widest px-3 py-1.5 border border-border bg-background hover:border-primary transition-colors">Unfeature</button>
              <button onClick={bulkDelete} className="text-xs font-mono uppercase tracking-widest px-3 py-1.5 border border-red-500/30 text-red-600 bg-red-500/10 hover:bg-red-500 hover:text-white transition-colors">Delete</button>
            </>
          )}
        </div>
      )}

      {isLoading ? <p className="font-mono text-sm">Loading…</p> : (
        <div className="border border-border overflow-x-auto mb-6">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-3 w-10 text-center"><input type="checkbox" checked={selected.length === rows.length && rows.length > 0} onChange={toggleAll} /></th>
                <th className="text-left p-3">Vehicle</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Views</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 text-center"><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)} /></td>
                  <td className="p-3">
                    <div className="font-archivo font-bold">{r.manufacturer} {r.model}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{r.year}{r.body_style ? ` · ${r.body_style}` : ""}</div>
                  </td>
                  <td className="p-3 font-mono">{r.specs?.price != null ? `$${r.specs.price.toLocaleString()}` : "—"}</td>
                  <td className="p-3">
                    {(() => {
                      const isPublished = r.status === "published"
                      const pendingThis = setPublish.isPending && setPublish.variables?.id === r.id
                      // Only admins can publish/unpublish. Operators see a read-only badge.
                      if (!isAdmin) {
                        return (
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-1.5 border ${
                            isPublished ? "border-green-600 text-green-600" : "border-muted-foreground/40 text-muted-foreground"
                          }`}>
                            {isPublished ? <FiEye size={12} /> : <FiEyeOff size={12} />}{isPublished ? "Published" : "Draft"}
                          </span>
                        )
                      }
                      return (
                        <button
                          title={isPublished ? "Published — click to unpublish (hide from site)" : "Draft — click to publish (make live)"}
                          disabled={pendingThis}
                          onClick={() => setPublish.mutate({ id: r.id, status: isPublished ? "draft" : "published" }, { onSuccess: () => toast.success(isPublished ? "Moved to draft." : "Published — now live."), onError: (e: any) => toast.error(e?.message || "Could not update.") })}
                          className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-1.5 border transition-colors disabled:opacity-60 ${
                            isPublished ? "border-green-600 text-green-600 hover:bg-green-600/10" : "border-muted-foreground/40 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {pendingThis ? <FiLoader size={12} className="animate-spin" /> : isPublished ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                          {isPublished ? "Published" : "Draft"}
                        </button>
                      )
                    })()}
                  </td>
                  <td className="p-3 font-mono">{r.views}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button title="Clone" onClick={() => openClone(r)} className="p-2 border border-border hover:border-primary text-muted-foreground hover:text-foreground"><FiCopy size={14} /></button>
                      <button title="Edit" onClick={() => openEdit(r)} className="p-2 border border-border hover:border-primary"><FiEdit size={14} /></button>
                      {isAdmin && (
                        <button title="Delete" onClick={() => onDelete(r)} className="p-2 border border-border hover:border-primary text-primary"><FiTrash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground font-mono text-xs">No vehicles found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 text-xs font-mono uppercase border border-border disabled:opacity-40 hover:border-primary">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 text-xs font-mono border ${p === page ? "border-primary bg-primary text-white" : "border-border hover:border-primary"}`}>{p}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 text-xs font-mono uppercase border border-border disabled:opacity-40 hover:border-primary">Next</button>
        </div>
      )}

      {open && (
        <VehicleForm
          initial={editing}
          isClone={isClone}
          isAdmin={isAdmin}
          saving={createReview.isPending || updateReview.isPending}
          onClose={() => setOpen(false)}
          onSave={async (payload) => {
            try {
              if (editing && !isClone) { await updateReview.mutateAsync({ id: editing.id, data: payload }); toast.success("Vehicle updated.") }
              else { await createReview.mutateAsync(payload); toast.success("Vehicle created.") }
              setOpen(false)
            } catch (e: any) { toast.error(e?.message || "Save failed.") }
          }}
        />
      )}
      {dialog}
    </div>
  )
}

function SortableGalleryItem({ id, g, onRemove }: { id: string, g: GalleryImage, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="relative aspect-video border border-border overflow-hidden bg-muted group">
      <img src={g.image_url} alt={g.alt_text || ""} className="w-full h-full object-cover" />
      <div {...attributes} {...listeners} className="absolute top-1 left-1 w-6 h-6 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-primary"><FiMenu size={12} /></div>
      <button type="button" onClick={onRemove}
        className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary z-10"
        title="Remove"><FiX size={12} /></button>
    </div>
  )
}

function VehicleForm({ initial, isClone, onClose, onSave, saving, isAdmin }: {
  initial: Review | null
  isClone?: boolean
  onClose: () => void
  onSave: (data: ReviewInput) => Promise<void>
  saving: boolean
  isAdmin: boolean
}) {
  const [form, setForm] = useState<ReviewInput>(() => initial ? {
    title: initial.title + (isClone ? " (Copy)" : ""), excerpt: initial.excerpt || "", featured_image: initial.featured_image || "",
    manufacturer: initial.manufacturer, model: initial.model, year: initial.year,
    body_style: initial.body_style || "Sedan", condition: initial.condition || "new",
    content: { body: (initial.content?.body as string) || "", pros: initial.content?.pros || [], cons: initial.content?.cons || [] },
    rating: initial.rating ?? 8, status: isClone ? "draft" : initial.status, featured: isClone ? false : initial.featured,
    specs: { ...initial.specs },
  } : { ...emptyForm })

  const [errors, setErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [gallery, setGallery] = useState<GalleryImage[]>(initial?.gallery ?? [])
  const [prosText, setProsText] = useState((initial?.content?.pros || []).join("\n"))
  const [consText, setConsText] = useState((initial?.content?.cons || []).join("\n"))

  const editor = useEditor({
    extensions: [StarterKit],
    content: form.content.body as string,
    editorProps: { attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-3 font-serif' } },
    onUpdate: ({ editor }) => set({ content: { ...form.content, body: editor.getHTML() } }),
  })

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const handleDragEnd = (e: any) => {
    const { active, over } = e
    if (active.id !== over?.id) {
      setGallery((items) => {
        const oldIndex = items.findIndex(i => i.image_url === active.id)
        const newIndex = items.findIndex(i => i.image_url === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const set = (patch: Partial<ReviewInput>) => setForm((f) => ({ ...f, ...patch }))
  const setSpec = (patch: Partial<ReviewSpec>) => setForm((f) => ({ ...f, specs: { ...f.specs, ...patch } }))

  const validate = (): string[] => {
    const e: string[] = []
    if (form.title.trim().length < 3) e.push("Title must be at least 3 characters.")
    if (!form.manufacturer.trim()) e.push("Manufacturer is required.")
    if (!form.model.trim()) e.push("Model is required.")
    if (!form.year || form.year < 1886) e.push("Enter a valid year.")
    if ((form.rating ?? 0) < 0 || (form.rating ?? 0) > 10) e.push("Rating must be between 0 and 10.")
    if ((form.specs?.price ?? 0) < 0) e.push("Price cannot be negative.")
    if ((form.specs?.mileage ?? 0) < 0) e.push("Mileage cannot be negative.")
    if ((form.specs?.horsepower ?? 0) < 0) e.push("Horsepower cannot be negative.")
    return e
  }

  const handleUpload = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadImage(file, form.manufacturer, form.model)
      set({ featured_image: url })
    } catch (err: any) {
      setErrors([err?.message || "Upload failed. Check your storage config / network."])
    } finally { setUploading(false) }
  }

  // Gallery: upload one or more interior/exterior shots, each appended to the list.
  const handleGalleryUpload = async (files?: FileList | null) => {
    if (!files || files.length === 0) return
    setGalleryUploading(true)
    try {
      const uploaded: GalleryImage[] = []
      for (const file of Array.from(files)) {
        const { url } = await uploadImage(file, form.manufacturer, form.model)
        uploaded.push({ image_url: url })
      }
      setGallery((g) => [...g, ...uploaded])
    } catch (err: any) {
      setErrors([err?.message || "Gallery upload failed. Check your storage config / network."])
    } finally { setGalleryUploading(false) }
  }
  const removeGalleryImage = (idx: number) => setGallery((g) => g.filter((_, i) => i !== idx))

  const submit = async () => {
    const e = validate()
    setErrors(e)
    if (e.length) return
    const payload: ReviewInput = {
      ...form,
      content: {
        body: form.content.body,
        pros: prosText.split("\n").map((s) => s.trim()).filter(Boolean),
        cons: consText.split("\n").map((s) => s.trim()).filter(Boolean),
      },
      gallery: gallery.map((g, i) => ({ image_url: g.image_url, alt_text: g.alt_text ?? null, sort_order: i })),
    }
    await onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-background border border-border w-full max-w-2xl my-8 p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-archivo font-extrabold uppercase">{initial ? "Edit vehicle" : "New vehicle"}</h3>
          <button onClick={onClose}><FiX size={20} /></button>
        </div>

        {errors.length > 0 && (
          <ul className="mb-6 border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500 font-mono space-y-1">
            {errors.map((e, i) => <li key={i}>• {e}</li>)}
          </ul>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Title"><input className={inputCls} value={form.title} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field label="Featured image">
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Paste URL or upload →" value={form.featured_image} onChange={(e) => set({ featured_image: e.target.value })} />
              <label className={`shrink-0 inline-flex items-center gap-1.5 border px-3 text-xs font-mono transition-colors ${uploading ? "border-primary text-primary cursor-wait" : "border-border hover:border-primary cursor-pointer"}`}>
                {uploading ? <FiLoader size={14} className="animate-spin" /> : <FiUploadCloud size={14} />} {uploading ? "Uploading…" : "Upload"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handleUpload(e.target.files?.[0])} />
              </label>
            </div>
            {(form.featured_image || uploading) && (
              <div className="relative mt-2 w-28 h-20 border border-border overflow-hidden bg-muted">
                {form.featured_image && <img src={form.featured_image} alt="preview" className="w-full h-full object-cover" />}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <FiLoader size={18} className="animate-spin text-white" />
                  </div>
                )}
              </div>
            )}
          </Field>
          <Field label="Manufacturer"><input className={inputCls} value={form.manufacturer} onChange={(e) => set({ manufacturer: e.target.value })} /></Field>
          <Field label="Model"><input className={inputCls} value={form.model} onChange={(e) => set({ model: e.target.value })} /></Field>
          <Field label="Year"><input type="number" className={inputCls} value={form.year} onChange={(e) => set({ year: parseInt(e.target.value) || 0 })} /></Field>
          <Field label="Body style">
            <select className={inputCls} value={form.body_style} onChange={(e) => set({ body_style: e.target.value })}>
              {BODY_STYLES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Condition">
            <select className={inputCls} value={form.condition} onChange={(e) => set({ condition: e.target.value as any })}>
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Rating (0–10)"><input type="number" step="0.1" min="0" max="10" className={inputCls} value={form.rating} onChange={(e) => set({ rating: parseFloat(e.target.value) })} /></Field>
          <Field label="Price ($)"><input type="number" min="0" className={inputCls} value={form.specs?.price ?? 0} onChange={(e) => setSpec({ price: parseFloat(e.target.value) })} /></Field>
          <Field label="Mileage (km)"><input type="number" min="0" className={inputCls} value={form.specs?.mileage ?? 0} onChange={(e) => setSpec({ mileage: parseInt(e.target.value) })} /></Field>
          <Field label="Horsepower"><input type="number" min="0" className={inputCls} value={form.specs?.horsepower ?? ""} onChange={(e) => setSpec({ horsepower: e.target.value === "" ? undefined : parseInt(e.target.value) })} /></Field>
          <Field label="Torque (Nm)"><input type="number" min="0" className={inputCls} value={form.specs?.torque ?? ""} onChange={(e) => setSpec({ torque: e.target.value === "" ? undefined : parseInt(e.target.value) })} /></Field>
          <Field label="0–100 (s)"><input className={inputCls} value={form.specs?.acceleration ?? ""} onChange={(e) => setSpec({ acceleration: e.target.value })} /></Field>
          <Field label="Transmission"><input className={inputCls} value={form.specs?.transmission ?? ""} onChange={(e) => setSpec({ transmission: e.target.value })} /></Field>
          <Field label="Drivetrain"><input className={inputCls} value={form.specs?.drivetrain ?? ""} onChange={(e) => setSpec({ drivetrain: e.target.value })} /></Field>
          <Field label="Fuel type"><input className={inputCls} value={form.specs?.fuel_type ?? ""} onChange={(e) => setSpec({ fuel_type: e.target.value })} /></Field>
          <Field label="Fuel economy"><input className={inputCls} value={form.specs?.fuel_economy ?? ""} onChange={(e) => setSpec({ fuel_economy: e.target.value })} /></Field>
        </div>

        <div className="mt-4 space-y-4">
          <Field label="Excerpt"><input className={inputCls} value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} /></Field>
          <Field label="Review body">
            <div className="border border-border">
              <div className="flex items-center gap-1 p-1 border-b border-border bg-muted/30">
                <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2 hover:bg-muted ${editor?.isActive('bold') ? 'bg-muted text-primary' : ''}`}><FiBold size={14}/></button>
                <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2 hover:bg-muted ${editor?.isActive('italic') ? 'bg-muted text-primary' : ''}`}><FiItalic size={14}/></button>
                <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-2 hover:bg-muted ${editor?.isActive('bulletList') ? 'bg-muted text-primary' : ''}`}><FiList size={14}/></button>
              </div>
              <EditorContent editor={editor} />
            </div>
          </Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Pros (one per line)"><textarea className={`${inputCls} min-h-[80px]`} value={prosText} onChange={(e) => setProsText(e.target.value)} /></Field>
            <Field label="Cons (one per line)"><textarea className={`${inputCls} min-h-[80px]`} value={consText} onChange={(e) => setConsText(e.target.value)} /></Field>
          </div>

          {/* Gallery — multiple interior/exterior shots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Gallery ({gallery.length})</span>
              <label className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-mono transition-colors ${galleryUploading ? "border-primary text-primary cursor-wait" : "border-border hover:border-primary cursor-pointer"}`}>
                {galleryUploading ? <FiLoader size={14} className="animate-spin" /> : <FiUploadCloud size={14} />} {galleryUploading ? "Uploading…" : "Add images"}
                <input type="file" accept="image/*" multiple className="hidden" disabled={galleryUploading} onChange={(e) => handleGalleryUpload(e.target.files)} />
              </label>
            </div>
            {gallery.length === 0 ? (
              <p className="text-[11px] font-mono text-muted-foreground border border-dashed border-border p-4 text-center">No gallery images yet. Add interior, exterior and detail shots.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={gallery.map(g => g.image_url)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {gallery.map((g, i) => (
                      <SortableGalleryItem key={g.image_url} id={g.image_url} g={g} onRemove={() => removeGalleryImage(i)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {isAdmin ? (
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-mono uppercase">
                <input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured
              </label>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => set({ status: e.target.value as any })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>
          ) : (
            <p className="text-[11px] font-mono text-muted-foreground border border-border p-3">
              Saved as a <span className="text-foreground">draft</span>. An admin will review and publish it.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-5 py-3 text-xs font-mono uppercase tracking-widest border border-border hover:border-primary">Cancel</button>
          <button onClick={submit} disabled={saving || uploading || galleryUploading} className="px-6 py-3 text-xs font-mono font-black uppercase tracking-widest bg-primary text-white hover:bg-foreground transition-colors disabled:opacity-60">
            {saving ? "Saving…" : initial ? "Save changes" : "Create vehicle"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────── Brands ─────────────── */
function BrandsTab() {
  const { data: brands, isLoading } = useAdminBrands()
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const deleteBrand = useDeleteBrand()
  const { confirm, dialog } = useConfirm()
  const toast = useToast()
  
  const [form, setForm] = useState<{ id?: string; name: string; country: string; founded_year: string; logo_url: string }>({ name: "", country: "", founded_year: "", logo_url: "" })
  const [uploading, setUploading] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Brand, direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: keyof Brand) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
  }

  const sortedBrands = [...(brands ?? [])].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    let valA = a[key] ?? "";
    let valB = b[key] ?? "";
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleUpload = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadImage(file, "brand", form.name || "logo")
      setForm(f => ({ ...f, logo_url: url }))
    } catch (err: any) { toast.error(err?.message || "Upload failed.") }
    finally { setUploading(false) }
  }

  const save = async () => {
    if (form.name.trim().length < 1) return
    const payload = { name: form.name.trim(), country: form.country || null, founded_year: form.founded_year ? parseInt(form.founded_year) : null, logo_url: form.logo_url || null }
    try {
      if (form.id) { await updateBrand.mutateAsync({ id: form.id, data: payload }); toast.success("Brand updated.") }
      else { await createBrand.mutateAsync(payload); toast.success("Brand added.") }
      setForm({ name: "", country: "", founded_year: "", logo_url: "" })
    } catch (e: any) { toast.error(e?.message || "Could not save brand.") }
  }
  const edit = (b: Brand) => setForm({ id: b.id, name: b.name, country: b.country || "", founded_year: b.founded_year?.toString() || "", logo_url: b.logo_url || "" })

  return (
    <div>
      <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight mb-8">Brands</h2>
      <div className="flex flex-wrap items-end gap-3 mb-8 border border-border p-4 bg-muted/10">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Brand Name *</label>
          <input className="border border-border bg-background px-3 py-2 text-sm w-48 focus:border-primary outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Country</label>
          <input className="border border-border bg-background px-3 py-2 text-sm w-32 focus:border-primary outline-none" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Founded</label>
          <input className="border border-border bg-background px-3 py-2 text-sm w-24 focus:border-primary outline-none" value={form.founded_year} onChange={(e) => setForm({ ...form, founded_year: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Logo</label>
          <div className="flex items-center gap-2">
            <input className="border border-border bg-background px-3 py-2 text-sm w-40 focus:border-primary outline-none" placeholder="URL" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
            <label className={`inline-flex items-center justify-center border px-3 py-2 text-xs font-mono transition-colors ${uploading ? "border-primary text-primary cursor-wait" : "border-border hover:border-primary cursor-pointer bg-background"}`}>
              {uploading ? <FiLoader size={14} className="animate-spin" /> : <FiUploadCloud size={14} />}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handleUpload(e.target.files?.[0])} />
            </label>
          </div>
        </div>
        
        <button onClick={save} className="bg-primary text-white px-5 py-2 text-xs font-mono font-bold uppercase tracking-widest hover:bg-foreground transition-colors ml-auto">{form.id ? "Update" : "Add"}</button>
        {form.id && <button onClick={() => setForm({ name: "", country: "", founded_year: "", logo_url: "" })} className="px-5 py-2 text-xs font-mono uppercase border border-border bg-background hover:bg-muted transition-colors">Cancel</button>}
      </div>

      {isLoading ? <p className="font-mono text-sm">Loading…</p> : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-3 w-16 text-center">Logo</th>
                <th className="text-left p-3 cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSort('name')}>
                  Brand Name {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="text-left p-3 cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSort('country')}>
                  Country {sortConfig?.key === 'country' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="text-left p-3 cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSort('founded_year')}>
                  Founded {sortConfig?.key === 'founded_year' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBrands.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="p-3 text-center">
                    {b.logo_url ? <img src={b.logo_url} alt={b.name} className="w-8 h-8 object-contain mx-auto" /> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-3 font-archivo font-bold">{b.name}</td>
                  <td className="p-3 text-muted-foreground">{b.country || "—"}</td>
                  <td className="p-3 font-mono text-xs">{b.founded_year || "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => edit(b)} className="p-2 border border-border hover:border-primary"><FiEdit size={14} /></button>
                      <button onClick={async () => { if (await confirm(`Delete brand "${b.name}"? Vehicles keep their manufacturer text.`)) deleteBrand.mutate(b.id, { onSuccess: () => toast.success("Brand deleted."), onError: (e: any) => toast.error(e?.message || "Delete failed.") }) }} className="p-2 border border-border hover:border-primary text-primary"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedBrands.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground font-mono text-xs">No brands found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {dialog}
    </div>
  )
}

/* ─────────────── Leads ─────────────── */
function LeadsTab() {
  const { data, isLoading } = useLeads({ limit: 100 })
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()
  const { confirm, dialog } = useConfirm()
  const toast = useToast()
  const { isAdmin } = useAuth()
  const rows = data?.data ?? []
  const statuses = ["new", "contacted", "qualified", "closed"] as const

  const [expanded, setExpanded] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState("")

  const exportCsv = () => {
    if (rows.length === 0) return toast.error("No leads to export.");
    const headers = ["Name", "Email", "Phone", "Location", "Vehicle", "Status", "Date", "Internal Notes"];
    const csvRows = [headers.map(h => `"${h}"`).join(",")];
    for (const l of rows) {
      const vehicle = l.review ? `${l.review.manufacturer} ${l.review.model}` : "General Inquiry";
      const notes = l.internal_notes ? l.internal_notes.replace(/"/g, '""') : "";
      const row = [
        `"${l.full_name}"`, `"${l.email}"`, `"${l.phone}"`, `"${l.preferred_location || ''}"`,
        `"${vehicle}"`, `"${l.status}"`, `"${new Date(l.created_at).toLocaleString()}"`, `"${notes}"`
      ];
      csvRows.push(row.join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully.");
  }

  const toggleExpand = (l: Lead) => {
    if (expanded === l.id) {
      setExpanded(null)
    } else {
      setExpanded(l.id)
      setNoteDraft(l.internal_notes || "")
    }
  }

  const saveNotes = (id: string) => {
    updateLead.mutate({ id, data: { internal_notes: noteDraft } }, {
      onSuccess: () => toast.success("Notes saved.")
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight">Leads</h2>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest hover:bg-foreground transition-colors">
          Export CSV
        </button>
      </div>
      {isLoading ? <p className="font-mono text-sm">Loading…</p> : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left p-3">Contact</th><th className="text-left p-3">Phone Number</th><th className="text-left p-3">Location</th><th className="text-left p-3">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <Fragment key={l.id}>
                  <tr className={`border-t border-border ${expanded === l.id ? "bg-muted/10" : ""}`}>
                    <td className="p-3"><div className="font-archivo font-bold">{l.full_name}</div><div className="text-[10px] font-mono text-muted-foreground">{l.email}</div></td>
                    <td className="p-3 text-xs font-mono">{l.phone || "—"}</td>
                    <td className="p-3 text-xs">{l.preferred_location || "—"}</td>
                    <td className="p-3">
                      <select value={l.status} onChange={(e) => updateLead.mutate({ id: l.id, data: { status: e.target.value as any } }, { onSuccess: () => toast.success("Lead status updated.") })}
                        className="border border-border bg-background px-2 py-1 text-xs font-mono uppercase">
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleExpand(l)} className={`p-2 border hover:border-primary text-muted-foreground hover:text-foreground transition-colors ${expanded === l.id ? 'border-primary text-primary' : 'border-border'}`} title="Notes"><FiEdit size={14} /></button>
                        {isAdmin && (<button onClick={async () => { if (await confirm(`Delete the lead from ${l.full_name}?`)) deleteLead.mutate(l.id, { onSuccess: () => toast.success("Lead deleted.") }) }} className="p-2 border border-border hover:border-primary text-primary"><FiTrash2 size={14} /></button>)}
                      </div>
                    </td>
                  </tr>
                  {expanded === l.id && (
                    <tr className="border-t border-border bg-muted/5">
                      <td colSpan={5} className="p-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Internal Notes (Visible only to admins)</label>
                          <textarea 
                            className="border border-border bg-background p-3 text-sm focus:border-primary outline-none min-h-[80px]" 
                            placeholder="Add notes about this lead... (e.g., Called on Tuesday, left voicemail)"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                          />
                          <div className="flex justify-end">
                            <button onClick={() => saveNotes(l.id)} className="bg-primary text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest hover:bg-foreground transition-colors">
                              Save Notes
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground font-mono text-xs">No leads yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {dialog}
    </div>
  )
}

/* ─────────────── Test Drives ─────────────── */
function TestDrivesTab() {
  const [statusFilter, setStatusFilter] = useState("all")
  const { data, isLoading } = useTestDrives({ limit: 100, ...(statusFilter !== "all" && { status: statusFilter }) })
  const updateTestDrive = useUpdateTestDrive()
  const toast = useToast()
  const rows = data?.data ?? []
  const statuses = ["pending", "confirmed", "completed", "cancelled"] as const

  const badge: Record<string, string> = {
    pending: "text-amber-600",
    confirmed: "text-green-600",
    completed: "text-blue-600",
    cancelled: "text-red-600",
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-archivo font-extrabold uppercase tracking-tight">Test Drives</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto border border-border bg-background px-3 py-2 text-xs font-mono uppercase tracking-widest outline-none focus:border-primary">
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {isLoading ? <p className="font-mono text-sm">Loading…</p> : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Vehicle</th>
                <th className="text-left p-3">Preferred</th>
                <th className="text-left p-3">Location</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-t border-border align-top">
                  <td className="p-3">
                    <div className="font-archivo font-bold">{t.full_name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{t.email}</div>
                    {t.phone && <div className="text-[10px] font-mono text-muted-foreground">{t.phone}</div>}
                  </td>
                  <td className="p-3 text-xs">{t.review ? `${t.review.manufacturer} ${t.review.model}` : "—"}</td>
                  <td className="p-3 text-xs font-mono whitespace-nowrap">
                    {fmt(t.preferred_date)}{t.preferred_time ? ` · ${t.preferred_time}` : ""}
                  </td>
                  <td className="p-3 text-xs">{t.preferred_location || "—"}</td>
                  <td className="p-3">
                    <select value={t.status}
                      onChange={(e) => updateTestDrive.mutate({ id: t.id, status: e.target.value as TestDriveStatus }, { onSuccess: () => toast.success("Appointment updated.") })}
                      className={`border border-border bg-background px-2 py-1 text-xs font-mono uppercase font-bold ${badge[t.status] || ""}`}>
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground font-mono text-xs">No test-drive appointments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─────────────── Users ─────────────── */
function UsersTab({ currentUserId }: { currentUserId: string }) {
  const { data, isLoading } = useUsers({ limit: 100 })
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const { confirm, dialog } = useConfirm()
  const toast = useToast()
  
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  
  const allRows = data?.data ?? []
  const rows = allRows.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!u.full_name?.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
    }
    return true
  })
  const roles: [string, string][] = [["user", "Customer"], ["operator", "Operator"], ["admin", "Admin"]]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight">Users</h2>
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Search email or name..." 
            className="border border-border bg-background px-3 py-2 text-sm focus:border-primary outline-none w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="border border-border bg-background px-3 py-2 text-sm focus:border-primary outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {roles.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        </div>
      </div>
      {isLoading ? <p className="font-mono text-sm">Loading…</p> : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left p-3">User</th><th className="text-left p-3">Role</th><th className="text-left p-3">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3"><div className="font-archivo font-bold">{u.full_name || "—"}</div><div className="text-[10px] font-mono text-muted-foreground">{u.email}</div></td>
                  <td className="p-3">
                    <select value={u.role} disabled={u.id === currentUserId}
                      onChange={(e) => updateUser.mutate({ id: u.id, data: { role: e.target.value } }, { onSuccess: () => toast.success("Role updated.") })}
                      className="border border-border bg-background px-2 py-1 text-xs font-mono uppercase disabled:opacity-50">
                      {roles.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <button disabled={u.id === currentUserId}
                      onClick={() => updateUser.mutate({ id: u.id, data: { status: u.status === "suspended" ? "active" : "suspended" } }, { onSuccess: () => toast.success("User status updated.") })}
                      className={`text-[10px] font-mono uppercase px-2 py-1 border disabled:opacity-50 ${u.status === "suspended" ? "border-primary text-primary" : "border-green-600 text-green-600"}`}>
                      {u.status === "suspended" ? "Suspended" : "Active"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button disabled={u.id === currentUserId} onClick={async () => { if (await confirm(`Delete user ${u.email}? This permanently removes their account.`)) deleteUser.mutate(u.id, { onSuccess: () => toast.success("User deleted."), onError: (e: any) => toast.error(e?.message || "Delete failed.") }) }}
                      className="p-2 border border-border hover:border-primary text-primary disabled:opacity-30"><FiTrash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[11px] font-mono text-muted-foreground mt-4">You can't change your own role or delete your own account.</p>
      {dialog}
    </div>
  )
}

/* ─────────────── Comments (moderation) ─────────────── */
function CommentsTab() {
  const [status, setStatus] = useState<"pending" | "approved" | "spam" | "all">("pending")
  const { data, isLoading, refetch } = useAdminComments({ limit: 200 })
  const moderate = useModerateComment()
  const del = useDeleteComment()
  const { confirm, dialog } = useConfirm()
  const toast = useToast()
  
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState("")
  const [replying, setReplying] = useState(false)

  const all = data?.data ?? []
  const counts = {
    pending: all.filter((c) => c.status === "pending").length,
    approved: all.filter((c) => c.status === "approved").length,
    spam: all.filter((c) => c.status === "spam").length,
    all: all.length,
  }
  const rows = status === "all" ? all : all.filter((c) => c.status === status)

  const setStatusOf = (id: string, s: "approved" | "pending" | "spam") =>
    moderate.mutate({ id, status: s }, {
      onSuccess: () => toast.success(s === "approved" ? "Comment approved." : s === "spam" ? "Marked as spam." : "Moved to pending."),
      onError: (e: any) => toast.error(e?.message || "Could not update comment."),
    })

  const handleReply = async (c: AppComment) => {
    if (!replyBody.trim()) return;
    setReplying(true);
    try {
      await createComment(c.review_id, {
        author_name: "Admin",
        body: replyBody.trim(),
        parent_id: c.id,
        status: "approved"
      } as any);
      toast.success("Reply posted.");
      setReplyTo(null);
      setReplyBody("");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed to post reply.");
    } finally {
      setReplying(false);
    }
  }

  const filters: { key: typeof status; label: string }[] = [
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "spam", label: `Spam (${counts.spam})` },
    { key: "all", label: `All (${counts.all})` },
  ]

  return (
    <div>
      <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight mb-8">Comments</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setStatus(f.key)}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-colors ${
              status === f.key ? "border-primary bg-primary/10 text-primary font-bold" : "border-border hover:bg-muted/40"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? <p className="font-mono text-sm">Loading…</p> : rows.length === 0 ? (
        <div className="border border-dashed border-border p-10 text-center text-muted-foreground font-mono text-xs uppercase tracking-widest">
          No {status === "all" ? "" : status} comments
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
            <li key={c.id} className="border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-archivo font-bold text-sm uppercase tracking-wide">{c.author_name}</span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 ${
                      c.status === "approved" ? "bg-green-500/10 text-green-600" : c.status === "spam" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>{c.status}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words">{c.body}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button title="Reply" onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyBody(""); }} className={`p-2 border transition-colors ${replyTo === c.id ? 'border-primary text-primary' : 'border-border hover:border-primary text-muted-foreground hover:text-foreground'}`}><FiCopy size={14} /></button>
                  {c.status !== "approved" && (
                    <button title="Approve" onClick={() => setStatusOf(c.id, "approved")} className="p-2 border border-border hover:border-green-600 text-green-600"><FiCheck size={14} /></button>
                  )}
                  {c.status !== "spam" && (
                    <button title="Mark as spam" onClick={() => setStatusOf(c.id, "spam")} className="p-2 border border-border hover:border-primary text-primary"><FiAlertTriangle size={14} /></button>
                  )}
                  <button title="Delete" onClick={async () => { if (await confirm("Delete this comment permanently?")) del.mutate(c.id, { onSuccess: () => toast.success("Comment deleted.") }) }}
                    className="p-2 border border-border hover:border-primary text-primary"><FiTrash2 size={14} /></button>
                </div>
              </div>
              {replyTo === c.id && (
                <div className="mt-4 flex flex-col gap-2 pl-4 border-l-2 border-primary/30">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-1.5"><FiCopy size={10} /> Admin Reply</span>
                  <textarea 
                    className="border border-border bg-background p-3 text-sm focus:border-primary outline-none min-h-[80px]" 
                    placeholder="Type your official response..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    disabled={replying}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setReplyTo(null)} disabled={replying} className="px-4 py-2 text-xs font-mono uppercase border border-border bg-background hover:bg-muted transition-colors">Cancel</button>
                    <button onClick={() => handleReply(c)} disabled={replying || !replyBody.trim()} className="bg-primary text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest hover:bg-foreground transition-colors disabled:opacity-50">
                      {replying ? "Posting..." : "Post Reply"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {dialog}
    </div>
  )
}

/* ─────────────── Settings ─────────────── */
function SettingsTab() {
  const { user, isAdmin } = useAuth()
  const toast = useToast()
  
  const { data: settingsData, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  
  const [formData, setFormData] = useState({
    hero_title: "",
    hero_subtitle: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    whatsapp: "",
    instagram_url: "",
    twitter_url: "",
    seo_title: "",
    seo_description: "",
  })

  // Update state when data loads (backend already merges sensible defaults)
  useEffect(() => {
    if (settingsData) {
      setFormData({
        hero_title: settingsData.hero_title || "",
        hero_subtitle: settingsData.hero_subtitle || "",
        contact_email: settingsData.contact_email || "",
        contact_phone: settingsData.contact_phone || "",
        contact_address: settingsData.contact_address || "",
        whatsapp: settingsData.whatsapp || "",
        instagram_url: settingsData.instagram_url || "",
        twitter_url: settingsData.twitter_url || "",
        seo_title: settingsData.seo_title || "",
        seo_description: settingsData.seo_description || "",
      })
    }
  }, [settingsData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = () => {
    updateSettings.mutate(formData, {
      onSuccess: () => toast.success("Settings saved successfully."),
      onError: () => toast.error("Failed to save settings.")
    })
  }

  return (
    <div>
      <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight mb-8">Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-border p-6 space-y-4 h-fit">
          <h3 className="font-archivo font-bold text-lg uppercase tracking-wide border-b border-border pb-2 mb-4">Your Profile</h3>
          <div className="flex items-center gap-2 text-green-600 text-xs font-mono uppercase"><FiCheck size={14} /> Signed in</div>
          <div className="text-sm"><span className="font-mono text-muted-foreground text-xs uppercase block">Name</span>{user?.full_name || "—"}</div>
          <div className="text-sm"><span className="font-mono text-muted-foreground text-xs uppercase block">Email</span>{user?.email}</div>
          <div className="text-sm"><span className="font-mono text-muted-foreground text-xs uppercase block">Role</span>{user?.role}</div>
        </div>
        
        {isAdmin && (
          <div className="border border-border p-6 space-y-6">
            <h3 className="font-archivo font-bold text-lg uppercase tracking-wide border-b border-border pb-2">Global Settings</h3>
            
            {isLoading ? <p className="text-sm font-mono text-muted-foreground">Loading settings...</p> : (
              <div className="space-y-6">
                {/* Hero Settings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Hero Banner</h4>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Hero Title</label>
                    <input type="text" name="hero_title" value={formData.hero_title} onChange={handleChange} className="w-full border border-border bg-background p-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Hero Subtitle</label>
                    <input type="text" name="hero_subtitle" value={formData.hero_subtitle} onChange={handleChange} className="w-full border border-border bg-background p-2 text-sm focus:border-primary outline-none" />
                  </div>
                </div>

                {/* Contact Settings */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Contact Info</h4>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Contact Email</label>
                    <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full border border-border bg-background p-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Contact Phone</label>
                    <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="w-full border border-border bg-background p-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Address</label>
                    <input type="text" name="contact_address" value={formData.contact_address} onChange={handleChange} className="w-full border border-border bg-background p-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">WhatsApp Number (digits only)</label>
                    <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="255689759215" className="w-full border border-border bg-background p-2 text-sm focus:border-primary outline-none" />
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Social Links</h4>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Instagram URL</label>
                    <input type="url" name="instagram_url" value={formData.instagram_url} onChange={handleChange} placeholder="https://instagram.com/…" className="w-full border border-border bg-background p-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">X (Twitter) URL</label>
                    <input type="url" name="twitter_url" value={formData.twitter_url} onChange={handleChange} placeholder="https://twitter.com/…" className="w-full border border-border bg-background p-2 text-sm focus:border-primary outline-none" />
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Default SEO Tags</h4>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Site SEO Title</label>
                    <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} className="w-full border border-border bg-background p-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Site Meta Description</label>
                    <textarea name="seo_description" value={formData.seo_description} onChange={handleChange} className="w-full border border-border bg-background p-2 text-sm focus:border-primary outline-none min-h-[80px]" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={handleSave} disabled={updateSettings.isPending} className="bg-primary text-white px-6 py-2 text-sm font-mono font-bold uppercase tracking-widest hover:bg-foreground transition-colors disabled:opacity-50">
                    {updateSettings.isPending ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
