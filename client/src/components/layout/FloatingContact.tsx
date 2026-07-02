import { useState, useRef, useEffect } from "react";
import { FiMessageCircle, FiInstagram, FiX, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/hooks/useApi";

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { data: settings } = useSettings();
  const email = String(settings?.contact_email || "contact@future-automotive.com");
  const whatsapp = String(settings?.whatsapp || "255689759215").replace(/[^0-9]/g, "");
  const instagram = String(settings?.instagram_url || "https://instagram.com");
  const twitter = String(settings?.twitter_url || "https://twitter.com");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-archivo">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            ref={modalRef} 
            className="absolute bottom-full right-0 mb-4 bg-zinc-950 border border-white/10 p-6 w-[280px] shadow-2xl origin-bottom-right"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-sm font-bold uppercase tracking-widest">Connect With Us</h3>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors duration-300">
                <FiX size={18} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/40 transition-all duration-300 p-3 group"
              >
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <FiMail className="text-white text-xl" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">Email</div>
                  <div className="text-white/50 text-[10px] font-mono uppercase tracking-widest">Direct support</div>
                </div>
              </a>

              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer" 
                className="flex items-center gap-4 bg-white/5 hover:bg-[#25D366]/10 border border-white/5 hover:border-[#25D366]/50 transition-all duration-300 p-3 group"
              >
                <div className="w-10 h-10 bg-[#25D366]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <FaWhatsapp className="text-[#25D366] text-xl" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">WhatsApp</div>
                  <div className="text-white/50 text-[10px] font-mono uppercase tracking-widest">Chat with us</div>
                </div>
              </a>

              <a
                href={instagram}
                target="_blank"
                rel="noreferrer" 
                className="flex items-center gap-4 bg-white/5 hover:bg-[#E1306C]/10 border border-white/5 hover:border-[#E1306C]/50 transition-all duration-300 p-3 group"
              >
                <div className="w-10 h-10 bg-[#E1306C]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <FiInstagram className="text-[#E1306C] text-xl" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">Instagram</div>
                  <div className="text-white/50 text-[10px] font-mono uppercase tracking-widest">Follow us</div>
                </div>
              </a>

              <a
                href={twitter}
                target="_blank"
                rel="noreferrer" 
                className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/50 transition-all duration-300 p-3 group"
              >
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <BsTwitterX className="text-white text-lg" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">X (Twitter)</div>
                  <div className="text-white/50 text-[10px] font-mono uppercase tracking-widest">Stay updated</div>
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(45,146,211,0.3)] hover:scale-110 hover:shadow-[0_0_30px_rgba(45,146,211,0.5)] transition-all duration-300 z-50 relative"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
          </motion.div>
        </AnimatePresence>
      </button>
    </div>
  );
}
