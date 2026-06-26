import { useState } from "react"
import { Navigate } from "react-router-dom"
import {
  FiGrid, FiBox, FiUsers, FiTag, FiInbox, FiSettings, FiLogOut,
  FiPlus, FiEdit, FiTrash2, FiUploadCloud, FiEye, FiEyeOff, FiX, FiCheck, FiLoader, FiAlertTriangle, FiMessageSquare,
} from "react-icons/fi"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/lib/toast"
import { uploadImage } from "@/lib/api"
import {
  useAdminReviews, useCreateReview, useUpdateReview, useDeleteReview, useSetPublish,
  useAdminComments, useModerateComment, useDeleteComment,
  useAdminBrands, useCreateBrand, useUpdateBrand, useDeleteBrand,
  useUsers, useUpdateUser, useDeleteUser,
  useLeads, useUpdateLead, useDeleteLead,
  useAnalytics,
} from "@/hooks/useApi"
import { BODY_STYLES, CONDITIONS } from "@/lib/constants"
import type { Review, ReviewInput, ReviewSpec, GalleryImage, Brand } from "@/lib/types"

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

type Tab = "dashboard" | "vehicles" | "brands" | "comments" | "leads" | "users" | "settings"

const emptyForm: ReviewInput = {
  title: "", excerpt: "", featured_image: "", manufacturer: "", model: "",
  year: new Date().getFullYear(), body_style: "Sedan", condition: "new",
  content: { body: "", pros: [], cons: [] }, rating: 8, status: "draft", featured: false,
  specs: { engine: "", horsepower: undefined, torque: undefined, drivetrain: "All-Wheel Drive", fuel_type: "Electric", acceleration: "", top_speed: "", seating: 5, mileage: 0, price: 0 },
}

export default function AdminPage() {
  const { user, isAdmin, isStaff, loading, logout } = useAuth()
  const [tab, setTab] = useState<Tab>("dashboard")

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-sm">Loading…</div>
  if (!isStaff) return <Navigate to="/signin" replace />

  const nav: { id: Tab; label: string; icon: any; adminOnly?: boolean }[] = [
    { id: "dashboard", label: "Dashboard", icon: FiGrid },
    { id: "vehicles", label: "Vehicles", icon: FiBox },
    { id: "brands", label: "Brands", icon: FiTag, adminOnly: true },
    { id: "comments", label: "Comments", icon: FiMessageSquare },
    { id: "leads", label: "Leads", icon: FiInbox },
    { id: "users", label: "Users", icon: FiUsers, adminOnly: true },
    { id: "settings", label: "Settings", icon: FiSettings },
  ]

  return (
    <div className="min-h-screen bg-background font-inter text-foreground flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border p-6 flex flex-col gap-2 sticky top-0 h-screen">
        <div className="mb-6">
          <h1 className="font-archivo font-extrabold uppercase tracking-tighter text-lg">FUTURE <span className="text-primary">AUTO</span></h1>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Admin Console</p>
        </div>
        {nav.filter((n) => !n.adminOnly || isAdmin).map((n) => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className={`flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
              tab === n.id ? "bg-foreground text-background" : "hover:bg-muted/40"
            }`}>
            <n.icon size={14} /> {n.label}
          </button>
        ))}
        <div className="mt-auto">
          <p className="text-[10px] font-mono text-muted-foreground mb-2 truncate">{user?.email}</p>
          <button onClick={logout} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary hover:underline">
            <FiLogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-x-hidden">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "vehicles" && <VehiclesTab />}
        {tab === "brands" && isAdmin && <BrandsTab />}
        {tab === "comments" && <CommentsTab />}
        {tab === "leads" && <LeadsTab />}
        {tab === "users" && isAdmin && <UsersTab currentUserId={user!.id} />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  )
}

