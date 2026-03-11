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
  @keyframes lineExpand {
    from { width: 0; }
    to { width: 100%; }
  }
  @keyframes heroKenBurns {
    0% { transform: scale(1.05); }
    100% { transform: scale(1.14); }
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

  .gallery-item img { transition: transform 0.55s cubic-bezier(0.16,1,0.3,1); }
  .gallery-item:hover img { transform: scale(1.07); }
  .gallery-item .overlay { opacity: 0; transition: opacity 0.35s; }
  .gallery-item:hover .overlay { opacity: 1; }
  .gallery-item .caption { transform: translateY(10px); transition: all 0.35s; opacity: 0; }
  .gallery-item:hover .caption { transform: translateY(0); opacity: 1; }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0;
    width: 0; height: 1px;
    background: #C9A84C;
    transition: width 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .nav-link:hover::after { width: 100%; }

  .filter-btn { transition: all 0.25s; }

  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
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
const ChevronLeft = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);
const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const TwitterIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ── All gallery media ─────────────────────────────────────────────────────────
const ALL_MEDIA = [
  // Running — Vienna Loop
  { id: 1, src: "/gallery/gallery 1.png",          label: "Running", event: "Vienna Loop",          date: "Feb 2026", featured: true },
  { id: 2, src: "/gallery/gallery 2.png",          label: "Running", event: "Vienna Loop",          date: "Feb 2026", featured: false },
  { id: 3, src: "/gallery/gallery 3.png",          label: "Running", event: "Vienna Loop",          date: "Feb 2026", featured: false },
  // Hiking — Mt. Kenya Day Dash
  { id: 4, src: "/gallery/gallery 4.png",          label: "Hiking",  event: "Mt. Kenya Day Dash",   date: "Jan 2026", featured: true },
  { id: 5, src: "/gallery/gallery 5.png",          label: "Hiking",  event: "Mt. Kenya Day Dash",   date: "Jan 2026", featured: false },
  { id: 6, src: "/gallery/gallery 6.png",          label: "Hiking",  event: "Mt. Kenya Day Dash",   date: "Jan 2026", featured: false },
  // Event photos
  { id: 7,  src: "/media/events/mtkd - 1.png",    label: "Hiking",  event: "Mt. Kenya Day Dash",   date: "Jan 2026", caption: "Group Hike",       featured: true },
  { id: 8,  src: "/media/events/mtkd - 2.png",    label: "Hiking",  event: "Mt. Kenya Day Dash",   date: "Jan 2026", caption: "Crystal Clear",    featured: false },
  { id: 9,  src: "/media/events/mtkd - 3.png",    label: "Hiking",  event: "Mt. Kenya Day Dash",   date: "Jan 2026", caption: "Summit Approach",  featured: true },
  { id: 10, src: "/media/events/mtkd - 4.png",    label: "Hiking",  event: "Mt. Kenya Day Dash",   date: "Jan 2026", caption: "Marker Check",     featured: false },
  { id: 11, src: "/media/events/mtkd - 5.png",    label: "Hiking",  event: "Mt. Kenya Day Dash",   date: "Jan 2026", caption: "Group Photo",      featured: true },
  { id: 12, src: "/media/events/mtkd - 6.png",    label: "Hiking",  event: "Mt. Kenya Day Dash",   date: "Jan 2026", caption: "Aerial View",      featured: false },
];

const FALLBACK = ["🏃", "🌅", "⛰️", "🥾", "📸", "🏁", "👥", "💧", "🧗", "🗺️", "🏅", "🤝"];

