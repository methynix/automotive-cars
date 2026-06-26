import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

const sections = [
  ["What we collect", "When you create an account, book a test drive, comment, or subscribe, we collect the details you give us — typically your name, email address and phone number. We also collect basic usage data such as the vehicles you view."],
  ["How we use it", "We use your information to operate the site, respond to test-drive and sales enquiries, send updates you have asked for, and moderate comments. Phone numbers provided for enquiries may be used to contact you about the specific vehicle you asked about."],
  ["Sharing", "We do not sell your personal data. We share it only with service providers that help us run the site (for example hosting and storage), and where required by law."],
  ["Your choices", "You can request access to, correction of, or deletion of your data at any time by contacting us. You can unsubscribe from marketing messages whenever you like."],
  ["Cookies & storage", "We use local browser storage to remember preferences such as your theme and currency. These are not used to track you across other sites."],
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary selection:text-white flex flex-col">
      <Header />
      <main className="flex-1 px-5 md:px-12 max-w-3xl mx-auto py-16 md:py-24">
        <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">Legal</span>
        <h1 className="text-4xl md:text-6xl font-archivo font-extrabold uppercase tracking-tighter mt-2 mb-3">Privacy Policy</h1>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-12">Last updated June 2026</p>
        <div className="space-y-10">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-xl font-archivo font-bold uppercase tracking-tight mb-3">{title}</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{body}</p>
            </section>
          ))}
          <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-8">
            Questions about this policy? Reach us through the <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