/* ─────────────── Dashboard ─────────────── */
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border p-5">
      <div className="text-3xl font-archivo font-extrabold">{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

function DashboardTab() {
  const { data, isLoading } = useAnalytics()
  if (isLoading || !data) return <p className="font-mono text-sm">Loading analytics…</p>
  const t = data.totals
  return (
    <div>
      <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight mb-8">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Published" value={t.published} />
        <Stat label="Drafts" value={t.drafts} />
        <Stat label="Total Views" value={t.views.toLocaleString()} />
        <Stat label="Avg Rating" value={`${t.avgRating}/10`} />
        <Stat label="New Leads" value={t.newLeads} />
        <Stat label="Pending Comments" value={t.pendingComments} />
        <Stat label="Brands" value={t.brands} />
        <Stat label="Users" value={t.users} />
      </div>
      <div className="border border-border p-6">
        <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-6">Most-viewed vehicles (real data)</h3>
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
    </div>
  )
}

/* ─────────────── Vehicles ─────────────── */
function VehiclesTab() {
  const { data, isLoading } = useAdminReviews({ limit: 100 })
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()
  const setPublish = useSetPublish()

  const [editing, setEditing] = useState<Review | null>(null)
  const [open, setOpen] = useState(false)
  const { confirm, dialog } = useConfirm()
  const toast = useToast()
  const { isAdmin } = useAuth()

  const rows = data?.data ?? []

  const openNew = () => { setEditing(null); setOpen(true) }
  const openEdit = (r: Review) => { setEditing(r); setOpen(true) }

  const onDelete = async (r: Review) => {
    if (await confirm(`Delete "${r.title}"? It will be hidden from the site but can be restored from the database.`)) {
      try { await deleteReview.mutateAsync(r.id); toast.success("Vehicle deleted.") }
      catch (e: any) { toast.error(e?.message || "Delete failed.") }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight">Vehicles</h2>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest hover:bg-foreground transition-colors">
          <FiPlus size={14} /> Add Vehicle
        </button>
      </div>

      {isLoading ? <p className="font-mono text-sm">Loading…</p> : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <tr>
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
                      <button title="Edit" onClick={() => openEdit(r)} className="p-2 border border-border hover:border-primary"><FiEdit size={14} /></button>
                      {isAdmin && (
                        <button title="Delete" onClick={() => onDelete(r)} className="p-2 border border-border hover:border-primary text-primary"><FiTrash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground font-mono text-xs">No vehicles yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <VehicleForm
          initial={editing}
          isAdmin={isAdmin}
          saving={createReview.isPending || updateReview.isPending}
          onClose={() => setOpen(false)}
          onSave={async (payload) => {
            try {
              if (editing) { await updateReview.mutateAsync({ id: editing.id, data: payload }); toast.success("Vehicle updated.") }
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

function VehicleForm({ initial, onClose, onSave, saving, isAdmin }: {
  initial: Review | null
  onClose: () => void
  onSave: (data: ReviewInput) => Promise<void>
  saving: boolean
  isAdmin: boolean
}) {
  const [form, setForm] = useState<ReviewInput>(() => initial ? {
    title: initial.title, excerpt: initial.excerpt || "", featured_image: initial.featured_image || "",
    manufacturer: initial.manufacturer, model: initial.model, year: initial.year,
    body_style: initial.body_style || "Sedan", condition: initial.condition || "new",
    content: { body: (initial.content?.body as string) || "", pros: initial.content?.pros || [], cons: initial.content?.cons || [] },
    rating: initial.rating ?? 8, status: initial.status, featured: initial.featured,
    specs: { ...initial.specs },
  } : { ...emptyForm })

  const [errors, setErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [gallery, setGallery] = useState<GalleryImage[]>(initial?.gallery ?? [])
  const [prosText, setProsText] = useState((initial?.content?.pros || []).join("\n"))
  const [consText, setConsText] = useState((initial?.content?.cons || []).join("\n"))

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
          <Field label="0–100 (s)"><input className={inputCls} value={form.specs?.acceleration ?? ""} onChange={(e) => setSpec({ acceleration: e.target.value })} /></Field>
          <Field label="Drivetrain"><input className={inputCls} value={form.specs?.drivetrain ?? ""} onChange={(e) => setSpec({ drivetrain: e.target.value })} /></Field>
          <Field label="Fuel type"><input className={inputCls} value={form.specs?.fuel_type ?? ""} onChange={(e) => setSpec({ fuel_type: e.target.value })} /></Field>
        </div>

        <div className="mt-4 space-y-4">
          <Field label="Excerpt"><input className={inputCls} value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} /></Field>
          <Field label="Review body"><textarea className={`${inputCls} min-h-[100px]`} value={form.content.body as string} onChange={(e) => set({ content: { ...form.content, body: e.target.value } })} /></Field>
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
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {gallery.map((g, i) => (
                  <div key={`${g.image_url}-${i}`} className="relative aspect-video border border-border overflow-hidden bg-muted group">
                    <img src={g.image_url} alt={g.alt_text || ""} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
                      title="Remove"><FiX size={12} /></button>
                  </div>
                ))}
              </div>
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
  const [form, setForm] = useState<{ id?: string; name: string; country: string; founded_year: string }>({ name: "", country: "", founded_year: "" })

  const save = async () => {
    if (form.name.trim().length < 1) return
    const payload = { name: form.name.trim(), country: form.country || null, founded_year: form.founded_year ? parseInt(form.founded_year) : null }
    try {
      if (form.id) { await updateBrand.mutateAsync({ id: form.id, data: payload }); toast.success("Brand updated.") }
      else { await createBrand.mutateAsync(payload); toast.success("Brand added.") }
      setForm({ name: "", country: "", founded_year: "" })
    } catch (e: any) { toast.error(e?.message || "Could not save brand.") }
  }
  const edit = (b: Brand) => setForm({ id: b.id, name: b.name, country: b.country || "", founded_year: b.founded_year?.toString() || "" })

  return (
    <div>
      <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight mb-8">Brands</h2>
      <div className="flex flex-wrap items-end gap-3 mb-8 border border-border p-4">
        <input className="border border-border bg-background px-3 py-2 text-sm" placeholder="Brand name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border border-border bg-background px-3 py-2 text-sm" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <input className="border border-border bg-background px-3 py-2 text-sm w-28" placeholder="Founded" value={form.founded_year} onChange={(e) => setForm({ ...form, founded_year: e.target.value })} />
        <button onClick={save} className="bg-primary text-white px-4 py-2 text-xs font-mono font-bold uppercase">{form.id ? "Update" : "Add"}</button>
        {form.id && <button onClick={() => setForm({ name: "", country: "", founded_year: "" })} className="px-3 py-2 text-xs font-mono uppercase border border-border">Cancel</button>}
      </div>
      {isLoading ? <p className="font-mono text-sm">Loading…</p> : (
        <div className="border border-border divide-y divide-border">
          {(brands ?? []).map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3">
              <div><span className="font-archivo font-bold">{b.name}</span> <span className="text-xs font-mono text-muted-foreground">{b.country}{b.founded_year ? ` · ${b.founded_year}` : ""}</span></div>
              <div className="flex gap-2">
                <button onClick={() => edit(b)} className="p-2 border border-border hover:border-primary"><FiEdit size={14} /></button>
                <button onClick={async () => { if (await confirm(`Delete brand "${b.name}"? Vehicles keep their manufacturer text.`)) deleteBrand.mutate(b.id, { onSuccess: () => toast.success("Brand deleted."), onError: (e: any) => toast.error(e?.message || "Delete failed.") }) }} className="p-2 border border-border hover:border-primary text-primary"><FiTrash2 size={14} /></button>
              </div>
            </div>
          ))}
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

  return (
    <div>
      <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight mb-8">Leads</h2>
      {isLoading ? <p className="font-mono text-sm">Loading…</p> : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left p-3">Contact</th><th className="text-left p-3">Vehicle</th><th className="text-left p-3">Location</th><th className="text-left p-3">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="p-3"><div className="font-archivo font-bold">{l.full_name}</div><div className="text-[10px] font-mono text-muted-foreground">{l.email} · {l.phone}</div></td>
                  <td className="p-3 text-xs font-mono">{l.review ? `${l.review.manufacturer} ${l.review.model}` : "—"}</td>
                  <td className="p-3 text-xs">{l.preferred_location || "—"}</td>
                  <td className="p-3">
                    <select value={l.status} onChange={(e) => updateLead.mutate({ id: l.id, status: e.target.value as any }, { onSuccess: () => toast.success("Lead status updated.") })}
                      className="border border-border bg-background px-2 py-1 text-xs font-mono uppercase">
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-right">{isAdmin && (<button onClick={async () => { if (await confirm(`Delete the lead from ${l.full_name}?`)) deleteLead.mutate(l.id, { onSuccess: () => toast.success("Lead deleted.") }) }} className="p-2 border border-border hover:border-primary text-primary"><FiTrash2 size={14} /></button>)}</td>
                </tr>
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

/* ─────────────── Users ─────────────── */
function UsersTab({ currentUserId }: { currentUserId: string }) {
  const { data, isLoading } = useUsers({ limit: 100 })
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const { confirm, dialog } = useConfirm()
  const toast = useToast()
  const rows = data?.data ?? []
  const roles: [string, string][] = [["user", "Customer"], ["operator", "Operator"], ["admin", "Admin"]]

  return (
    <div>
      <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight mb-8">Users</h2>
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
  const { data, isLoading } = useAdminComments({ limit: 200 })
  const moderate = useModerateComment()
  const del = useDeleteComment()
  const { confirm, dialog } = useConfirm()
  const toast = useToast()

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
  const { user } = useAuth()
  return (
    <div>
      <h2 className="text-3xl font-archivo font-extrabold uppercase tracking-tight mb-8">Settings</h2>
      <div className="border border-border p-6 max-w-lg space-y-4">
        <div className="flex items-center gap-2 text-green-600 text-xs font-mono uppercase"><FiCheck size={14} /> Signed in</div>
        <div className="text-sm"><span className="font-mono text-muted-foreground text-xs uppercase block">Name</span>{user?.full_name || "—"}</div>
        <div className="text-sm"><span className="font-mono text-muted-foreground text-xs uppercase block">Email</span>{user?.email}</div>
        <div className="text-sm"><span className="font-mono text-muted-foreground text-xs uppercase block">Role</span>{user?.role}</div>
        <p className="text-[11px] font-mono text-muted-foreground pt-4 border-t border-border">
          Site-wide settings (logo, contact info, SEO defaults) need a dedicated `Settings` model on the backend — wire when ready.
        </p>
      </div>
    </div>
  )
}
