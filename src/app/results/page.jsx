"use client";
import { useState, useEffect, useRef } from "react";

// ── Global CSS ────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  html, body { overflow-x: hidden; max-width: 100vw; }
  body { background: #0d0d1a; color: #fff; }

  :root {
    --gold: #C9A84C;
    --gold-light: #e8c96a;
    --navy: #0d0d1a;
    --navy-mid: #111122;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.92) translateY(16px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes navReveal {
    from { opacity: 0; transform: translateY(-100%); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes heroKenBurns {
    0% { transform: scale(1.05); }
    100% { transform: scale(1.14); }
  }
  @keyframes rowIn {
    from { opacity: 0; transform: translateX(-16px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .gold-shimmer {
    background: linear-gradient(90deg, #C9A84C 0%, #e8c96a 40%, #fff8e8 50%, #e8c96a 60%, #C9A84C 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .slide-track { animation: ticker 30s linear infinite; }
  .slide-track:hover { animation-play-state: paused; }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0;
    width: 0; height: 1px;
    background: #C9A84C;
    transition: width 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .nav-link:hover::after { width: 100%; }

  .result-row { transition: background 0.2s; }
  .result-row:hover { background: rgba(255,255,255,0.025) !important; }

  .cert-card { transition: all 0.3s; }
  .cert-card:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.45) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.35); }

  .tab-btn { transition: all 0.25s; }

  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
    .results-table { font-size: 0.8rem !important; }
    .hide-mobile { display: none !important; }
  }
  @media (min-width: 769px) {
    .mobile-menu-btn { display: none !important; }
    .mobile-nav-drawer { display: none !important; }
  }
`;

// ── Utility ───────────────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
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

// ── Icons ─────────────────────────────────────────────────────────────────────
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const TrophyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/>
    <path d="M7 4H4a2 2 0 0 0-2 2v3c0 3.31 2.69 6 6 6h.01M17 4h3a2 2 0 0 1 2 2v3c0 3.31-2.69 6-6 6H17"/>
    <rect x="7" y="2" width="10" height="11" rx="1"/>
  </svg>
);
const CertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const MedalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="15" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
    <path d="M15 7l-3-4-3 4h6z"/>
  </svg>
);

// ── Data ──────────────────────────────────────────────────────────────────────
const EVENTS_DATA = [
  {
    id: "mtkd-jan-2026",
    title: "Mt. Kenya Day Dash",
    subtitle: "Naromoru Route",
    date: "24 January 2026",
    type: "Hiking",
    status: "completed",
    location: "Mt. Kenya, Kenya",
    distance: "Day Hike",
    totalParticipants: 5,
    guides: ["Peter Waihenya", "Elijah Kabugi"],
    coverImage: "/media/events/mtkd - 5.png",
    results: [
      { rank: 1, name: "Christopher", bib: "001", finishTime: "—",  category: "Open",   cert: "/certificates/cert 1.pdf" },
      { rank: 2, name: "Meek",        bib: "002", finishTime: "—",  category: "Open",   cert: "/certificates/Meek.pdf" },
      { rank: 3, name: "Timothy",     bib: "003", finishTime: "—",  category: "Open",   cert: "/certificates/Timothy.pdf" },
      { rank: 4, name: "Wambui",      bib: "004", finishTime: "—",  category: "Female", cert: "/certificates/Wambui.pdf" },
      { rank: 5, name: "Peter",       bib: "005", finishTime: "—",  category: "Guide",  cert: "/certificates/Peter.pdf" },
    ],
  },
];

// ── Certificate Modal ─────────────────────────────────────────────────────────
function CertModal({ cert, name, onClose }) {
  useEffect(() => {
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handle); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5,5,15,0.97)", backdropFilter: "blur(24px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.2s" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(860px, 95vw)", borderRadius: 20, overflow: "hidden", background: "#0d0d1a", border: "1px solid rgba(201,168,76,0.2)", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(13,13,26,0.95))", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(201,168,76,0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(201,168,76,0.2)" }}>
              <CertIcon />
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>Mt. Kenya Day Dash · January 2026</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(201,168,76,0.1)"}>✕</button>
        </div>

        {/* PDF Viewer */}
        <div style={{ height: "62vh", background: "#111122", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <iframe src={cert} title={`${name} Certificate`} width="100%" height="100%" style={{ border: "none", display: "block" }} />
        </div>

        {/* Footer */}
        <div style={{ background: "#0a0a14", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(201,168,76,0.08)", gap: "1rem", flexWrap: "wrap" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.25)", fontSize: "0.76rem", letterSpacing: "0.05em" }}>ESC TO CLOSE</p>
          <a href={cert} download target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1.5rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <DownloadIcon /> Download Certificate
          </a>
        </div>
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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "About",   href: "/#about" },
    { label: "Events",  href: "/#events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Results", href: "/results" },
  ];

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, background: scrolled ? "rgba(10,10,20,0.94)" : "rgba(10,10,20,0.6)", backdropFilter: "blur(20px)", borderBottom: scrolled ? "1px solid rgba(201,168,76,0.12)" : "1px solid rgba(255,255,255,0.04)", transition: "all 0.5s", animation: mounted ? "navReveal 0.8s cubic-bezier(0.16,1,0.3,1)" : "none", maxWidth: "100vw", overflow: "hidden" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 74 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <div style={{ width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src="/media/logo2.png" alt="ONE4ONE" style={{ width: "100%", height: "100%", objectFit: "contain", transform: "scale(1.9)", transformOrigin: "center" }}
                onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:1rem;color:#C9A84C">1·4·1</span>'; }} />
            </div>
          </a>

          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {links.map(l => (
              <a key={l.label} href={l.href} className="nav-link" style={{ position: "relative", fontFamily: "'Syne', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: l.href === "/results" ? "#C9A84C" : "rgba(255,255,255,0.75)", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = l.href === "/results" ? "#C9A84C" : "rgba(255,255,255,0.75)"}>{l.label}</a>
            ))}
            <a href="/#contact" style={{ background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", padding: "0.6rem 1.4rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.76rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}>
              Contact
            </a>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)} style={{ flexDirection: "column", justifyContent: "center", alignItems: "flex-end", gap: 5, width: 44, height: 44, background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem" }}>
            <span style={{ display: "block", width: 24, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", width: 18, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: 12, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </nav>

      <div className="mobile-nav-drawer" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(300px, 85vw)", zIndex: 490, background: "rgba(8,8,20,0.99)", backdropFilter: "blur(30px)", transform: menuOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)", borderLeft: "1px solid rgba(201,168,76,0.12)", padding: "5.5rem 2rem 2rem" }}>
        {links.map(l => (
          <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: "block", fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 600, color: l.href === "/results" ? "#C9A84C" : "rgba(255,255,255,0.75)", textDecoration: "none", padding: "0.9rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{l.label}</a>
        ))}
        <a href="/#contact" onClick={() => setMenuOpen(false)} style={{ display: "block", marginTop: "1.75rem", padding: "0.9rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", textAlign: "center", letterSpacing: "0.08em", textTransform: "uppercase" }}>Contact Us</a>
      </div>
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 480, background: "rgba(0,0,0,0.5)" }} />}
    </>
  );
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function TickerBanner() {
  const items = ["Event Results", "Participation Certificates", "Mt. Kenya Day Dash", "Vienna Loop", "Better Together", "Download Your Certificate", "Official Results", "ONE4ONE"];
  const doubled = [...items, ...items];
  return (
    <div style={{ background: "var(--gold)", overflow: "hidden", padding: "0.52rem 0" }}>
      <div className="slide-track" style={{ display: "flex", width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "#0d0d1a", letterSpacing: "0.13em", textTransform: "uppercase", padding: "0 2.5rem", display: "flex", alignItems: "center", gap: "1rem", whiteSpace: "nowrap" }}>
            {item}
            <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "rgba(13,13,26,0.35)" }} />
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Page Hero ─────────────────────────────────────────────────────────────────
function PageHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 150); }, []);

  return (
    <section style={{ position: "relative", height: "52vh", minHeight: 380, overflow: "hidden", background: "#080812", display: "flex", alignItems: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, opacity: 0.28 }}>
        {["/media/events/mtkd - 1.png", "/media/events/mtkd - 6.png", "/gallery/gallery 4.png", "/media/events/mtkd - 3.png"].map((src, i) => (
          <div key={i} style={{ overflow: "hidden" }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", animation: "heroKenBurns 10s ease-out infinite alternate" }}
              onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${i*50+210},18%,8%)`; }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,18,0.55) 0%, rgba(8,8,18,0.72) 60%, #0d0d1a 100%)" }} />
      <div style={{ position: "absolute", left: "1.5rem", top: "20%", bottom: "20%", width: 1, background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5), transparent)" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", padding: "0 2rem 4rem 3rem", width: "100%" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.25rem", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
          <ArrowLeft /> Back to Home
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", opacity: loaded ? 1 : 0, transition: "all 0.7s 0.1s" }}>
          <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Achievements</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 8vw, 5.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.02em", opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.8s 0.2s cubic-bezier(0.16,1,0.3,1)" }}>
          Results &amp; <span className="gold-shimmer">Certificates</span>
        </h1>
      </div>
    </section>
  );
}

