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
  <div style={{ width: 200, height: 86, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
    <img
      src="/media/logo4.png"
      alt="ONE4ONE"
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
      onError={e => {
        e.target.style.display = "none";
        e.target.parentNode.innerHTML = '<span style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:1.1rem;color:#C9A84C;letter-spacing:0.05em">1·4·1</span>';
      }}
    />
  </div>
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

// ── Hero Slideshow (Dynamic — fetches events + photos from DB) ────────────────
// Builds slides from:
//   1. Upcoming events   → "Registration Open" slides
//   2. Past events       → "Completed" slides
//   3. Gallery photos    → "Highlights" slides (fills remaining slots, max 2)
// Falls back to hardcoded FALLBACK_SLIDES if API returns nothing.
// Everything else (layout, animations, stats, arrows, dots) is unchanged.
// ─────────────────────────────────────────────────────────────────────────────

// ── Hardcoded fallback (your original slides — used only if API is empty) ─────
const FALLBACK_SLIDES = [
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function heroFormatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function heroTitleCase(str = "") {
  // Break long event titles into two lines at a natural word boundary
  const words = str.trim().split(" ");
  if (words.length <= 2) return str;
  const mid = Math.ceil(words.length / 2);
  return words.slice(0, mid).join(" ") + "\n" + words.slice(mid).join(" ");
}

function heroSubtitle(event) {
  const parts = [];
  if (event.distance) parts.push(event.distance);
  if (event.location) parts.push(event.location);
  return parts.join(" · ") || "ONE4ONE Event";
}

// ── Build dynamic slides from API data ───────────────────────────────────────
function buildSlides(events, photos) {
  const now = new Date();
  const slides = [];

  const upcoming = events.filter(e => e.event_date && new Date(e.event_date) >= now);
  const past     = events.filter(e => !e.event_date || new Date(e.event_date) < now);

  // 1. Upcoming events
  upcoming.forEach(ev => {
    slides.push({
      type: "upcoming",
      label: "UPCOMING EVENT",
      title: heroTitleCase(ev.title),
      subtitle: heroSubtitle(ev),
      date: heroFormatDate(ev.event_date),
      tag: "Registration Open",
      tagColor: "#C9A84C",
      img: ev.cover_image || "",
      cta: { text: "Register Now", href: "#contact" },
      accentColor: "#C9A84C",
      overlayColor: "linear-gradient(135deg, rgba(13,13,26,0.75) 0%, rgba(13,13,26,0.3) 60%, rgba(201,168,76,0.1) 100%)",
    });
  });

  // 2. Past events (most recent first, max 2)
  past.slice(0, 2).forEach(ev => {
    slides.push({
      type: "past",
      label: `PAST EVENT · ${heroFormatDate(ev.event_date)}`,
      title: heroTitleCase(ev.title),
      subtitle: heroSubtitle(ev),
      date: heroFormatDate(ev.event_date),
      tag: "Completed",
      tagColor: "#22c55e",
      img: ev.cover_image || "",
      cta: { text: "View Gallery", href: "#gallery" },
      accentColor: "#4ade80",
      overlayColor: "linear-gradient(135deg, rgba(13,13,26,0.8) 0%, rgba(13,13,26,0.35) 60%, rgba(74,222,128,0.08) 100%)",
    });
  });

  // 3. Fill remaining slots with gallery highlight photos (max 2)
  const photoSlots = Math.max(0, 4 - slides.length);
  // Pick photos from different events for variety
  const picked = [];
  const seen = new Set();
  for (const p of photos) {
    if (picked.length >= photoSlots) break;
    if (!seen.has(p.event_id)) {
      seen.add(p.event_id);
      picked.push(p);
    }
  }

  const highlightColors = ["#a78bfa", "#60a5fa", "#f472b6"];
  picked.forEach((photo, i) => {
    const color = highlightColors[i % highlightColors.length];
    slides.push({
      type: "highlight",
      label: "HIGHLIGHTS",
      title: heroTitleCase(photo.event_title || "ONE4ONE"),
      subtitle: photo.event_location ? `${photo.event_title} · ${photo.event_location}` : (photo.event_title || "ONE4ONE"),
      date: photo.event_date ? heroFormatDate(photo.event_date) : "",
      tag: "Gallery",
      tagColor: color,
      img: photo.storage_path || "",
      cta: { text: "See All Photos", href: "#gallery" },
      accentColor: color,
      overlayColor: `linear-gradient(135deg, rgba(13,13,26,0.82) 0%, rgba(13,13,26,0.25) 70%, ${color}14 100%)`,
    });
  });

  return slides.length > 0 ? slides : null; // null → use fallback
}

// ── Fetch hero data (events + a handful of photos) ────────────────────────────
async function fetchHeroData() {
  // Events
  const evRes = await fetch(`${BASE_URL}/api/events?page=1&limit=50`);
  if (!evRes.ok) throw new Error(`Events fetch failed: ${evRes.status}`);
  const evJson = await evRes.json();
  const events = evJson.status === "success" ? (evJson.data.events || []) : [];

  // Photos — fetch from all events in parallel, take newest first
  const mediaResults = await Promise.allSettled(
    events.map(ev =>
      fetch(`${BASE_URL}/api/events/${ev.id}/media?page=1&limit=20`)
        .then(r => r.json())
        .then(j => ({
          event: ev,
          files: j.status === "success" ? j.data.media_files || [] : [],
        }))
    )
  );

  let photos = [];
  mediaResults.forEach(result => {
    if (result.status === "fulfilled") {
      const { event, files } = result.value;
      files
        .filter(f => f.file_type === "photo" && f.storage_path)
        .forEach(f => photos.push({
          ...f,
          event_id: event.id,
          event_title: event.title,
          event_date: event.event_date,
          event_location: event.location,
        }));
    }
  });
  photos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return { events, photos };
}

// ── Component ─────────────────────────────────────────────────────────────────
function HeroSlideshow({ onImageClick }) {
  const [slides, setSlides]           = useState(FALLBACK_SLIDES);
  const [heroReady, setHeroReady]     = useState(false); // true once API resolves
  const [current, setCurrent]         = useState(0);
  const [prev, setPrev]               = useState(null);
  const [loaded, setLoaded]           = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef                   = useRef(null);

  // ── Load from API ──
  useEffect(() => {
    let cancelled = false;
    setTimeout(() => { if (!cancelled) setLoaded(true); }, 200);

    (async () => {
      try {
        const { events, photos } = await fetchHeroData();
        const dynamic = buildSlides(events, photos);
        if (!cancelled && dynamic) {
          setSlides(dynamic);
          setCurrent(0);
          setPrev(null);
        }
      } catch {
        // silently keep fallback slides
      } finally {
        if (!cancelled) setHeroReady(true);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const goTo = useCallback((idx, dir = 1) => {
    if (isTransitioning || idx === current || slides.length <= 1) return;
    setIsTransitioning(true);
    setPrev(current);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setIsTransitioning(false); }, 900);
  }, [current, isTransitioning, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(() => {
      goTo((current + 1) % slides.length, 1);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [current, goTo, slides.length]);

  const slide = slides[current] || FALLBACK_SLIDES[0];

  const [ref, statsVisible] = useInView(0.1);
  const stats = [
    { value: "2",   suffix: "+", label: "Events"   },
    { value: "100", suffix: "+", label: "Athletes"  },
    { value: "3",   suffix: "",  label: "Countries" },
  ];
  const c1 = useCounter(stats[0].value, statsVisible);
  const c2 = useCounter(stats[1].value, statsVisible);
  const c3 = useCounter(stats[2].value, statsVisible);
  const counters = [c1, c2, c3];

  return (
    <section id="home" style={{ position: "relative", height: "100vh", minHeight: 640, overflow: "hidden", background: "#0d0d1a" }}>

      {/* ── All slides stacked ── */}
      {slides.map((s, i) => (
        <div key={`${i}-${s.img}`} style={{
          position: "absolute", inset: 0,
          opacity: i === current ? 1 : 0,
          transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1)",
          zIndex: i === current ? 2 : (i === prev ? 1 : 0),
        }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            {s.img ? (
              <img
                src={s.img}
                alt={s.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", transformOrigin: "center", animation: i === current ? "heroKenBurns 7s ease-out forwards" : "none" }}
                onError={ev => {
                  ev.target.style.display = "none";
                  ev.target.parentNode.style.background = "linear-gradient(135deg, #1a1a2e, #0d0d1a)";
                }}
              />
            ) : (
              // No cover image — show a gradient placeholder
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)" }} />
            )}
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

      {/* ── Content ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 2rem 5rem 3rem", maxWidth: 1320, margin: "0 auto", left: 0, right: 0 }}>

        {/* Label + tag */}
        <div key={`label-${current}`} style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", animation: loaded ? "slideInLeft 0.7s 0.1s both cubic-bezier(0.16,1,0.3,1)" : "none" }}>
          <div style={{ width: 32, height: 1, background: slide.accentColor }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", fontWeight: 700, color: slide.accentColor, letterSpacing: "0.18em", textTransform: "uppercase" }}>{slide.label}</span>
          <span style={{ padding: "0.2rem 0.75rem", borderRadius: 2, background: slide.tagColor, color: "#0d0d1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{slide.tag}</span>
        </div>

        {/* Title */}
        <h1 key={`title-${current}`} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(3.5rem, 10vw, 7rem)", fontWeight: 700, color: "#fff", lineHeight: 1.0, marginBottom: "1.25rem", letterSpacing: "-0.02em", whiteSpace: "pre-line", animation: loaded ? "fadeUp 0.8s 0.2s both cubic-bezier(0.16,1,0.3,1)" : "none", textShadow: "0 4px 40px rgba(0,0,0,0.5)" }}>
          {slide.title}
        </h1>

        {/* Subtitle + date */}
        <div key={`sub-${current}`} style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem", animation: loaded ? "fadeUp 0.8s 0.35s both cubic-bezier(0.16,1,0.3,1)" : "none", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.65)", fontWeight: 300 }}>{slide.subtitle}</span>
          {slide.date && (
            <>
              <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)" }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.8rem", color: slide.accentColor, letterSpacing: "0.08em" }}>{slide.date}</span>
            </>
          )}
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

      {/* ── Slide nav dots ── */}
      <div style={{ position: "absolute", right: "2rem", top: "50%", transform: "translateY(-50%)", zIndex: 6, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i, i > current ? 1 : -1)} style={{ display: "block", width: i === current ? 3 : 2, height: i === current ? 32 : 16, borderRadius: 4, background: i === current ? "#C9A84C" : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", padding: 0 }} />
        ))}
      </div>

      {/* ── Prev / Next arrows ── */}
      <button onClick={() => goTo((current - 1 + slides.length) % slides.length, -1)} style={{ position: "absolute", bottom: "8rem", right: "5rem", zIndex: 6, width: 48, height: 48, borderRadius: 4, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 0.25s" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.25)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}>
        <ChevronLeft />
      </button>
      <button onClick={() => goTo((current + 1) % slides.length, 1)} style={{ position: "absolute", bottom: "8rem", right: "2rem", zIndex: 6, width: 48, height: 48, borderRadius: 4, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", transition: "all 0.25s" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.25)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}>
        <ChevronRight />
      </button>

      {/* ── Progress bar ── */}
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

// ── Events Section (Drop-in replacement for your homepage Events component)
// Fetches live events from the same API as the results page,
// splits them into upcoming / past by date, and renders everything
// in the same luxury dark aesthetic used across the site.
// ─────────────────────────────────────────────────────────────────────────────

// ── Config (same as results page) ────────────────────────────────────────────
const BASE_URL = "http://75.119.159.17:9002";

// ── API helper (mirrors results page) ────────────────────────────────────────
async function fetchEvents(page = 1, limit = 50) {
  const res = await fetch(`${BASE_URL}/api/events?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`);
  const json = await res.json();
  if (json.status !== "success") throw new Error(json.message || "Failed to load events");
  return json.data.events || [];
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function formatEventDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function isPast(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ── Icons (self-contained — no external deps) ─────────────────────────────────
const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", background: "#111122" }}>
      <div style={{ aspectRatio: "16/9", background: "linear-gradient(90deg,#1a1a2e 25%,#22223a 50%,#1a1a2e 75%)", backgroundSize: "400px 100%", animation: "skeletonShimmer 1.4s ease infinite" }} />
      <div style={{ padding: "1.5rem" }}>
        {[90, 60, 75].map((w, i) => (
          <div key={i} style={{ height: i === 0 ? 22 : 14, width: `${w}%`, borderRadius: 6, marginBottom: "0.75rem", background: "linear-gradient(90deg,#1a1a2e 25%,#22223a 50%,#1a1a2e 75%)", backgroundSize: "400px 100%", animation: "skeletonShimmer 1.4s ease infinite" }} />
        ))}
      </div>
    </div>
  );
}

// ── Upcoming event card ───────────────────────────────────────────────────────
function UpcomingCard({ event, index, visible, onImageClick }) {
  const [hovered, setHovered] = useState(false);

  // Derive participant/capacity label from event fields
  const participantLabel =
    event.max_participants
      ? `${event.max_participants} Spots`
      : event.participants_count
      ? `${event.participants_count} Registered`
      : null;

  const meta = [
    event.event_date  && { icon: <CalIcon />,   text: formatEventDate(event.event_date) },
    event.location    && { icon: <PinIcon />,   text: event.location },
    participantLabel  && { icon: <UsersIcon />, text: participantLabel },
    event.distance    && { icon: null,           text: `🏃 ${event.distance}` },
  ].filter(Boolean);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${hovered ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.15)"}`,
        background: "#111122",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(30px)",
        transitionDelay: `${index * 0.12}s`,
        boxShadow: hovered ? "0 20px 60px rgba(201,168,76,0.12)" : "0 8px 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* Image */}
      <div
        style={{ position: "relative", aspectRatio: "16/9", background: "#1a1a2e", overflow: "hidden", cursor: event.cover_image ? "zoom-in" : "default" }}
        onClick={() => event.cover_image && onImageClick(event.cover_image, event.title)}
      >
        {event.cover_image ? (
          <img
            src={event.cover_image}
            alt={event.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease", transform: hovered ? "scale(1.06)" : "scale(1)" }}
            onError={ev => {
              ev.target.style.display = "none";
              ev.target.parentNode.style.background = "linear-gradient(135deg,#1e1e3a,#0d0d1a)";
              ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:5rem;opacity:0.2">🏃</div>`;
            }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem", opacity: 0.15 }}>🏃</div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.7) 0%, transparent 55%)" }} />

        {/* Status badge */}
        <div style={{ position: "absolute", top: 14, left: 14, background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", padding: "0.28rem 0.85rem", borderRadius: 3, fontSize: "0.68rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Registration Open
        </div>

        {/* Date chip */}
        {event.event_date && (
          <div style={{ position: "absolute", bottom: 14, left: 14, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 6, padding: "0.35rem 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "#C9A84C", fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em" }}>
            <CalIcon /> {formatEventDate(event.event_date)}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "1.6rem 1.75rem 1.75rem" }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", marginBottom: "0.4rem", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
          {event.title}
        </h3>

        {event.description && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.83rem", lineHeight: 1.7, marginBottom: "1.1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {event.description}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "1.5rem" }}>
          {meta.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>
              {m.icon && <span style={{ color: "#C9A84C", flexShrink: 0 }}>{m.icon}</span>}
              {m.text}
            </div>
          ))}
        </div>

        <a href="#contact" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", padding: "0.85rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 6, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "0 4px 20px rgba(201,168,76,0.3)", transition: "all 0.3s" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,168,76,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,168,76,0.3)"; e.currentTarget.style.transform = "none"; }}>
          Register Now <ArrowRightIcon />
        </a>
      </div>
    </div>
  );
}

// ── Past event card ───────────────────────────────────────────────────────────
function PastEventCard({ event, index, visible, onImageClick, onCertClick }) {
  const [expanded, setExpanded] = useState(false);
  const [photoHovered, setPhotoHovered] = useState(null);

  // Try to get photo gallery from event data (media_files or photos array)
  const photos = event.photos || event.media_files || [];

  // Certificates embedded in event data (static fallback)
  const certificates = event.certificates || [];

  const meta = [
    event.event_date && { icon: <CalIcon />,   text: formatEventDate(event.event_date) },
    event.location   && { icon: <PinIcon />,   text: event.location },
    event.participants_count && { icon: <UsersIcon />, text: `${event.participants_count} Participants` },
  ].filter(Boolean);

  return (
    <div style={{
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.07)",
      background: "#111122",
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(30px)",
      transition: "all 0.7s",
      transitionDelay: `${index * 0.1}s`,
      marginBottom: "1.5rem",
    }}>
      {/* Card header row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem 2rem", cursor: "pointer", transition: "background 0.2s", flexWrap: "wrap" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.03)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {/* Thumbnail */}
        <div style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)", background: "#1a1a2e" }}>
          {event.cover_image ? (
            <img src={event.cover_image} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem">🏆</div>`; }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🏆</div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "#fff", fontSize: "1.4rem", letterSpacing: "-0.01em" }}>{event.title}</h3>
            <span style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)", padding: "0.15rem 0.65rem", borderRadius: 3, fontSize: "0.63rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
              Completed
            </span>
          </div>

          {event.description && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", lineHeight: 1.6, marginBottom: "0.5rem", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {event.description}
            </p>
          )}

          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            {meta.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.38)" }}>
                <span style={{ color: "#C9A84C" }}>{m.icon}</span> {m.text}
              </div>
            ))}
          </div>
        </div>

        {/* Expand chevron */}
        <div style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)", transition: "all 0.3s", transform: expanded ? "rotate(180deg)" : "none", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>

      {/* Expandable body */}
      <div style={{ maxHeight: expanded ? 2000 : 0, overflow: "hidden", transition: "max-height 0.55s cubic-bezier(0.16,1,0.3,1)", borderTop: expanded ? "1px solid rgba(255,255,255,0.06)" : "none" }}>

        {/* Cover image (large) */}
        {event.cover_image && (
          <div
            onClick={() => onImageClick(event.cover_image, event.title)}
            style={{ position: "relative", height: 260, overflow: "hidden", cursor: "zoom-in" }}
          >
            <img src={event.cover_image} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={ev => { ev.target.style.display = "none"; }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,34,0.9) 0%, rgba(0,0,0,0.15) 60%)" }} />
            <div style={{ position: "absolute", bottom: 20, left: 24 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{event.title}</div>
              {event.event_date && <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C", fontSize: "0.8rem" }}>{formatEventDate(event.event_date)}</div>}
            </div>
          </div>
        )}

        {/* Photo grid — only shown if event has photo array */}
        {photos.length > 0 && (
          <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📸</span> Event Photos
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.65rem" }}>
              {photos.map((photo, i) => (
                <div
                  key={i}
                  style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", background: `hsl(${i * 40 + 200},22%,12%)`, cursor: "zoom-in" }}
                  onMouseEnter={() => setPhotoHovered(i)}
                  onMouseLeave={() => setPhotoHovered(null)}
                  onClick={() => onImageClick(photo.src || photo.storage_path, photo.caption || "")}
                >
                  <img src={photo.src || photo.storage_path} alt={photo.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.45s ease", transform: photoHovered === i ? "scale(1.07)" : "scale(1)" }}
                    onError={ev => { ev.target.style.display = "none"; }} />
                  {photo.caption && photoHovered === i && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.75)", padding: "0.4rem 0.6rem" }}>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.65rem", color: "#fff" }}>{photo.caption}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates — shown if event has certificates array (static) */}
        {certificates.length > 0 && (
          <div style={{ padding: "1.5rem 2rem" }}>
            <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📜</span> Participation Certificates
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
              {certificates.map((cert, i) => (
                <div
                  key={i}
                  onClick={() => onCertClick(cert)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "0.9rem 1.1rem", border: "1px solid rgba(201,168,76,0.12)", transition: "all 0.3s", cursor: "pointer", gap: "0.65rem" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(201,168,76,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0, border: "1px solid rgba(201,168,76,0.18)" }}>🏅</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cert.name}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", marginTop: 2 }}>{event.title} · {event.event_date ? new Date(event.event_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", color: "#C9A84C", fontSize: "0.65rem", marginTop: 3, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Preview →</div>
                    </div>
                  </div>
                  <a
                    href={cert.file}
                    download target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.42rem 0.85rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.05em" }}
                  >
                    ⬇ Save
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View full results CTA */}
        <div style={{ padding: "1.25rem 2rem 1.75rem", borderTop: certificates.length > 0 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", justifyContent: "flex-end" }}>
          <a
            href="/results"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.3rem", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 6, color: "#C9A84C", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.74rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            View Full Results &amp; Certificates <ArrowRightIcon />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ type }) {
  return (
    <div style={{ borderRadius: 20, border: "1px dashed rgba(255,255,255,0.08)", padding: "3rem 2rem", textAlign: "center", background: "rgba(255,255,255,0.015)" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", opacity: 0.5 }}>{type === "upcoming" ? "🔔" : "📭"}</div>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "rgba(255,255,255,0.4)", fontSize: "1.3rem", marginBottom: "0.4rem" }}>
        {type === "upcoming" ? "No Upcoming Events Yet" : "No Past Events"}
      </h3>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.2)", fontSize: "0.82rem" }}>
        {type === "upcoming" ? "New events will appear here as soon as they're announced." : "Completed events will be archived here."}
      </p>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ eyebrow, heading, visible, delay = 0 }) {
  return (
    <div style={{ marginBottom: "2.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: `all 0.7s ${delay}s` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>{eyebrow}</span>
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 6vw, 3.75rem)", fontWeight: 700, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em" }}>{heading}</h2>
    </div>
  );
}

// ── MAIN COMPONENT (drop this in place of your current Events function) ───────
function Events({ onImageClick, onCertClick }) {
  const [ref, visible] = useInView();

  // ── Live event data ──
  const [allEvents, setAllEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // ── Static past-event data preserved from your original homepage ──
  // (Mt. Kenya Day Dash with its photos & certificates, shown until the API
  //  returns an event with the same name / a matching id)
  const STATIC_MTKD = {
    _static: true,
    id: "__mtkd_static__",
    title: "Mt. Kenya Day Dash",
    description: "Naromoru Route · A breathtaking climb to Point Lenana guided by Peter Waihenya & Elijah Kabugi.",
    event_date: "2026-01-24T00:00:00.000Z",
    location: "Mt. Kenya, Naromoru",
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
      { name: "Meek",        file: "/certificates/Meek.pdf"   },
      { name: "Timothy",     file: "/certificates/Timothy.pdf" },
      { name: "Wambui",      file: "/certificates/Wambui.pdf"  },
      { name: "Peter",       file: "/certificates/Peter.pdf"   },
    ],
    cover_image: "/media/events/mtkd - 6.png",
  };

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    setEventsError(null);
    try {
      const events = await fetchEvents();
      setAllEvents(events);
    } catch (err) {
      setEventsError(err.message || "Failed to load events");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // ── Split & merge ──
  const now = new Date();

  // De-duplicate: if API already returns Mt. Kenya Day Dash, don't show static copy
  const apiTitles = allEvents.map(e => (e.title || "").toLowerCase());
  const showStaticMTKD = !apiTitles.some(t => t.includes("kenya") && t.includes("dash"));

  const upcoming = allEvents.filter(e => e.event_date && new Date(e.event_date) >= now);
  const pastFromAPI = allEvents.filter(e => !e.event_date || new Date(e.event_date) < now);

  // Static event is always past
  const pastEvents = showStaticMTKD
    ? [STATIC_MTKD, ...pastFromAPI]
    : pastFromAPI;

  return (
    <section
      id="events"
      ref={ref}
      style={{ padding: "7rem 1.5rem", background: "#0d0d1a", position: "relative", overflow: "hidden" }}
    >
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "-8%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* ───── UPCOMING ───── */}
        <div style={{ marginBottom: "6rem" }}>
          <SectionLabel eyebrow="Next Up" heading="Upcoming Events" visible={visible} />

          {loadingEvents ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : eventsError ? (
            <div style={{ borderRadius: 16, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.05)", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fca5a5", marginBottom: "0.3rem", fontSize: "0.88rem" }}>⚠️ Couldn't load events</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>{eventsError}</div>
              </div>
              <button onClick={loadEvents} style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.6rem 1.25rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.6)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.74rem", cursor: "pointer", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                <RefreshIcon /> Retry
              </button>
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState type="upcoming" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
              {upcoming.map((event, i) => (
                <UpcomingCard key={event.id} event={event} index={i} visible={visible} onImageClick={onImageClick} />
              ))}
            </div>
          )}
        </div>

        {/* ───── PAST ───── */}
        <div>
          <SectionLabel eyebrow="History" heading="Past Events" visible={visible} delay={0.1} />

          {loadingEvents ? (
            <>
              <SkeletonCard />
              <div style={{ marginTop: "1.25rem" }}><SkeletonCard /></div>
            </>
          ) : pastEvents.length === 0 ? (
            <EmptyState type="past" />
          ) : (
            pastEvents.map((event, i) => (
              <PastEventCard
                key={event.id}
                event={event}
                index={i}
                visible={visible}
                onImageClick={onImageClick}
                onCertClick={onCertClick}
              />
            ))
          )}
        </div>

      </div>
    </section>
  );
}

// ── Gallery (Homepage Section — drop-in replacement) ─────────────────────────
// Fetches live photos from the DB using the same API pattern as the gallery page.
// Displays them as an immersive cinematic slideshow with a film-strip thumbnail
// row at the bottom. The filter buttons, social links, and "View Full Gallery"
// CTA are all preserved exactly as before.
// ─────────────────────────────────────────────────────────────────────────────



// ── API helpers (mirrors gallery page exactly) ────────────────────────────────
// ── Gallery (Homepage Section — replace your existing Gallery function) ────────
// Changes from previous version:
//   1. scrollIntoView replaced with manual scrollLeft on the thumb container
//      (no more page-level scrolling when slide advances)
//   2. Slides now crossfade in random order with Ken Burns zoom — matching the
//      hero section style rather than a linear sequential slideshow
// Everything else (filters, social links, "View Full Gallery" CTA) is unchanged.
// ─────────────────────────────────────────────────────────────────────────────

async function fetchAllGalleryMedia() {
  const evRes = await fetch(`${BASE_URL}/api/events?page=1&limit=50`);
  if (!evRes.ok) throw new Error(`Events fetch failed: ${evRes.status}`);
  const evJson = await evRes.json();
  if (evJson.status !== "success") throw new Error(evJson.message || "Failed to load events");
  const eventList = evJson.data.events || [];

  const mediaResults = await Promise.allSettled(
    eventList.map(ev =>
      fetch(`${BASE_URL}/api/events/${ev.id}/media?page=1&limit=100`)
        .then(r => r.json())
        .then(j => ({
          event: ev,
          files: j.status === "success" ? j.data.media_files || [] : [],
        }))
    )
  );

  let combined = [];
  mediaResults.forEach(result => {
    if (result.status === "fulfilled") {
      const { event, files } = result.value;
      files.forEach(f => {
        combined.push({
          ...f,
          event_id: event.id,
          event_title: event.title,
          event_date: event.event_date,
          event_location: event.location,
        });
      });
    }
  });

  return combined
    .filter(f => f.file_type === "photo" && f.storage_path)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function guessLabel(eventTitle = "") {
  const t = eventTitle.toLowerCase();
  if (t.includes("run") || t.includes("loop") || t.includes("marathon") || t.includes("5k") || t.includes("10k")) return "Running";
  if (t.includes("hik") || t.includes("trek") || t.includes("mountain") || t.includes("kenya") || t.includes("dash")) return "Hiking";
  if (t.includes("tour") || t.includes("trip") || t.includes("travel")) return "Tour";
  return "Event";
}

function Gallery({ onImageClick }) {
  const [ref, visible] = useInView();

  // ── Data ──
  const [allPhotos, setAllPhotos]     = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [mediaError, setMediaError]   = useState(null);

  // ── Slide state ──
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex]     = useState(null);
  const [paused, setPaused]           = useState(false);
  const intervalRef                   = useRef(null);

  // ── Thumb strip ref (DOM node, NOT useState — avoids re-renders) ──
  const thumbsContainerRef = useRef(null);

  // ── Filter ──
  const [filter, setFilter] = useState("All");

  // ── Social links ──
  const socialLinks = [
    { icon: <InstagramIcon size={16} />, name: "Instagram", url: "https://www.instagram.com/one4one_placeholder" },
    { icon: <FacebookIcon  size={16} />, name: "Facebook",  url: "https://www.facebook.com/one4one_placeholder" },
    { icon: <TwitterIcon   size={16} />, name: "Twitter",   url: "https://www.twitter.com/one4one_placeholder" },
  ];

  // ── Fetch once ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingMedia(true);
      setMediaError(null);
      try {
        const photos = await fetchAllGalleryMedia();
        if (!cancelled) setAllPhotos(photos);
      } catch (err) {
        if (!cancelled) setMediaError(err.message || "Failed to load photos");
      } finally {
        if (!cancelled) setLoadingMedia(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Derived filtered list ──
  const filters  = ["All", ...Array.from(new Set(allPhotos.map(p => guessLabel(p.event_title))))];
  const filtered = filter === "All" ? allPhotos : allPhotos.filter(p => guessLabel(p.event_title) === filter);

  // Reset on filter / data change
  useEffect(() => {
    setActiveIndex(0);
    setPrevIndex(null);
  }, [filter, allPhotos.length]);

  // ── Pick a RANDOM next index (hero-style) ──
  const advanceRandom = useCallback(() => {
    if (filtered.length <= 1) return;
    setActiveIndex(prev => {
      // pick any index that isn't the current one
      let next;
      do { next = Math.floor(Math.random() * filtered.length); } while (next === prev);
      setPrevIndex(prev);
      return next;
    });
  }, [filtered.length]);

  // ── Auto-advance ──
  useEffect(() => {
    if (paused || filtered.length <= 1) return;
    intervalRef.current = setInterval(advanceRandom, 5000);
    return () => clearInterval(intervalRef.current);
  }, [paused, filtered.length, filter, advanceRandom]);

  // ── Scroll thumb into view WITHOUT touching page scroll ──
  useEffect(() => {
    const container = thumbsContainerRef.current;
    if (!container) return;
    const thumb = container.querySelector(`[data-thumb="${activeIndex}"]`);
    if (!thumb) return;
    // Manual calculation — scrolls only the thumb strip, never the page
    const containerLeft  = container.getBoundingClientRect().left;
    const thumbLeft      = thumb.getBoundingClientRect().left;
    const offset         = thumbLeft - containerLeft - container.clientWidth / 2 + thumb.clientWidth / 2;
    container.scrollLeft += offset;
  }, [activeIndex]);

  // ── Manual nav ──
  const goTo = (idx) => {
    clearInterval(intervalRef.current);
    setPrevIndex(activeIndex);
    setActiveIndex(idx);
  };

  const prev = () => goTo((activeIndex - 1 + filtered.length) % filtered.length);
  const next = () => goTo((activeIndex + 1) % filtered.length);

  const activePhoto = filtered[activeIndex] || null;

  // Ken Burns directions — cycle through for variety
  const KB_VARIANTS = [
    { transformStart: "scale(1.08) translate(0%,    0%)",    transformEnd: "scale(1.18) translate(-2%, -1%)" },
    { transformStart: "scale(1.06) translate(1%,    1%)",    transformEnd: "scale(1.15) translate(-1%, -2%)" },
    { transformStart: "scale(1.1)  translate(-1.5%, 0%)",    transformEnd: "scale(1.2)  translate(1%,   1%)" },
    { transformStart: "scale(1.07) translate(0%,   -1%)",    transformEnd: "scale(1.16) translate(2%,   0%)" },
  ];

  const SkeletonSlideshow = () => (
    <div style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "16/8", background: "linear-gradient(90deg,#1a1a2e 25%,#22223a 50%,#1a1a2e 75%)", backgroundSize: "400px 100%", animation: "skeletonShimmer 1.4s ease infinite" }} />
  );

  return (
    <section
      id="gallery"
      ref={ref}
      style={{ padding: "7rem 1.5rem", background: "#111122", position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* ── Header row ── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Visual Diary</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 7vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Event Gallery</h2>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "0.5rem 1.1rem", borderRadius: 4, border: "1px solid", borderColor: filter === f ? "#C9A84C" : "rgba(255,255,255,0.12)", background: filter === f ? "rgba(201,168,76,0.12)" : "transparent", color: filter === f ? "#C9A84C" : "rgba(255,255,255,0.45)", fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", transition: "all 0.25s", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main display ── */}
        {loadingMedia ? (
          <SkeletonSlideshow />
        ) : mediaError ? (
          <div style={{ borderRadius: 16, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.04)", padding: "2.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⚠️</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>{mediaError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ borderRadius: 16, border: "1px dashed rgba(255,255,255,0.08)", padding: "4rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem", opacity: 0.4 }}>📷</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>No photos yet for this filter.</p>
          </div>
        ) : (
          <div
            style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.8s 0.15s" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* ── Hero-style crossfade stage ── */}
            <div
              style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "16/8", background: "#080812", cursor: "zoom-in", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.1)" }}
              onClick={() => activePhoto && onImageClick(activePhoto.storage_path, activePhoto.event_title)}
            >
              {/* All slides stacked — each fades in/out independently (hero pattern) */}
              {filtered.map((photo, i) => {
                const kb = KB_VARIANTS[i % KB_VARIANTS.length];
                const isActive = i === activeIndex;
                return (
                  <div
                    key={photo.id}
                    style={{
                      position: "absolute", inset: 0,
                      opacity: isActive ? 1 : 0,
                      transition: "opacity 1.1s cubic-bezier(0.16,1,0.3,1)",
                      zIndex: isActive ? 2 : 1,
                    }}
                  >
                    <img
                      src={photo.storage_path}
                      alt={photo.event_title}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        // Ken Burns: active slide animates, inactive stays at end position
                        animation: isActive ? `heroKenBurns 8s ease-out forwards` : "none",
                        transform: isActive ? kb.transformStart : kb.transformEnd,
                      }}
                      onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${i * 40 + 200},22%,10%)`; }}
                    />
                  </div>
                );
              })}

              {/* Cinematic gradient overlays — identical to hero section */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(13,13,26,0.6) 0%, rgba(13,13,26,0.2) 60%, transparent 100%)", zIndex: 3, pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(8,8,18,0.95) 0%, rgba(8,8,18,0.35) 60%, transparent 100%)", zIndex: 3, pointerEvents: "none" }} />
              {/* Left accent line (mirrors hero) */}
              <div style={{ position: "absolute", left: "1.5rem", top: "15%", bottom: "15%", width: 1, background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.4), transparent)", zIndex: 4, pointerEvents: "none" }} />

              {/* Slide counter */}
              <div style={{ position: "absolute", top: 20, right: 24, zIndex: 5, display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "0.35rem 0.85rem" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 700, color: "#C9A84C" }}>{activeIndex + 1}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>/ {filtered.length}</span>
              </div>

              {/* Activity label chip */}
              {activePhoto && (
                <div style={{ position: "absolute", top: 20, left: 24, zIndex: 5 }}>
                  <span style={{ background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", padding: "0.28rem 0.85rem", borderRadius: 3, fontSize: "0.68rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {guessLabel(activePhoto.event_title)}
                  </span>
                </div>
              )}

              {/* Caption — hero-style bottom-left */}
              {activePhoto && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2rem 2rem 1.75rem 3rem", zIndex: 5 }}>
                  {/* Slide label eyebrow */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
                    <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                      {guessLabel(activePhoto.event_title)}
                    </span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(1.4rem, 3vw, 2.2rem)", color: "#fff", lineHeight: 1.1, marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>
                    {activePhoto.event_title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                    {activePhoto.event_location && (
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                        📍 {activePhoto.event_location}
                      </span>
                    )}
                    {activePhoto.event_date && (
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
                        {new Date(activePhoto.event_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Prev / next arrows */}
              {filtered.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); prev(); }}
                    style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", zIndex: 6, width: 46, height: 46, borderRadius: "50%", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.25)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={e => { e.stopPropagation(); next(); }}
                    style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", zIndex: 6, width: 46, height: 46, borderRadius: "50%", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.25)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </>
              )}

              {/* Vertical dot nav (mirrors hero) */}
              {filtered.length > 1 && filtered.length <= 12 && (
                <div style={{ position: "absolute", right: "1.25rem", top: "50%", transform: "translateY(-50%)", zIndex: 6, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {filtered.map((_, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); goTo(i); }}
                      style={{ display: "block", width: i === activeIndex ? 3 : 2, height: i === activeIndex ? 28 : 12, borderRadius: 4, background: i === activeIndex ? "#C9A84C" : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", padding: 0 }} />
                  ))}
                </div>
              )}

              {/* Paused indicator */}
              {paused && filtered.length > 1 && (
                <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 6, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "0.25rem 0.75rem" }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>⏸ Paused</span>
                </div>
              )}

              {/* Progress bar */}
              {filtered.length > 1 && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.08)", zIndex: 7 }}>
                  <div key={activeIndex} style={{ height: "100%", background: "linear-gradient(90deg,#C9A84C,#e8c96a)", animation: "lineExpand 5s linear forwards", width: "0%" }} />
                </div>
              )}
            </div>

            {/* ── Thumbnail strip — scrolled via scrollLeft, NOT scrollIntoView ── */}
            {filtered.length > 1 && (
              <div
                ref={thumbsContainerRef}
                style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", overflowX: "auto", paddingBottom: "0.25rem", scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "smooth" }}
              >
                {filtered.map((photo, i) => (
                  <div
                    key={photo.id}
                    data-thumb={i}
                    onClick={() => goTo(i)}
                    style={{ flexShrink: 0, width: 80, height: 52, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: `2px solid ${i === activeIndex ? "#C9A84C" : "rgba(255,255,255,0.07)"}`, opacity: i === activeIndex ? 1 : 0.4, transition: "all 0.35s", transform: i === activeIndex ? "scale(1.06)" : "scale(1)", boxShadow: i === activeIndex ? "0 0 16px rgba(201,168,76,0.35)" : "none" }}
                  >
                    <img src={photo.storage_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${i * 40 + 200},22%,12%)`; }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Footer row (unchanged) ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: "1.5rem", opacity: visible ? 1 : 0, transition: "all 0.7s 0.4s" }}>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>Follow us:</span>
            {socialLinks.map(({ icon, name, url }) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all 0.25s", textDecoration: "none", letterSpacing: "0.05em" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.color = "#C9A84C"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                {icon} {name}
              </a>
            ))}
          </div>

          <a href="/gallery"
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1.75rem", borderRadius: 4, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.06)", color: "#C9A84C", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none", transition: "all 0.3s", letterSpacing: "0.08em", textTransform: "uppercase" }}
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

  return (
    <section id="results" ref={ref} style={{ padding: "7rem 1.5rem", background: "#0d0d1a", position: "relative", overflow: "hidden" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", bottom: "0%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "10%", left: "-8%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "3.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Achievements</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 7vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: "0.75rem" }}>
            Results &amp; Certificates
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "1rem" }}>
            Download your certificates and view official event results.
          </p>
        </div>

        {/* ── Two action cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          {[
            {
              icon: "⬆️",
              title: "Upload Results",
              desc: "Event organizers can upload official results and certificates. Participants will be able to download their certificates once uploaded.",
              btn: "Upload Official Results",
              filled: true,
            },
            {
              icon: "⬇️",
              title: "Download Certificates",
              desc: "Search for and download your event certificates and view official results from completed events.",
              btn: "Search Your Certificate",
              filled: false,
            },
          ].map((c, i) => (
            <div
              key={i}
              style={{ padding: "2.25rem", borderRadius: 16, background: "#111122", border: "1px solid rgba(255,255,255,0.07)", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transition: `all 0.7s ${i * 0.15}s` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.background = "#13132a"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "#111122"; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1.5rem", border: "1px solid rgba(201,168,76,0.15)" }}>
                {c.icon}
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "1rem", marginBottom: "0.75rem", letterSpacing: "0.02em" }}>{c.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: "1.75rem" }}>{c.desc}</p>
              <a
                href="/results"
                style={{ display: "block", width: "100%", padding: "0.9rem", background: c.filled ? "linear-gradient(135deg,#C9A84C,#b8962e)" : "transparent", color: c.filled ? "#0d0d1a" : "#C9A84C", border: c.filled ? "none" : "1.5px solid rgba(201,168,76,0.4)", borderRadius: 6, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", transition: "all 0.25s", letterSpacing: "0.06em", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
              >
                {c.btn}
              </a>
            </div>
          ))}
        </div>

        {/* ── View All Results CTA banner ── */}
        <div
          style={{ borderRadius: 16, border: "1px solid rgba(201,168,76,0.15)", background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(17,17,34,0.8) 60%)", padding: "2rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.7s 0.25s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(17,17,34,0.9) 60%)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(17,17,34,0.8) 60%)"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>🏆</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.95rem", marginBottom: "0.25rem" }}>Official Event Results</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>Browse all results, download certificates, and track your achievements.</div>
            </div>
          </div>
          <a
            href="/results"
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1.75rem", borderRadius: 6, background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "0 4px 20px rgba(201,168,76,0.25)", transition: "all 0.25s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,168,76,0.45)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,168,76,0.25)"; e.currentTarget.style.transform = "none"; }}
          >
            View All Results <ArrowRight />
          </a>
        </div>

        {/* ── Medals & Certificates info cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "1.5rem" }}>
          {[
            { icon: "🥇", title: "Event Medals", desc: "All finishers receive a unique medal commemorating their achievement, featuring ONE4ONE branding and event-specific details." },
            { icon: "📜", title: "Certificates", desc: "Digital and printable certificates available for all participants. Download yours from the results portal after the event." },
          ].map((c, i) => (
            <div
              key={i}
              style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "2rem", border: "1px solid rgba(201,168,76,0.1)", transition: "all 0.3s", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transitionDelay: `${0.35 + i * 0.12}s` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.1)"; e.currentTarget.style.transform = "none"; }}
            >
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
                <img src="/media/logo4.png" alt="ONE4ONE" style={{ width: "100%", height: "100%", objectFit: "contain" }}
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