const FILTERS = ["All", "Running", "Hiking"];
const EVENTS  = ["All Events", "Vienna Loop", "Mt. Kenya Day Dash"];

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ items, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent(c => (c + 1) % items.length);
      if (e.key === "ArrowLeft")  setCurrent(c => (c - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", handle);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handle); document.body.style.overflow = ""; };
  }, [onClose, items.length]);

  const item = items[current];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5,5,15,0.97)", backdropFilter: "blur(24px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}>

      {/* Close */}
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "all 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.3)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}>✕</button>

      {/* Counter */}
      <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", zIndex: 10 }}>
        {current + 1} / {items.length}
      </div>

      {/* Prev */}
      <button onClick={e => { e.stopPropagation(); setCurrent(c => (c - 1 + items.length) % items.length); }} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 52, height: 52, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "all 0.25s" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.2)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}>
        <ChevronLeft />
      </button>

      {/* Next */}
      <button onClick={e => { e.stopPropagation(); setCurrent(c => (c + 1) % items.length); }} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 52, height: 52, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "all 0.25s" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.2)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}>
        <ChevronRight />
      </button>

      {/* Image */}
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "min(900px, 90vw)", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <img key={item.src} src={item.src} alt={item.caption || item.event} style={{ maxWidth: "min(900px, 88vw)", maxHeight: "78vh", objectFit: "contain", display: "block", borderRadius: 10, border: "1px solid rgba(201,168,76,0.15)" }}
          onError={ev => { ev.target.style.display = "none"; }} />
        {/* Caption bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(5,5,15,0.95), transparent)", borderRadius: "0 0 10px 10px", padding: "2rem 1.5rem 1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <span style={{ background: "rgba(201,168,76,0.9)", color: "#0d0d1a", padding: "0.18rem 0.7rem", borderRadius: 3, fontSize: "0.65rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.label}</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#fff", fontWeight: 600 }}>{item.caption || item.event}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>{item.date}</span>
          </div>
        </div>
      </div>

      {/* Strip thumbnails */}
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.4rem", maxWidth: "min(700px, 90vw)", overflowX: "auto", padding: "0 0.5rem" }}>
        {items.map((it, i) => (
          <div key={it.id} onClick={e => { e.stopPropagation(); setCurrent(i); }} style={{ width: 54, height: 38, borderRadius: 5, overflow: "hidden", flexShrink: 0, cursor: "pointer", border: `1.5px solid ${i === current ? "#C9A84C" : "rgba(255,255,255,0.1)"}`, opacity: i === current ? 1 : 0.45, transition: "all 0.2s" }}>
            <img src={it.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={ev => ev.target.style.display = "none"} />
          </div>
        ))}
      </div>

      {/* Hint */}
      <div style={{ position: "absolute", bottom: 70, right: 20, fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>← → arrow keys</div>
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
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <div style={{ width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src="/media/logo2.png" alt="ONE4ONE" style={{ width: "100%", height: "100%", objectFit: "contain", transform: "scale(1.9)", transformOrigin: "center" }}
                onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:1rem;color:#C9A84C">1·4·1</span>'; }} />
            </div>
          </a>

          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {links.map(l => (
              <a key={l.label} href={l.href} className="nav-link" style={{ position: "relative", fontFamily: "'Syne', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: l.href === "/gallery" ? "#C9A84C" : "rgba(255,255,255,0.75)", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = l.href === "/gallery" ? "#C9A84C" : "rgba(255,255,255,0.75)"}>{l.label}</a>
            ))}
            <a href="/#contact" style={{ background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", padding: "0.6rem 1.4rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.76rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.3s", boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}>
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
          <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: "block", fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 600, color: l.href === "/gallery" ? "#C9A84C" : "rgba(255,255,255,0.75)", textDecoration: "none", padding: "0.9rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{l.label}</a>
        ))}
        <a href="/#contact" onClick={() => setMenuOpen(false)} style={{ display: "block", marginTop: "1.75rem", padding: "0.9rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", textAlign: "center", letterSpacing: "0.08em", textTransform: "uppercase" }}>Contact Us</a>
      </div>
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 480, background: "rgba(0,0,0,0.5)" }} />}
    </>
  );
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function TickerBanner() {
  const items = ["Running Events", "Hiking Adventures", "Tour Experiences", "Mt. Kenya Day Dash", "Vienna Loop", "Better Together", "Visual Diary", "All Moments"];
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
      {/* Background collage of event images */}
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, opacity: 0.35 }}>
        {["/media/events/mtkd - 1.png", "/media/events/mtkd - 3.png", "/gallery/gallery 1.png", "/media/events/mtkd - 5.png"].map((src, i) => (
          <div key={i} style={{ overflow: "hidden", position: "relative" }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", animation: "heroKenBurns 10s ease-out infinite alternate" }}
              onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${i*50+200},20%,10%)`; }} />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,18,0.5) 0%, rgba(8,8,18,0.7) 60%, #0d0d1a 100%)" }} />

      {/* Left accent line */}
      <div style={{ position: "absolute", left: "1.5rem", top: "20%", bottom: "20%", width: 1, background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5), transparent)" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", padding: "0 2rem 4rem 3rem", width: "100%" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.25rem", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
          <ArrowLeft /> Back to Home
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", opacity: loaded ? 1 : 0, transition: "all 0.7s 0.1s" }}>
          <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Visual Diary</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 8vw, 5.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.02em", opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.8s 0.2s cubic-bezier(0.16,1,0.3,1)" }}>
          Event <span className="gold-shimmer">Gallery</span>
        </h1>
      </div>
    </section>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ total, filtered }) {
  return (
    <div style={{ background: "#111122", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 1.5rem" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", align: "center", gap: "2rem", flexWrap: "wrap" }}>
          {[
            { val: total, label: "Total Photos" },
            { val: filtered, label: "Showing" },
            { val: 2, label: "Events" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.45rem" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: "#C9A84C", lineHeight: 1 }}>{s.val}</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>Click any photo to view full size</span>
      </div>
    </div>
  );
}

// ── Gallery Grid ──────────────────────────────────────────────────────────────
function GalleryGrid() {
  const [ref, visible] = useInView();
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeEvent, setActiveEvent]   = useState("All Events");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [layout, setLayout] = useState("masonry"); // "masonry" | "grid" | "featured"

  const filtered = ALL_MEDIA.filter(m => {
    const matchF = activeFilter === "All" || m.label === activeFilter;
    const matchE = activeEvent === "All Events" || m.event === activeEvent;
    return matchF && matchE;
  });

  // Group by event for the "by event" layout
  const byEvent = filtered.reduce((acc, item) => {
    if (!acc[item.event]) acc[item.event] = [];
    acc[item.event].push(item);
    return acc;
  }, {});

  const openLightbox = (globalItem) => {
    const idx = filtered.findIndex(f => f.id === globalItem.id);
    if (idx >= 0) setLightboxIndex(idx);
  };

  return (
    <section ref={ref} style={{ padding: "3rem 1.5rem 6rem", background: "#0d0d1a", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1.25rem", opacity: visible ? 1 : 0, transition: "all 0.6s" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {/* Category filters */}
            {FILTERS.map(f => (
              <button key={f} className="filter-btn" onClick={() => setActiveFilter(f)} style={{ padding: "0.5rem 1.1rem", borderRadius: 4, border: "1px solid", borderColor: activeFilter === f ? "#C9A84C" : "rgba(255,255,255,0.1)", background: activeFilter === f ? "rgba(201,168,76,0.12)" : "transparent", color: activeFilter === f ? "#C9A84C" : "rgba(255,255,255,0.45)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {f}
              </button>
            ))}
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)", alignSelf: "center", margin: "0 0.25rem" }} />
            {/* Event filters */}
            {EVENTS.map(e => (
              <button key={e} className="filter-btn" onClick={() => setActiveEvent(e)} style={{ padding: "0.5rem 1.1rem", borderRadius: 4, border: "1px solid", borderColor: activeEvent === e ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.07)", background: activeEvent === e ? "rgba(201,168,76,0.07)" : "transparent", color: activeEvent === e ? "rgba(201,168,76,0.9)" : "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.02em" }}>
                {e}
              </button>
            ))}
          </div>

          {/* Layout toggle */}
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {[
              { key: "masonry", icon: "⊞", label: "Masonry" },
              { key: "grid",    icon: "▦", label: "Grid" },
              { key: "featured",icon: "◫", label: "Featured" },
            ].map(l => (
              <button key={l.key} onClick={() => setLayout(l.key)} title={l.label} style={{ width: 36, height: 36, borderRadius: 6, border: "1px solid", borderColor: layout === l.key ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.1)", background: layout === l.key ? "rgba(201,168,76,0.1)" : "transparent", color: layout === l.key ? "#C9A84C" : "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {l.icon}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>
            No photos match the selected filters.
          </div>
        )}

        {/* ── Masonry layout ── */}
        {layout === "masonry" && filtered.length > 0 && (
          <div style={{ columns: "3 280px", gap: "1rem" }}>
            {filtered.map((item, i) => (
              <MasonryItem key={item.id} item={item} index={i} visible={visible} onClick={() => openLightbox(item)} />
            ))}
          </div>
        )}

        {/* ── Grid layout ── */}
        {layout === "grid" && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {filtered.map((item, i) => (
              <GridItem key={item.id} item={item} index={i} visible={visible} onClick={() => openLightbox(item)} />
            ))}
          </div>
        )}

        {/* ── Featured layout (by event groups) ── */}
        {layout === "featured" && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
            {Object.entries(byEvent).map(([eventName, eventItems]) => (
              <EventGroup key={eventName} name={eventName} items={eventItems} visible={visible} onOpen={(item) => openLightbox(item)} />
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox items={filtered} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </section>
  );
}

function MasonryItem({ item, index, visible, onClick }) {
  const heights = ["auto"];
  return (
    <div className="gallery-item" onClick={onClick} style={{ position: "relative", borderRadius: 10, overflow: "hidden", cursor: "zoom-in", marginBottom: "1rem", breakInside: "avoid", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: `opacity 0.6s ${(index % 6) * 0.07}s, transform 0.6s ${(index % 6) * 0.07}s`, border: "1px solid rgba(255,255,255,0.05)" }}>
      <img src={item.src} alt={item.caption || item.event} style={{ width: "100%", display: "block", objectFit: "cover" }}
        onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${index*33+190},20%,12%)`; ev.target.parentNode.style.height = "200px"; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.5rem">${FALLBACK[index % FALLBACK.length]}</div>`; }} />
      <div className="overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.92) 0%, transparent 55%)" }} />
      <div className="caption" style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
        <span style={{ background: "rgba(201,168,76,0.9)", color: "#0d0d1a", padding: "0.15rem 0.65rem", borderRadius: 2, fontSize: "0.62rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-block", marginBottom: "0.35rem" }}>{item.label}</span>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "0.95rem", color: "#fff" }}>{item.caption || item.event}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{item.date}</div>
      </div>
    </div>
  );
}

