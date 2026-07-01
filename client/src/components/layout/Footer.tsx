import { Link } from "react-router-dom"
import { FiTwitter, FiInstagram } from "react-icons/fi"
import { FaWhatsapp } from "react-icons/fa"

const API = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "https://automotive-cars.onrender.com"

const yr=(new Date()).getFullYear();
export function Footer() {
  return (
    <footer className="bg-zinc-950 text-white border-t border-border/10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 px-5 md:px-12 max-w-[1280px] mx-auto py-16 md:py-24">
        <div className="col-span-2 md:col-span-1">
          <h2 className="text-2xl md:text-3xl font-archivo font-extrabold text-white mb-5 tracking-tighter uppercase">FUTURE AUTOMOTIVE</h2>
          <p className="text-white/60 text-xs font-inter max-w-xs leading-relaxed">
            Elevating the automotive conversation through high-fidelity journalism and technical precision.
          </p>
        </div>
        <div>
          <h4 className="text-white text-sm font-bold mb-5 uppercase tracking-widest">Ecosystem</h4>
          <ul className="flex flex-col gap-3">
            <li><Link className="text-white/60 hover:text-primary text-xs transition-colors" to="/cars">Browse Cars</Link></li>
            <li><Link className="text-white/60 hover:text-primary text-xs transition-colors" to="/news">News</Link></li>
            <li><Link className="text-white/60 hover:text-primary text-xs transition-colors" to="/#newsletter">Newsletter</Link></li>
            <li><a className="text-white/60 hover:text-primary text-xs transition-colors" href={`${API}/sitemap.xml`} target="_blank" rel="noreferrer">Sitemap</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-sm font-bold mb-5 uppercase tracking-widest">Company</h4>
          <ul className="flex flex-col gap-3">
            <li><Link className="text-white/60 hover:text-primary text-xs transition-colors" to="/contact">Contact</Link></li>
            <li><Link className="text-white/60 hover:text-primary text-xs transition-colors" to="/privacy">Privacy Policy</Link></li>
            <li><Link className="text-white/60 hover:text-primary text-xs transition-colors" to="/terms">Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-sm font-bold mb-5 uppercase tracking-widest">Follow</h4>
          <div className="flex gap-4">
            <a className="w-10 h-10 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all rounded" href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <FiTwitter className="text-lg" />
            </a>
            <a className="w-10 h-10 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all rounded" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FiInstagram className="text-lg" />
            </a>
            <a className="w-10 h-10 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all rounded" href="https://wa.me/255689759215" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <FaWhatsapp className="text-lg" />
            </a>
          </div>
        </div>
      </div>
      <div className="px-5 md:px-12 max-w-[1280px] mx-auto py-8 border-t border-white/5 text-center">
        <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">
          &copy; {yr} FUTURE AUTOMOTIVE. ALL RIGHTS RESERVED.
        </span>
      </div>
    </footer>
  )
}