// ── Search Bar ────────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 440 }}>
      <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>
        <SearchIcon />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by participant name…"
        style={{ width: "100%", padding: "0.78rem 1rem 0.78rem 2.75rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.5)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
    </div>
  );
}

// ── Event Card Header ─────────────────────────────────────────────────────────
function EventCardHeader({ event, onExpand, expanded }) {
  return (
    <div onClick={onExpand} style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem 2rem", cursor: "pointer", transition: "background 0.2s", flexWrap: "wrap" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.03)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {/* Cover thumb */}
      <div style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)", background: "#1a1a2e" }}>
        <img src={event.coverImage} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.8rem">🏆</div>'; }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "#fff", fontSize: "1.35rem", letterSpacing: "-0.01em" }}>{event.title}</h3>
          <span style={{ background: event.status === "completed" ? "rgba(34,197,94,0.15)" : "rgba(201,168,76,0.15)", color: event.status === "completed" ? "#4ade80" : "#C9A84C", border: `1px solid ${event.status === "completed" ? "rgba(34,197,94,0.25)" : "rgba(201,168,76,0.25)"}`, padding: "0.15rem 0.7rem", borderRadius: 3, fontSize: "0.65rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {event.status === "completed" ? "Completed" : "Upcoming"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          {[`📅 ${event.date}`, `📍 ${event.location}`, `👥 ${event.totalParticipants} participants`, `🏃 ${event.distance}`].map((val, i) => (
            <span key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "0.25rem" }}>{val}</span>
          ))}
        </div>
      </div>
      {/* Expand toggle */}
      <div style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", transition: "all 0.3s", transform: expanded ? "rotate(180deg)" : "none", flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </div>
    </div>
  );
}

