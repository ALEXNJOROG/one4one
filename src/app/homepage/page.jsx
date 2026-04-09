"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── CSS Injection ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  html, body { overflow-x: hidden; max-width: 100vw; }
  body { background: #0d0d0f; color: #fff; }

  :root {
    --gold: #C9A84C;
    --gold-light: #e8c96a;
    --gold-dark: #9a7a2e;
    --navy: #0d0d1a;
    --navy-mid: #141428;
    --navy-light: #1e1e3a;
    --cream: #f5f0e8;
    --cream-mid: #ede6d8;
    --text-muted: rgba(255,255,255,0.45);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(201,168,76,0.3); }
    50% { box-shadow: 0 0 50px rgba(201,168,76,0.7); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-12px) rotate(1deg); }
    66% { transform: translateY(-6px) rotate(-1deg); }
  }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes borderPulse {
    0%, 100% { border-color: rgba(201,168,76,0.3); }
    50% { border-color: rgba(201,168,76,0.8); }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes rotateGlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes heroKenBurns {
    0% { transform: scale(1.08) translate(0%, 0%); }
    100% { transform: scale(1.18) translate(-2%, -1%); }
  }
  @keyframes counterUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0%); opacity: 1; }
  }
  @keyframes lineExpand {
    from { width: 0; }
    to { width: 100%; }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes navReveal {
    from { opacity: 0; transform: translateY(-100%); }
    to { opacity: 1; transform: translateY(0); }
  }

  .gold-shimmer {
    background: linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 40%, #fff8e8 50%, var(--gold-light) 60%, var(--gold) 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .slide-track {
    animation: ticker 30s linear infinite;
  }
  .slide-track:hover { animation-play-state: paused; }

  .gallery-item:hover .gallery-overlay { opacity: 1; }
  .gallery-item:hover img { transform: scale(1.08); }

  .cert-card:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.5) !important; }
  
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--gold);
    transition: width 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .nav-link:hover::after { width: 100%; }

  .btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 16px 48px rgba(201,168,76,0.55) !important; }
  .btn-secondary:hover { background: rgba(201,168,76,0.12) !important; border-color: rgba(201,168,76,0.6) !important; color: var(--gold-light) !important; }
  
  .event-card:hover { transform: translateY(-6px); box-shadow: 0 32px 80px rgba(0,0,0,0.5) !important; }
  .event-card:hover .event-card-img { transform: scale(1.06); }

  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
    .hero-title { font-size: clamp(3rem, 14vw, 5rem) !important; }
    .stats-row { gap: 1.5rem !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
  }
  @media (min-width: 769px) {
    .mobile-menu-btn { display: none !important; }
    .mobile-nav-drawer { display: none !important; }
  }
