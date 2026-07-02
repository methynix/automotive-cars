import { useState } from "react"
import { FiMail, FiPhone, FiMapPin, FiCheckCircle } from "react-icons/fi"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useCreateLead, useSettings } from "@/hooks/useApi"
import { useToast } from "@/lib/toast"

export default function ContactPage() {
  const createLead = useCreateLead()
  const { data: settings } = useSettings()
  const toast = useToast()
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", message: "" })
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    if (form.full_name.trim().length < 2) return setErr("Please enter your name.")
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr("Please enter a valid email.")
    if (form.phone.trim().length < 6) return setErr("Please enter a valid phone number.")
    try {
      // Contact messages flow into the same Leads pipeline the admin already manages.
      await createLead.mutateAsync({ ...form, preferred_location: "Contact form" })
      setDone(true)
      toast.success("Message sent — we'll be in touch shortly.")
    } catch (e: any) {
      setErr(e?.message || "Could not send your message.")
    }
  }

  const inputCls = "w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none"

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white flex flex-col">
      <Header />
      <main className="flex-1 px-5 md:px-12 max-w-5xl mx-auto py-16 md:py-24 w-full">
        <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">Get in touch</span>
        <h1 className="text-4xl md:text-6xl font-archivo font-extrabold uppercase tracking-tighter mt-2 mb-12">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Questions about a vehicle, a test drive, or anything else? Send us a message and a specialist will get back to you.
            </p>
            <div className="space-y-4 text-sm font-mono">
              {settings?.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-3 hover:text-primary transition-colors"><FiMail className="text-primary" /> {settings.contact_email}</a>
              )}
              {settings?.contact_phone && (
                <a href={`tel:${String(settings.contact_phone).replace(/\s+/g, "")}`} className="flex items-center gap-3 hover:text-primary transition-colors"><FiPhone className="text-primary" /> {settings.contact_phone}</a>
              )}
              {settings?.contact_address && (
                <div className="flex items-center gap-3"><FiMapPin className="text-primary" /> {settings.contact_address}</div>
              )}
            </div>
          </div>

          <div className="border border-border p-6 md:p-8">
            {done ? (
              <div className="text-center py-10">
                <FiCheckCircle className="mx-auto text-green-600 mb-4" size={32} />
                <p className="font-archivo font-bold uppercase mb-1">Message sent</p>
                <p className="text-sm text-muted-foreground">Thanks for reaching out — we'll reply soon.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <input className={inputCls} placeholder="Full name *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                <input className={inputCls} placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className={inputCls} placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <textarea className={`${inputCls} min-h-[120px]`} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                {err && <p className="text-red-500 text-xs font-mono">{err}</p>}
                <button onClick={submit} disabled={createLead.isPending}
                  className="w-full bg-primary text-white py-4 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-foreground transition-colors disabled:opacity-60">
                  {createLead.isPending ? "Sending…" : "Send message"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