// ── Results Table ─────────────────────────────────────────────────────────────
function ResultsTable({ results, search, onCertClick }) {
  const [ref, visible] = useInView(0.05);
  const filtered = search.trim()
    ? results.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    : results;

  const rankColor = (rank) => {
    if (rank === 1) return "#ffd700";
    if (rank === 2) return "#c0c0c0";
    if (rank === 3) return "#cd7f32";
    return "rgba(255,255,255,0.25)";
  };

  const rankEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div ref={ref} style={{ overflowX: "auto" }}>
      {filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem" }}>
          No participant found matching "<strong style={{ color: "rgba(255,255,255,0.5)" }}>{search}</strong>"
        </div>
      ) : (
        <table className="results-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Rank", "Participant", "Bib", "Category", "Finish Time", "Certificate"].map((h, i) => (
                <th key={h} className={i === 2 || i === 4 ? "hide-mobile" : ""} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.85rem 1rem", textAlign: i === 5 ? "right" : "left", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.bib} className="result-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "transparent", animation: visible ? `rowIn 0.5s ${i * 0.07}s both` : "none" }}>
                <td style={{ padding: "1rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 700, color: rankColor(r.rank), whiteSpace: "nowrap", width: 64 }}>
                  {rankEmoji(r.rank)}
                </td>
                <td style={{ padding: "1rem", fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.88rem" }}>
                  {r.name}
                </td>
                <td className="hide-mobile" style={{ padding: "1rem", fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}>
                  {r.bib}
                </td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ padding: "0.18rem 0.65rem", borderRadius: 3, background: r.category === "Female" ? "rgba(244,114,182,0.12)" : r.category === "Guide" ? "rgba(96,165,250,0.12)" : "rgba(201,168,76,0.1)", color: r.category === "Female" ? "#f472b6" : r.category === "Guide" ? "#60a5fa" : "#C9A84C", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {r.category}
                  </span>
                </td>
                <td className="hide-mobile" style={{ padding: "1rem", fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
                  {r.finishTime}
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button onClick={() => onCertClick(r)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.42rem 0.85rem", background: "transparent", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 4, color: "#C9A84C", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.06em", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.1)"; e.currentTarget.style.borderColor = "#C9A84C"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}>
                      <EyeIcon /> View
                    </button>
                    <a href={r.cert} download target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.42rem 0.85rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", borderRadius: 4, color: "#0d0d1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", textDecoration: "none", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                      <DownloadIcon /> Save
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Certificates Grid ─────────────────────────────────────────────────────────
function CertificatesGrid({ results, search, onCertClick }) {
  const [ref, visible] = useInView();
  const filtered = search.trim()
    ? results.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    : results;

  return (
    <div ref={ref} style={{ padding: "1.5rem 2rem 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.85rem" }}>
      {filtered.map((r, i) => (
        <div key={r.bib} className="cert-card" onClick={() => onCertClick(r)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "1rem 1.25rem", border: "1px solid rgba(201,168,76,0.1)", cursor: "pointer", gap: "0.75rem", opacity: visible ? 1 : 0, animation: visible ? `fadeUp 0.5s ${i * 0.07}s both` : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(201,168,76,0.18)" }}>
              <MedalIcon />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.88rem", marginBottom: "0.15rem" }}>{r.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.7rem" }}>Mt. Kenya Day Dash · Jan 2026</div>
              <div style={{ fontFamily: "'Syne', sans-serif", color: "#C9A84C", fontSize: "0.65rem", marginTop: "0.2rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Tap to Preview →</div>
            </div>
          </div>
          <a href={r.cert} download target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.45rem 0.85rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", textDecoration: "none", flexShrink: 0, letterSpacing: "0.04em" }}>
            <DownloadIcon /> Save
          </a>
        </div>
      ))}
    </div>
  );
}

// ── Main Results Section ──────────────────────────────────────────────────────
function ResultsSection() {
  const [ref, visible] = useInView();
  const [search, setSearch] = useState("");
  const [activeEvent, setActiveEvent] = useState(EVENTS_DATA[0].id);
  const [activeTab, setActiveTab] = useState("results"); // "results" | "certificates"
  const [expandedEvent, setExpandedEvent] = useState(EVENTS_DATA[0].id);
  const [certModal, setCertModal] = useState(null);

  const currentEvent = EVENTS_DATA.find(e => e.id === activeEvent) || EVENTS_DATA[0];

  return (
    <section style={{ padding: "3rem 1.5rem 6rem", background: "#0d0d1a", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* Top controls */}
        <div ref={ref} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", marginBottom: "2.5rem", flexWrap: "wrap", opacity: visible ? 1 : 0, transition: "all 0.6s" }}>
          <SearchBar value={search} onChange={setSearch} />
          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.4rem", background: "rgba(255,255,255,0.03)", padding: "0.3rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { key: "results", icon: <TrophyIcon />, label: "Results" },
              { key: "certificates", icon: <CertIcon />, label: "Certificates" },
            ].map(tab => (
              <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", borderRadius: 6, border: "none", background: activeTab === tab.key ? "rgba(201,168,76,0.15)" : "transparent", color: activeTab === tab.key ? "#C9A84C" : "rgba(255,255,255,0.4)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event cards */}
        {EVENTS_DATA.map(event => (
          <div key={event.id} style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "#111122", marginBottom: "1.5rem", opacity: visible ? 1 : 0, transition: "all 0.6s" }}>
            <EventCardHeader
              event={event}
              expanded={expandedEvent === event.id}
              onExpand={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
            />

            {/* Expandable content */}
            <div style={{ overflow: "hidden", maxHeight: expandedEvent === event.id ? 2000 : 0, transition: "max-height 0.55s cubic-bezier(0.16,1,0.3,1)", borderTop: expandedEvent === event.id ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              {activeTab === "results" && (
                <ResultsTable results={event.results} search={search} onCertClick={setCertModal} />
              )}
              {activeTab === "certificates" && (
                <CertificatesGrid results={event.results} search={search} onCertClick={setCertModal} />
              )}
            </div>
          </div>
        ))}

        {/* Coming soon placeholder */}
        <div style={{ borderRadius: 20, border: "1px dashed rgba(255,255,255,0.08)", padding: "3rem 2rem", textAlign: "center", background: "rgba(255,255,255,0.015)" }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(201,168,76,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", border: "1px solid rgba(201,168,76,0.1)" }}>
            <TrophyIcon />
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "rgba(255,255,255,0.5)", fontSize: "1.4rem", marginBottom: "0.5rem" }}>More Events Coming</h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.25)", fontSize: "0.85rem", maxWidth: 380, margin: "0 auto 1.5rem", lineHeight: 1.7 }}>
            Results from upcoming events will be published here once they are completed. Register for our next event!
          </p>
          <a href="/#events" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.5rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            View Upcoming Events
          </a>
        </div>
      </div>

      {certModal && (
        <CertModal
          cert={certModal.cert}
          name={certModal.name}
          onClose={() => setCertModal(null)}
        />
      )}
    </section>
  );
}

// ── Award Highlights ──────────────────────────────────────────────────────────
function AwardHighlights() {
  const [ref, visible] = useInView();
  const items = [
    { icon: "🥇", title: "Event Medals", desc: "Every finisher receives a unique commemorative medal with ONE4ONE branding and event-specific detail." },
    { icon: "📜", title: "Digital Certificates", desc: "Downloadable and printable certificates for all participants, available here after the event." },
    { icon: "🏅", title: "Recognition", desc: "Top performers and special achievements recognized at the finish line and on our social channels." },
  ];
  return (
    <section ref={ref} style={{ padding: "5rem 1.5rem", background: "#111122", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem", opacity: visible ? 1 : 0, transition: "all 0.6s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", justifyContent: "center" }}>
            <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Prizes & Recognition</span>
            <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: "#fff" }}>Awards & Recognition</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {items.map((c, i) => (
            <div key={i} style={{ padding: "2rem", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.1)", transition: "all 0.3s", opacity: visible ? 1 : 0, animation: visible ? `fadeUp 0.6s ${i * 0.1}s both` : "none" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.1)"}>
              <div style={{ fontSize: "2rem", marginBottom: "1.25rem" }}>{c.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.95rem", marginBottom: "0.6rem", letterSpacing: "0.02em" }}>{c.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", lineHeight: 1.75 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#080810", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1rem", color: "rgba(255,255,255,0.6)" }}>ONE4ONE</span>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)" }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>Results</span>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>© 2026 ONE4ONE. All rights reserved.</p>
        <a href="/" style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.75rem", fontWeight: 700, color: "#C9A84C", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>← Back to Home</a>
      </div>
    </footer>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function ResultsPage() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Navbar />
      <PageHero />
      <TickerBanner />
      <ResultsSection />
      <AwardHighlights />
      <Footer />
    </>
  );
}