function GridItem({ item, index, visible, onClick }) {
  return (
    <div className="gallery-item" onClick={onClick} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", cursor: "zoom-in", opacity: visible ? 1 : 0, transform: visible ? "none" : "scale(0.96)", transition: `all 0.6s ${(index % 6) * 0.07}s`, background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)" }}>
      <img src={item.src} alt={item.caption || item.event} style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${index*33+190},20%,12%)`; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.8rem">${FALLBACK[index % FALLBACK.length]}</div>`; }} />
      <div className="overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.9) 0%, transparent 55%)" }} />
      <div className="caption" style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
        <span style={{ background: "rgba(201,168,76,0.9)", color: "#0d0d1a", padding: "0.15rem 0.65rem", borderRadius: 2, fontSize: "0.62rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-block", marginBottom: "0.35rem" }}>{item.label}</span>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "0.95rem", color: "#fff" }}>{item.caption || item.event}</div>
      </div>
    </div>
  );
}

function EventGroup({ name, items, visible, onOpen }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", opacity: vis ? 1 : 0, transition: "all 0.6s" }}>
        <div style={{ width: 3, height: 28, background: "#C9A84C", borderRadius: 2 }} />
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, color: "#fff" }}>{name}</h3>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: "0.25rem" }}>{items.length} Photos</span>
      </div>
      {/* Hero + grid combo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.85rem" }}>
        {/* Featured first image large */}
        {items[0] && (
          <div className="gallery-item" onClick={() => onOpen(items[0])} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "16/7", cursor: "zoom-in", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)", opacity: vis ? 1 : 0, transition: "all 0.7s 0.05s" }}>
            <img src={items[0].src} alt={items[0].caption || items[0].event} style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = "#1a1a2e"; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:4rem">⛰️</div>`; }} />
            <div className="overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.85) 0%, transparent 50%)" }} />
            <div className="caption" style={{ position: "absolute", bottom: 24, left: 24 }}>
              <span style={{ background: "rgba(201,168,76,0.9)", color: "#0d0d1a", padding: "0.2rem 0.8rem", borderRadius: 2, fontSize: "0.65rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-block", marginBottom: "0.5rem" }}>Featured</span>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.4rem", color: "#fff" }}>{items[0].caption || items[0].event}</div>
            </div>
          </div>
        )}
        {/* Rest in grid */}
        {items.length > 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: "0.85rem" }}>
            {items.slice(1).map((item, i) => (
              <div key={item.id} className="gallery-item" onClick={() => onOpen(item)} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", cursor: "zoom-in", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)", opacity: vis ? 1 : 0, transition: `all 0.6s ${0.12 + i * 0.07}s` }}>
                <img src={item.src} alt={item.caption || item.event} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${i*50+200},18%,12%)`; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.5rem">${FALLBACK[(i+1) % FALLBACK.length]}</div>`; }} />
                <div className="overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.88) 0%, transparent 55%)" }} />
                <div className="caption" style={{ position: "absolute", bottom: 12, left: 12 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "#fff" }}>{item.caption || item.event}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Social CTA ────────────────────────────────────────────────────────────────