`;

// ── Utility hooks ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useCounter(target, active, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const end = parseInt(target);
    const steps = 60;
    const increment = end / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, interval);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);
const FacebookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const TwitterIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const LinkedInIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

// ── Image Modal ───────────────────────────────────────────────────────────────
function ImageModal({ src, alt, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", animation: "fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, overflow: "hidden", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)", border: "1px solid rgba(201,168,76,0.2)" }}>
        <img src={src} alt={alt} style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", display: "block" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 38, height: 38, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(201,168,76,0.3)", color: "#fff", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.8)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}>✕</button>
      </div>
      <div style={{ position: "absolute", bottom: "1.5rem", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", letterSpacing: "0.05em" }}>ESC TO CLOSE</div>
    </div>
  );
}

// ── Certificate Modal ─────────────────────────────────────────────────────────
function CertificateModal({ cert, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "min(860px, 95vw)", borderRadius: 20, overflow: "hidden", background: "#0d0d1a", border: "1px solid rgba(201,168,76,0.25)", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(13,13,26,0.9))", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.25rem" }}>📜</span>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{cert.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>Mt. Kenya Day Dash · January 2026</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.3)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(201,168,76,0.1)"}>✕</button>
        </div>
        <div style={{ background: "#111122", height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <iframe src={cert.file} title={cert.name} width="100%" height="100%" style={{ border: "none", display: "block" }} />
        </div>
        <div style={{ background: "#0a0a14", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", letterSpacing: "0.05em" }}>CLICK OUTSIDE OR ESC TO CLOSE</p>
          <a href={cert.file} download target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.5rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#fff", borderRadius: 50, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(201,168,76,0.4)", transition: "all 0.2s" }}>
            ⬇ Download Certificate
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Noise texture overlay ─────────────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />
  );
}

// ── Ticker Banner ─────────────────────────────────────────────────────────────
function TickerBanner() {
  const items = ["Running Events", "Hiking Adventures", "Tour Experiences", "Mt. Kenya Day Dash", "Vienna Loop", "Better Together", "Nairobi, Kenya", "Celebrate Achievement"];
  const doubled = [...items, ...items];
  return (
    <div style={{ background: "var(--gold)", overflow: "hidden", padding: "0.55rem 0", position: "relative", zIndex: 10 }}>
      <div className="slide-track" style={{ display: "flex", width: "max-content", gap: "0" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "#0d0d1a", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 2.5rem", display: "flex", alignItems: "center", gap: "1rem", whiteSpace: "nowrap" }}>
            {item}
            <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "rgba(13,13,26,0.4)" }} />
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = ["About", "Events", "Gallery", "Results"];

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        background: scrolled ? "rgba(10,10,20,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(1.8)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,168,76,0.12)" : "1px solid transparent",
        transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
        animation: mounted ? "navReveal 0.8s cubic-bezier(0.16,1,0.3,1)" : "none",
        maxWidth: "100vw", overflow: "hidden"
      }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 78 }}>
          {/* Logo */}
          <a href="#home" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <img
  src="/media/logo2.png"
  alt="ONE4ONE"
  style={{
    width: 52,
    height: 52,
    objectFit: "contain",
    display: "block",
    filter: "drop-shadow(0 0 0 transparent)" // helps with PNG blending
  }}
  onError={e => {
    e.target.style.display = "none";
    e.target.insertAdjacentHTML('afterend', '<span style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:1.1rem;color:#C9A84C;letter-spacing:0.05em">1·4·1</span>');
  }}
/>
          </a>

          {/* Desktop Nav */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link" style={{ position: "relative", fontFamily: "'Syne', sans-serif", fontSize: "0.82rem", fontWeight: 600, color: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.9)", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.25s" }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.9)"}>{l}</a>
            ))}
            <a href="#contact" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg, #C9A84C, #b8962e)", color: "#0d0d1a", padding: "0.62rem 1.5rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.78rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.3s", boxShadow: "0 4px 20px rgba(201,168,76,0.3)" }}
              className="btn-primary">
              Contact Us
            </a>
          </div>

          {/* Hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)} style={{ flexDirection: "column", justifyContent: "center", alignItems: "flex-end", gap: 5, width: 44, height: 44, background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem" }}>
            <span style={{ display: "block", width: menuOpen ? 24 : 24, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", width: menuOpen ? 24 : 18, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: menuOpen ? 24 : 12, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className="mobile-nav-drawer" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(320px, 85vw)", zIndex: 490, background: "rgba(10,10,20,0.98)", backdropFilter: "blur(30px)", transform: menuOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)", borderLeft: "1px solid rgba(201,168,76,0.15)", padding: "6rem 2rem 2rem" }}>
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ display: "block", fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", textDecoration: "none", padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", letterSpacing: "0.05em", textTransform: "uppercase", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = "#C9A84C"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.8)"}>{l}</a>
        ))}
        <a href="#contact" onClick={() => setMenuOpen(false)} style={{ display: "block", marginTop: "2rem", padding: "1rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none", textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Contact Us
        </a>
      </div>
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 480, background: "rgba(0,0,0,0.5)" }} />}
    </>
  );
}

// ── Hero Slideshow ────────────────────────────────────────────────────────────
const SLIDES = [
  {
    type: "upcoming",
    label: "UPCOMING EVENT",
    title: "Karen Vienna\nLoop Marathon",
    subtitle: "Full Marathon · Karen, Nairobi",
    date: "28 Feb 2026",
    tag: "Registration Open",
    tagColor: "#C9A84C",
    img: "/media/upcoming.png",
    cta: { text: "Register Now", href: "#contact" },
    accentColor: "#C9A84C",
    overlayColor: "linear-gradient(135deg, rgba(13,13,26,0.75) 0%, rgba(13,13,26,0.3) 60%, rgba(201,168,76,0.1) 100%)",
  },
  {
    type: "past",
    label: "PAST EVENT · JAN 2026",
    title: "Mt. Kenya\nDay Dash",
    subtitle: "Naromoru Route · Hiking",
    date: "24 Jan 2026",
    tag: "Completed",
    tagColor: "#22c55e",
    img: "/media/events/mtkd - 5.png",
    cta: { text: "View Gallery", href: "#gallery" },
    accentColor: "#4ade80",
    overlayColor: "linear-gradient(135deg, rgba(13,13,26,0.8) 0%, rgba(13,13,26,0.35) 60%, rgba(74,222,128,0.08) 100%)",
  },
  {
    type: "highlight",
    label: "ADVENTURE",
    title: "Summit\nApproach",
    subtitle: "Mt. Kenya · Breathtaking Views",
    date: "Jan 2026",
    tag: "Highlights",
    tagColor: "#a78bfa",
    img: "/media/events/mtkd - 3.png",
    cta: { text: "See All Photos", href: "#gallery" },
    accentColor: "#a78bfa",
    overlayColor: "linear-gradient(135deg, rgba(13,13,26,0.82) 0%, rgba(13,13,26,0.25) 70%, rgba(167,139,250,0.08) 100%)",
  },
  {
    type: "highlight",
    label: "COMMUNITY",
    title: "Better\nTogether",
    subtitle: "Supporting Athletes Across Africa",
    date: "Est. 2024",
    tag: "ONE4ONE",
    tagColor: "#C9A84C",
    img: "/media/events/mtkd - 1.png",
    cta: { text: "About Us", href: "#about" },
    accentColor: "#C9A84C",
    overlayColor: "linear-gradient(135deg, rgba(13,13,26,0.85) 0%, rgba(13,13,26,0.3) 65%, rgba(201,168,76,0.1) 100%)",
  },
];

function HeroSlideshow({ onImageClick }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [direction, setDirection] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);

  const goTo = useCallback((idx, dir = 1) => {
    if (isTransitioning || idx === current) return;
    setIsTransitioning(true);
    setPrev(current);
    setDirection(dir);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setIsTransitioning(false); }, 900);
  }, [current, isTransitioning]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      goTo((current + 1) % SLIDES.length, 1);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [current, goTo]);

  const slide = SLIDES[current];
  const [ref, statsVisible] = useInView(0.1);
  const stats = [
    { value: "2", suffix: "+", label: "Events" },
    { value: "100", suffix: "+", label: "Athletes" },
    { value: "3", suffix: "", label: "Countries" },
  ];
  const c1 = useCounter(stats[0].value, statsVisible);
  const c2 = useCounter(stats[1].value, statsVisible);
  const c3 = useCounter(stats[2].value, statsVisible);
  const counters = [c1, c2, c3];

  return (
    <section id="home" style={{ position: "relative", height: "100vh", minHeight: 640, overflow: "hidden", background: "#0d0d1a" }}>

      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          opacity: i === current ? 1 : (i === prev ? 0 : 0),
          transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1)",
          zIndex: i === current ? 2 : (i === prev ? 1 : 0),
        }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <img src={s.img} alt={s.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", transformOrigin: "center", animation: i === current ? "heroKenBurns 7s ease-out forwards" : "none" }}
              onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}, #0d0d1a)`; }} />
            <div style={{ position: "absolute", inset: 0, background: s.overlayColor }} />
          </div>
        </div>
      ))}

      {/* Grain overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }} />

      {/* Bottom fade */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: "linear-gradient(to top, #0d0d1a 0%, transparent 100%)", zIndex: 4, pointerEvents: "none" }} />

      {/* Left accent line */}
      <div style={{ position: "absolute", left: "1.5rem", top: "20%", bottom: "20%", width: 1, background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5), transparent)", zIndex: 5 }} />

      {/* Content */}
      <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 2rem 5rem 3rem", maxWidth: 1320, margin: "0 auto", left: 0, right: 0 }}>

        {/* Slide label */}
        <div key={`label-${current}`} style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", animation: loaded ? "slideInLeft 0.7s 0.1s both cubic-bezier(0.16,1,0.3,1)" : "none" }}>
          <div style={{ width: 32, height: 1, background: slide.accentColor }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", fontWeight: 700, color: slide.accentColor, letterSpacing: "0.18em", textTransform: "uppercase" }}>{slide.label}</span>
          <span style={{ padding: "0.2rem 0.75rem", borderRadius: 2, background: slide.tagColor, color: "#0d0d1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{slide.tag}</span>
        </div>

        {/* Main title */}
        <h1 key={`title-${current}`} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(3.5rem, 10vw, 7rem)", fontWeight: 700, color: "#fff", lineHeight: 1.0, marginBottom: "1.25rem", letterSpacing: "-0.02em", whiteSpace: "pre-line", animation: loaded ? "fadeUp 0.8s 0.2s both cubic-bezier(0.16,1,0.3,1)" : "none", textShadow: "0 4px 40px rgba(0,0,0,0.5)" }}>
          {slide.title}
        </h1>

        {/* Subtitle + Date */}
        <div key={`sub-${current}`} style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem", animation: loaded ? "fadeUp 0.8s 0.35s both cubic-bezier(0.16,1,0.3,1)" : "none", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.65)", fontWeight: 300 }}>{slide.subtitle}</span>
          <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)" }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.8rem", color: slide.accentColor, letterSpacing: "0.08em" }}>{slide.date}</span>
        </div>

        {/* CTAs */}
        <div key={`cta-${current}`} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3.5rem", animation: loaded ? "fadeUp 0.8s 0.45s both cubic-bezier(0.16,1,0.3,1)" : "none" }}>
          <a href={slide.cta.href} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", padding: "0.85rem 2rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.3s", boxShadow: "0 8px 32px rgba(201,168,76,0.4)" }}>
            {slide.cta.text} <ArrowRight />
          </a>
          <a href="#about" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", padding: "0.85rem 2rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "0.82rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.15)", transition: "all 0.3s", backdropFilter: "blur(8px)" }}>
            Learn More
          </a>
        </div>

        {/* Stats */}
        <div ref={ref} style={{ display: "flex", gap: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }} className="stats-row">
          {stats.map((s, i) => (
            <div key={i} style={{ animation: statsVisible ? `counterUp 0.7s ${0.1 + i * 0.15}s both` : "none" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 700, color: "#C9A84C", lineHeight: 1 }}>
                {counters[i]}{s.suffix}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide nav dots */}
      <div style={{ position: "absolute", right: "2rem", top: "50%", transform: "translateY(-50%)", zIndex: 6, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i, i > current ? 1 : -1)} style={{ display: "block", width: i === current ? 3 : 2, height: i === current ? 32 : 16, borderRadius: 4, background: i === current ? "#C9A84C" : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", padding: 0 }} />
        ))}
      </div>

      {/* Slide arrows */}
      <button onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length, -1)} style={{ position: "absolute", bottom: "8rem", right: "5rem", zIndex: 6, width: 48, height: 48, borderRadius: 4, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 0.25s" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.25)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}>
        <ChevronLeft />
      </button>
      <button onClick={() => goTo((current + 1) % SLIDES.length, 1)} style={{ position: "absolute", bottom: "8rem", right: "2rem", zIndex: 6, width: 48, height: 48, borderRadius: 4, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 0.25s" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.25)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}>
        <ChevronRight />
      </button>

      {/* Slide progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.1)", zIndex: 6 }}>
        <div key={current} style={{ height: "100%", background: "linear-gradient(90deg, #C9A84C, #e8c96a)", animation: "lineExpand 6s linear forwards", width: "0%" }} />
      </div>
    </section>
  );
}

// ── About ────────────────────────────────────────────────────────────────────
function About() {
  const [ref, visible] = useInView();
  const cards = [
    { icon: "🎯", title: "Our Mission", desc: "To offer well-organized events in running, hiking, and tours in Kenya, Africa, and around the globe." },
    { icon: "🤝", title: "Support Athletes", desc: "At the core of our being is to support athletes to achieve their goals by having well-organized and supported events." },
    { icon: "💛", title: "Give Back", desc: "We give back to our community by supporting talented athletes — training in financial literacy, mental wellness, and bodily wellness." },
    { icon: "🏆", title: "Better Together", desc: "Our slogan means that we shall also give back to our community by supporting talented athletes and helping them attend events." },
  ];
  return (
    <section id="about" ref={ref} style={{ padding: "7rem 1.5rem", background: "#0d0d1a", position: "relative", overflow: "hidden" }}>
      {/* Background accent */}
      <div style={{ position: "absolute", top: "50%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents: "none", transform: "translateY(-50%)" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "3rem", marginBottom: "4rem", flexWrap: "wrap", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Who We Are</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 7vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              About <span className="gold-shimmer">ONE4ONE</span>
            </h2>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.5)", fontSize: "1rem", maxWidth: 420, lineHeight: 1.8, paddingTop: "0.5rem" }}>
            ONE4ONE is an organization that organizes running, hiking, and tours. We believe in achieving greatness together — supporting every athlete to reach their peak.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
          {cards.map((c, i) => (
            <div key={i} style={{ padding: "2.25rem", background: "#0d0d1a", transition: "all 0.35s", cursor: "default", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transition: `opacity 0.7s ${0.1 + i * 0.1}s, transform 0.7s ${0.1 + i * 0.1}s, background 0.3s` }}
              onMouseEnter={e => e.currentTarget.style.background = "#141428"}
              onMouseLeave={e => e.currentTarget.style.background = "#0d0d1a"}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1.5rem", border: "1px solid rgba(201,168,76,0.15)" }}>{c.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "1rem", marginBottom: "0.75rem", letterSpacing: "0.02em" }}>{c.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", lineHeight: 1.75 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── What We Organize ─────────────────────────────────────────────────────────
function WhatWeOrganize() {
  const [ref, visible] = useInView();
  const items = [
    { icon: "🏃", label: "Running Events", desc: "Marathon, half-marathon, and fun runs across Kenya and beyond", color: "#C9A84C" },
    { icon: "🥾", label: "Hiking Adventures", desc: "Expert-guided mountain hikes including Mt. Kenya routes", color: "#4ade80" },
    { icon: "🗺️", label: "Tour Experiences", desc: "Curated cultural and scenic tours across East Africa", color: "#60a5fa" },
    { icon: "🏅", label: "Certifications", desc: "Official certificates and medals for all event finishers", color: "#a78bfa" },
  ];
  return (
    <section ref={ref} style={{ padding: "6rem 1.5rem", background: "#111122", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(201,168,76,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>What We Do</span>
            <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 7vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: "1rem" }}>What We Organize</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.45)", fontSize: "1rem", maxWidth: 520, margin: "0 auto", lineHeight: 1.75 }}>From mountain day dashes to marathon loops — we create memorable experiences for athletes of all levels.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
          {items.map((item, i) => (
            <div key={i} style={{ padding: "2rem", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", cursor: "default", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transitionDelay: `${i * 0.1}s` }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = `${item.color}40`; e.currentTarget.style.transform = "translateY(-6px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: "2rem", marginBottom: "1.25rem" }}>{item.icon}</div>
              <div style={{ width: 28, height: 2, background: item.color, borderRadius: 2, marginBottom: "1rem" }} />
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "1rem", marginBottom: "0.6rem" }}>{item.label}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Events ────────────────────────────────────────────────────────────────────
function Events({ onImageClick, onCertClick }) {
  const [ref, visible] = useInView();
  const [photoHovered, setPhotoHovered] = useState(null);

  const upcomingEvent = {
    title: "Karen, Vienna Loop Marathon",
    date: "28th February 2026",
    location: "Karen, Nairobi",
    distance: "Full Marathon",
    participants: "100+ Expected",
    status: "Registration Open",
    image: "/media/upcoming.png"
  };

  const pastEvent = {
    title: "Mt. Kenya Day Dash",
    subtitle: "Naromoru Route",
    date: "24th January 2026",
    guides: ["Peter Waihenya", "Elijah Kabugi"],
    photos: [
      { src: "/media/events/mtkd - 1.png", caption: "Group Hike" },
      { src: "/media/events/mtkd - 2.png", caption: "Crystal Clear" },
      { src: "/media/events/mtkd - 3.png", caption: "Summit Approach" },
      { src: "/media/events/mtkd - 4.png", caption: "Marker Check" },
      { src: "/media/events/mtkd - 5.png", caption: "Group Photo" },
      { src: "/media/events/mtkd - 6.png", caption: "Aerial View" },
    ],
    certificates: [
      { name: "Christopher", file: "/certificates/cert 1.pdf" },
      { name: "Meek", file: "/certificates/Meek.pdf" },
      { name: "Timothy", file: "/certificates/Timothy.pdf" },
      { name: "Wambui", file: "/certificates/Wambui.pdf" },
      { name: "Peter", file: "/certificates/Peter.pdf" },
    ],
  };

  return (
    <section id="events" ref={ref} style={{ padding: "7rem 1.5rem", background: "#0d0d1a", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* ─── Upcoming ─── */}
        <div style={{ marginBottom: "5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", opacity: visible ? 1 : 0, transition: "all 0.7s" }}>
            <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Next Up</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 7vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: "2.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s" }}>
            Upcoming Events
          </h2>

          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div className="event-card" style={{ width: "min(440px, 100%)", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(201,168,76,0.15)", background: "#111122", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transitionDelay: "0.15s", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
              <div style={{ position: "relative", aspectRatio: "16/9", background: "#1a1a2e", overflow: "hidden", cursor: "zoom-in" }}
                onClick={() => onImageClick(upcomingEvent.image, upcomingEvent.title)}>
                <img src={upcomingEvent.image} alt={upcomingEvent.title} className="event-card-img" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = "linear-gradient(135deg,#1e1e3a,#0d0d1a)"; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:4rem">🏃</div>`; }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.6) 0%, transparent 50%)" }} />
                <div style={{ position: "absolute", top: 16, right: 16, background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", padding: "0.3rem 0.9rem", borderRadius: 3, fontSize: "0.72rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {upcomingEvent.status}
                </div>
              </div>
              <div style={{ padding: "1.75rem" }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", marginBottom: "1.25rem", letterSpacing: "-0.01em" }}>{upcomingEvent.title}</h3>
                {[["📅", upcomingEvent.date], ["📍", upcomingEvent.location], ["🕐", upcomingEvent.distance], ["👥", upcomingEvent.participants]].map(([ico, val], j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
                    <span>{ico}</span> {val}
                  </div>
                ))}
                <a href="#contact" className="btn-primary" style={{ display: "block", width: "100%", marginTop: "1.5rem", padding: "0.9rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", border: "none", borderRadius: 6, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", textAlign: "center", boxShadow: "0 4px 20px rgba(201,168,76,0.35)", transition: "all 0.3s", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Register Now
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Past Events ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>History</span>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: "#fff", marginBottom: "2rem" }}>Past Events</h2>

        <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "#111122", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transition: "all 0.7s 0.2s" }}>
          {/* Header */}
          <div style={{ padding: "1.75rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "#fff", fontSize: "1.6rem" }}>{pastEvent.title}</h3>
                <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)", padding: "0.2rem 0.8rem", borderRadius: 3, fontSize: "0.7rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Completed</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>{pastEvent.subtitle}</p>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {[["📅", pastEvent.date], ["👥", `Guides: ${pastEvent.guides.join(" & ")}`]].map(([ico, val], i) => (
                  <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span>{ico}</span> {val}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photos */}
          <div style={{ padding: "1.75rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.88rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span>📸</span> Event Photos
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {pastEvent.photos.map((photo, i) => (
                <div key={i} className="gallery-item" style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", background: `hsl(${i * 35 + 200},25%,${15 + i * 3}%)`, cursor: "zoom-in" }}
                  onMouseEnter={() => setPhotoHovered(i)}
                  onMouseLeave={() => setPhotoHovered(null)}
                  onClick={() => onImageClick(photo.src, photo.caption)}>
                  <img src={photo.src} alt={photo.caption} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem"><span style="font-size:2rem">${["⛰️","🏃","📸","🏁","🏅","🤝"][i]}</span><span style="font-family:'DM Sans',sans-serif;font-size:0.7rem;color:rgba(255,255,255,0.5);text-align:center;padding:0 0.5rem">${photo.caption}</span></div>`; }} />
                  <div className="gallery-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)", opacity: 0, transition: "opacity 0.3s" }} />
                  <div style={{ position: "absolute", bottom: 8, left: 10, opacity: photoHovered === i ? 1 : 0, transition: "all 0.3s", transform: photoHovered === i ? "translateY(0)" : "translateY(4px)" }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "#fff", letterSpacing: "0.05em" }}>{photo.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div style={{ padding: "1.75rem 2rem" }}>
            <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.88rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span>📜</span> Participation Certificates
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px,1fr))", gap: "0.85rem" }}>
              {pastEvent.certificates.map((cert, i) => (
                <div key={i} className="cert-card" onClick={() => onCertClick(cert)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "1rem 1.25rem", border: "1px solid rgba(201,168,76,0.12)", transition: "all 0.3s", cursor: "pointer", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0, border: "1px solid rgba(201,168,76,0.2)" }}>🏅</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.88rem" }}>{cert.name}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", marginTop: 2 }}>Mt. Kenya Day Dash · Jan 2026</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", color: "#C9A84C", fontSize: "0.68rem", marginTop: 3, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Preview →</div>
                    </div>
                  </div>
                  <a href={cert.file} download target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.45rem 0.9rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.72rem", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.05em" }}>
                    ⬇ Save
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────
function Gallery({ onImageClick }) {
  const [ref, visible] = useInView();
  const [hovered, setHovered] = useState(null);
  const [filter, setFilter] = useState("All");

  const items = [
    { src: "/gallery/gallery 1.png", label: "Running", title: "Vienna Loop" },
    { src: "/gallery/gallery 2.png", label: "Running", title: "Vienna Loop" },
    { src: "/gallery/gallery 3.png", label: "Running", title: "Vienna Loop" },
    { src: "/gallery/gallery 4.png", label: "Hiking", title: "Mt. Kenya Day Dash" },
    { src: "/gallery/gallery 5.png", label: "Hiking", title: "Mt. Kenya Day Dash" },
    { src: "/gallery/gallery 6.png", label: "Hiking", title: "Mt. Kenya Day Dash" },
  ];
  const fallbackEmoji = ["⛰️", "🏃", "🌅", "🏋️", "🗺️", "🏁"];
  const filters = ["All", "Running", "Hiking"];
  const filtered = filter === "All" ? items : items.filter(i => i.label === filter);

  const socialLinks = [
    { icon: <InstagramIcon size={16} />, name: "Instagram", url: "https://www.instagram.com/one4one_placeholder" },
    { icon: <FacebookIcon size={16} />, name: "Facebook", url: "https://www.facebook.com/one4one_placeholder" },
    { icon: <TwitterIcon size={16} />, name: "Twitter", url: "https://www.twitter.com/one4one_placeholder" },
  ];

  return (
    <section id="gallery" ref={ref} style={{ padding: "7rem 1.5rem", background: "#111122", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3rem", flexWrap: "wrap", gap: "1.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Visual Diary</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 7vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Event Gallery</h2>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "0.5rem 1.1rem", borderRadius: 4, border: "1px solid", borderColor: filter === f ? "#C9A84C" : "rgba(255,255,255,0.12)", background: filter === f ? "rgba(201,168,76,0.12)" : "transparent", color: filter === f ? "#C9A84C" : "rgba(255,255,255,0.45)", fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", transition: "all 0.25s", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {filtered.map((item, i) => (
            <div key={`${filter}-${i}`} className="gallery-item" style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", background: "#1a1a2e", cursor: "zoom-in", opacity: visible ? 1 : 0, transform: visible ? "none" : "scale(0.96)", transition: `all 0.6s ease ${i * 0.08}s` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onImageClick(item.src, item.title)}>
              <img src={item.src} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${i * 40 + 200},20%,${15 + i * 4}%)`; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem">${fallbackEmoji[i]}</div>`; }} />
              <div className="gallery-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.9) 0%, transparent 60%)", opacity: 0, transition: "opacity 0.3s" }} />
              <div style={{ position: "absolute", bottom: 16, left: 16, opacity: hovered === i ? 1 : 0, transition: "all 0.35s", transform: hovered === i ? "translateY(0)" : "translateY(8px)" }}>
                <span style={{ background: "rgba(201,168,76,0.9)", color: "#0d0d1a", padding: "0.2rem 0.7rem", borderRadius: 3, fontSize: "0.68rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", display: "block", marginBottom: "0.4rem", width: "fit-content", letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "1.1rem", color: "#fff" }}>{item.title}</span>
              </div>
              <div style={{ position: "absolute", top: 14, right: 14, opacity: hovered === i ? 1 : 0, transition: "all 0.3s", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", borderRadius: 4, padding: "0.4rem 0.6rem", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.65rem", color: "#fff", letterSpacing: "0.08em" }}>🔍 VIEW</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: "1.5rem", opacity: visible ? 1 : 0, transition: "all 0.7s 0.4s" }}>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>Follow us:</span>
            {socialLinks.map(({ icon, name, url }) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all 0.25s", textDecoration: "none", letterSpacing: "0.05em" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.color = "#C9A84C"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                {icon} {name}
              </a>
            ))}
          </div>
          <a href="/gallery" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1.75rem", borderRadius: 4, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.06)", color: "#C9A84C", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none", transition: "all 0.3s", letterSpacing: "0.08em", textTransform: "uppercase" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.15)"; e.currentTarget.style.borderColor = "#C9A84C"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.06)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; }}>
            View Full Gallery <ArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Results ───────────────────────────────────────────────────────────────────
function Results() {
  const [ref, visible] = useInView();
  const events = [
    { title: "Mt. Kenya Day Dash", date: "24th January 2026", available: true, participants: 5, distance: "Day Hike" },
  ];
  return (
    <section id="results" ref={ref} style={{ padding: "7rem 1.5rem", background: "#0d0d1a", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: "0%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ marginBottom: "3.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Achievements</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 7vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: "0.75rem" }}>Results & Certificates</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "1rem" }}>Download your certificates and view official event results.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          {[
            { icon: "⬆️", title: "Upload Results", desc: "Event organizers can upload official results and certificates. Participants will be able to download their certificates once uploaded.", btn: "Upload Official Results", filled: true },
            { icon: "⬇️", title: "Download Certificates", desc: "Search for and download your event certificates and view official results from completed events.", btn: "Search Your Certificate", filled: false },
          ].map((c, i) => (
            <div key={i} style={{ padding: "2.25rem", borderRadius: 16, background: "#111122", border: "1px solid rgba(255,255,255,0.07)", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transition: `all 0.7s ${i * 0.15}s` }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1.5rem", border: "1px solid rgba(201,168,76,0.15)" }}>{c.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "1rem", marginBottom: "0.75rem", letterSpacing: "0.02em" }}>{c.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: "1.75rem" }}>{c.desc}</p>
              <button style={{ width: "100%", padding: "0.9rem", background: c.filled ? "linear-gradient(135deg,#C9A84C,#b8962e)" : "transparent", color: c.filled ? "#0d0d1a" : "#C9A84C", border: c.filled ? "none" : "1.5px solid rgba(201,168,76,0.4)", borderRadius: 6, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", transition: "all 0.25s", letterSpacing: "0.06em" }}>
                {c.btn}
              </button>
            </div>
          ))}
        </div>

        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "#111122", marginBottom: "2rem" }}>
          <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.9rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recent Event Results</h3>
            <a href="/results" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.2rem", borderRadius: 4, border: "1px solid rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.06)", color: "#C9A84C", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", textDecoration: "none", transition: "all 0.25s", letterSpacing: "0.08em", textTransform: "uppercase" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.06)"; }}>
              View All Results <ArrowRight />
            </a>
          </div>
          {events.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2rem", flexWrap: "wrap", gap: "1rem", transition: "background 0.25s" }}
              onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 44, height: 44, background: "rgba(201,168,76,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0, border: "1px solid rgba(201,168,76,0.2)" }}>🏆</div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.92rem", marginBottom: "0.2rem" }}>{e.title}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>{e.date} · {e.participants} Participants · {e.distance}</div>
                  {e.available && <div style={{ fontFamily: "'Syne', sans-serif", color: "#4ade80", fontSize: "0.72rem", fontWeight: 700, marginTop: 4, letterSpacing: "0.06em" }}>✓ RESULTS AVAILABLE</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button style={{ padding: "0.5rem 1.1rem", border: "1px solid rgba(201,168,76,0.35)", background: "transparent", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#C9A84C", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.05em" }}>
                  View
                </button>
                <button style={{ padding: "0.5rem 1.1rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", border: "none", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#0d0d1a", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.05em" }}>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "1.5rem" }}>
          {[
            { icon: "🥇", title: "Event Medals", desc: "All finishers receive a unique medal commemorating their achievement, featuring ONE4ONE branding and event-specific details." },
            { icon: "📜", title: "Certificates", desc: "Digital and printable certificates available for all participants. Download yours from the results portal after the event." },
          ].map((c, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "2rem", border: "1px solid rgba(201,168,76,0.1)", transition: "all 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.1)"}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{c.icon}</div>
              <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.95rem", marginBottom: "0.6rem", letterSpacing: "0.02em" }}>{c.title}</h4>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", lineHeight: 1.7 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact() {
  const [ref, visible] = useInView();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = () => {
    if (form.name && form.email) {
      setSent(true);
      setTimeout(() => setSent(false), 3500);
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };
  const socialLinks = [
    { icon: <InstagramIcon size={17} />, url: "https://www.instagram.com/one4one_placeholder" },
    { icon: <FacebookIcon size={17} />, url: "https://www.facebook.com/one4one_placeholder" },
    { icon: <TwitterIcon size={17} />, url: "https://www.twitter.com/one4one_placeholder" },
    { icon: <LinkedInIcon size={17} />, url: "https://www.linkedin.com/company/one4one_placeholder" },
  ];

  return (
    <section id="contact" ref={ref} style={{ padding: "7rem 1.5rem", background: "#111122", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 60%, rgba(201,168,76,0.05) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Contact</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 7vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: "1.25rem" }}>Get In Touch</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: "2.5rem", fontSize: "0.95rem" }}>Questions about our events? Want to become a sponsor or partner? We'd love to hear from you.</p>
            {[
              { icon: "✉️", label: "Email", content: <a href="mailto:info@one4one.co" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C", fontSize: "0.88rem", textDecoration: "none" }}>info@one4one.co</a> },
              { icon: "📞", label: "Phone", content: <a href="tel:+254722943271" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C", fontSize: "0.88rem", textDecoration: "none" }}>+254 722 943 271</a> },
              { icon: "📍", label: "Location", content: <span style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.45)", fontSize: "0.88rem" }}>Nairobi, Kenya</span> },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "1.75rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, border: "1px solid rgba(201,168,76,0.15)" }}>{c.icon}</div>
                <div style={{ paddingTop: "0.1rem" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginBottom: "0.3rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{c.label}</div>
                  {c.content}
                </div>
              </div>
            ))}
            <div style={{ marginTop: "2rem", paddingTop: "1.75rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginBottom: "1rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Follow us</p>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all 0.25s", textDecoration: "none" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.color = "#C9A84C"; e.currentTarget.style.background = "rgba(201,168,76,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 20, padding: "2.25rem", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "1rem", marginBottom: "1.75rem", letterSpacing: "0.05em" }}>Send Us a Message</h3>
            {[
              { label: "Full Name", name: "name", placeholder: "John Doe", type: "text" },
              { label: "Email Address", name: "email", placeholder: "john@example.com", type: "email" },
              { label: "Subject", name: "subject", placeholder: "Event Inquiry", type: "text" },
            ].map(f => (
              <div key={f.name} style={{ marginBottom: "1rem" }}>
                <label style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{f.label}</label>
                <input type={f.type} name={f.name} value={form[f.name]} onChange={handle} placeholder={f.placeholder} style={{ width: "100%", padding: "0.82rem 1rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", outline: "none", transition: "border-color 0.2s", background: "rgba(255,255,255,0.04)", color: "#fff", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
            ))}
            <div style={{ marginBottom: "1.75rem" }}>
              <label style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Message</label>
              <textarea name="message" value={form.message} onChange={handle} placeholder="Tell us about your inquiry..." rows={4} style={{ width: "100%", padding: "0.82rem 1rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", outline: "none", resize: "vertical", transition: "border-color 0.2s", background: "rgba(255,255,255,0.04)", color: "#fff", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>
            <button onClick={submit} className="btn-primary" style={{ width: "100%", padding: "1rem", background: sent ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#C9A84C,#b8962e)", color: sent ? "#fff" : "#0d0d1a", border: "none", borderRadius: 8, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 4px 24px rgba(201,168,76,0.35)", transition: "all 0.3s", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {sent ? "✓ Message Sent!" : "Send Message"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const socialLinks = [
    { icon: <InstagramIcon size={15} />, url: "https://www.instagram.com/one4one_placeholder", label: "Instagram" },
    { icon: <FacebookIcon size={15} />, url: "https://www.facebook.com/one4one_placeholder", label: "Facebook" },
    { icon: <TwitterIcon size={15} />, url: "https://www.twitter.com/one4one_placeholder", label: "Twitter" },
    { icon: <LinkedInIcon size={15} />, url: "https://www.linkedin.com/company/one4one_placeholder", label: "LinkedIn" },
  ];
  const quickLinks = [
    { label: "About Us", href: "#about" }, { label: "Events", href: "#events" },
    { label: "Gallery", href: "#gallery" }, { label: "Results", href: "#results" },
  ];
  const eventLinks = [
    { label: "Upcoming Events", href: "#events" }, { label: "Past Events", href: "#events" },
    { label: "Register", href: "#contact" }, { label: "Download Certificate", href: "#results" },
  ];
  return (
    <footer style={{ background: "#080810", color: "#fff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "5rem 1.5rem 2rem" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2.5rem", marginBottom: "4rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                <img src="/media/logo.png" alt="ONE4ONE" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:0.85rem;color:#C9A84C">1·4·1</span>'; }} />
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff", letterSpacing: "0.05em" }}>ONE4ONE</span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", lineHeight: 1.8, maxWidth: 240, marginBottom: "1.25rem" }}>Organizing running, hiking, and tour events across Africa and beyond. Better Together.</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={{ width: 34, height: 34, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.25s", textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.color = "#C9A84C"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Quick Links", links: quickLinks },
            { title: "Events", links: eventLinks },
          ].map((col, ci) => (
            <div key={ci}>
              <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>{col.title}</h4>
              {col.links.map((l, j) => (
                <a key={j} href={l.href} style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.7rem", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#C9A84C"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}>{l.label}</a>
              ))}
            </div>
          ))}
          <div>
            <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Contact</h4>
            {[
              { href: "mailto:info@one4one.co", label: "info@one4one.co" },
              { href: "tel:+254722943271", label: "+254 722 943 271" },
            ].map((l, i) => (
              <a key={i} href={l.href} style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.7rem", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}>{l.label}</a>
            ))}
            <span style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>Nairobi, Kenya</span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>© 2026 ONE4ONE. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
              <span key={l} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.2)", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.2)"}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [imageModal, setImageModal] = useState(null);
  const [certModal, setCertModal] = useState(null);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <NoiseOverlay />
      <Navbar />
      <HeroSlideshow onImageClick={(src, alt) => setImageModal({ src, alt })} />
      <TickerBanner />
      <About />
      <WhatWeOrganize />
      <Events onImageClick={(src, alt) => setImageModal({ src, alt })} onCertClick={(cert) => setCertModal(cert)} />
      <Gallery onImageClick={(src, alt) => setImageModal({ src, alt })} />
      <Results />
      <Contact />
      <Footer />
      {imageModal && <ImageModal src={imageModal.src} alt={imageModal.alt} onClose={() => setImageModal(null)} />}
      {certModal && <CertificateModal cert={certModal} onClose={() => setCertModal(null)} />}
    </>
  );
}