import { FiInstagram } from "react-icons/fi";

export function Footer() {
  return (
    <footer className="bg-secondary text-white border-t border-border/10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-6 md:px-12 max-w-[1280px] mx-auto py-24">
        <div className="col-span-1 md:col-span-1">
          <h2 className="text-3xl font-archivo font-extrabold text-white mb-6 tracking-tighter uppercase">FUTURE AUTOMOTIVE</h2>
          <p className="text-white/60 text-xs font-inter max-w-xs leading-relaxed">
            Elevating the automotive conversation through high-fidelity journalism and technical precision.
          </p>
        </div>
        <div>
          <h4 className="text-white text-sm font-bold mb-6 uppercase tracking-widest">Ecosystem</h4>
          <ul className="flex flex-col gap-3">
            <li><a className="text-white/60 hover:text-primary text-xs transition-colors" href="#">Sitemap</a></li>
            <li><a className="text-white/60 hover:text-primary text-xs transition-colors" href="#">Newsletter</a></li>
            <li><a className="text-white/60 hover:text-primary text-xs transition-colors" href="#">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-sm font-bold mb-6 uppercase tracking-widest">Legal</h4>
          <ul className="flex flex-col gap-3">
            <li><a className="text-white/60 hover:text-primary text-xs transition-colors" href="#">Privacy Policy</a></li>
            <li><a className="text-white/60 hover:text-primary text-xs transition-colors" href="#">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-sm font-bold mb-6 uppercase tracking-widest">Follow</h4>
          <div className="flex gap-4">
            
            <a className="w-10 h-10 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all rounded" href="www.instagram.com">
              <FiInstagram className="text-lg" />
            </a>
          </div>
        </div>
      </div>
      <div className="px-6 md:px-12 max-w-[1280px] mx-auto py-8 border-t border-white/5 text-center">
        <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">
          © 2026 FUTURE AUTOMOTIVE. ALL RIGHTS RESERVED.
        </span>
      </div>
    </footer>
  );
}
