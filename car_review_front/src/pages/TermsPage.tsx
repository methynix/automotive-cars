import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

const sections = [
  ["Using this site", "Future Automotive provides editorial reviews and vehicle listings for information purposes. By using the site you agree to these terms. If you do not agree, please do not use the site."],
  ["Accounts", "You are responsible for keeping your login details secure and for activity under your account. Public sign-up creates a standard customer account; staff access is granted only by an administrator."],
  ["Listings & pricing", "We work to keep specifications and prices accurate, but they are provided as a guide and may change. Nothing on this site is a binding offer of sale. Confirm details and final pricing before purchase."],
  ["User content", "Comments you post must not be unlawful, abusive or spam. We moderate comments and may remove or refuse any content at our discretion."],
  ["Liability", "The site is provided \u201cas is\u201d. To the extent permitted by law we are not liable for losses arising from reliance on information shown here."],
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white flex flex-col">
      <Header />
      <main className="flex-1 px-5 md:px-12 max-w-3xl mx-auto py-16 md:py-24">
        <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">Legal</span>
        <h1 className="text-4xl md:text-6xl font-archivo font-extrabold uppercase tracking-tighter mt-2 mb-3">Terms of Service</h1>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-12">Last updated June 2026</p>
        <div className="space-y-10">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-xl font-archivo font-bold uppercase tracking-tight mb-3">{title}</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