function SocialCTA() {
  const [ref, visible] = useInView();
  const links = [
    { icon: <InstagramIcon size={18} />, name: "Instagram", url: "https://www.instagram.com/one4one_placeholder" },
    { icon: <FacebookIcon size={18} />, name: "Facebook",  url: "https://www.facebook.com/one4one_placeholder" },
    { icon: <TwitterIcon size={18} />,  name: "Twitter",   url: "https://www.twitter.com/one4one_placeholder" },
  ];
  return (
    <section ref={ref} style={{ padding: "5rem 1.5rem", background: "#111122", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.7s" }}>
        <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5))", margin: "0 auto 2rem" }} />
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
          More Moments on Social
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", lineHeight: 1.75, marginBottom: "2.5rem" }}>
          Follow ONE4ONE on social media for real-time event updates, behind-the-scenes moments, and community highlights.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          {links.map(({ icon, name, url }) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1.5rem", borderRadius: 4, border: "1px solid rgba(201,168,76,0.25)", background: "rgba(201,168,76,0.05)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; e.currentTarget.style.background = "rgba(201,168,76,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(201,168,76,0.05)"; }}>
              {icon} {name}
            </a>
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
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>Gallery</span>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>© 2026 ONE4ONE. All rights reserved.</p>
        <a href="/" style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.75rem", fontWeight: 700, color: "#C9A84C", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>← Back to Home</a>
      </div>
    </footer>
  );
}

// ── Wrapping component ────────────────────────────────────────────────────────
function GalleryPageInner() {
  return (
    <>
      <StatsBar total={ALL_MEDIA.length} filtered={ALL_MEDIA.length} />
      <GalleryGrid />
      <SocialCTA />
    </>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function GalleryPage() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Navbar />
      <PageHero />
      <TickerBanner />
      <GalleryPageInner />
      <Footer />
    </>
  );
}