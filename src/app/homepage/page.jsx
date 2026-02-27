"use client";
import { useState, useEffect, useRef } from "react";

// ── Utility: simple intersection-observer hook ──────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const end = parseInt(target);
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Social Media SVG Icons ────────────────────────────────────────────────────
function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function FacebookIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function TwitterIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function LinkedInIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

// ── Image Modal ───────────────────────────────────────────────────────────────
function ImageModal({ src, alt, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem", animation: "fadeInModal 0.2s ease"
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative", maxWidth: "90vw", maxHeight: "90vh",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
          animation: "scaleInModal 0.25s cubic-bezier(0.16,1,0.3,1)"
        }}>
        <img
          src={src}
          alt={alt}
          style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", display: "block" }}
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12,
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", fontSize: "1.1rem", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)", transition: "background 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.8)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.6)"}>
          ✕
        </button>
      </div>
      <div style={{ position: "absolute", bottom: "1.5rem", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem" }}>
        Click anywhere outside to close · Esc to close
      </div>
    </div>
  );
}

// ── Certificate Modal ─────────────────────────────────────────────────────────
function CertificateModal({ cert, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem", animation: "fadeInModal 0.2s ease"
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative", width: "min(860px, 95vw)", borderRadius: 20, overflow: "hidden",
          background: "#1a1a1a", boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
          animation: "scaleInModal 0.25s cubic-bezier(0.16,1,0.3,1)"
        }}>
        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2d3561)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.25rem" }}>📜</span>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{cert.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Mt. Kenya Day Dash · January 2026</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", fontSize: "1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.7)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
            ✕
          </button>
        </div>
        <div style={{ background: "#2a2a2a", height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <iframe src={cert.file} title={cert.name} width="100%" height="100%" style={{ border: "none", display: "block" }} />
        </div>
        <div style={{ background: "#111", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Click outside or press Esc to close</p>
          <a
            href={cert.file} download target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.65rem 1.5rem",
              background: "linear-gradient(135deg,#C9A84C,#b8962e)",
              color: "#fff", borderRadius: 50,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem",
              textDecoration: "none", boxShadow: "0 4px 16px rgba(201,168,76,0.4)",
              transition: "all 0.2s"
            }}>
            ⬇ Download Certificate
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLinkClick = () => setMenuOpen(false);
  const links = ["About", "Events", "Gallery", "Results"];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled || menuOpen ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)",
      backdropFilter: "blur(16px)",
      boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.08)" : "none",
      transition: "all 0.4s ease",
      borderBottom: scrolled || menuOpen ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
      // CRITICAL: prevent navbar from causing horizontal overflow
      maxWidth: "100vw",
      overflow: "hidden"
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 80 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img src="/media/logo2.png" alt="ONE4ONE" style={{ width: "100%", height: "100%", objectFit: "contain", transform: "scale(1.9)", transformOrigin: "center" }}
              onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="color:#C9A84C;font-weight:900;font-size:11px;font-family:serif;">1·4·1</span>'; }} />
          </div>
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", fontWeight: 500,
                color: "#374151", textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s"
              }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = "#374151"}>{l}</a>
            ))}
            <a href="#contact" style={{
              background: "linear-gradient(135deg, #C9A84C, #b8962e)", color: "#fff",
              padding: "0.6rem 1.5rem", borderRadius: 50, fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: "0.88rem", textDecoration: "none",
              boxShadow: "0 4px 16px rgba(201,168,76,0.35)", transition: "transform 0.2s, box-shadow 0.2s"
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 24px rgba(201,168,76,0.45)"; }}
              onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "0 4px 16px rgba(201,168,76,0.35)"; }}>
              Contact Us
            </a>
          </div>
        )}

        {/* Hamburger button — mobile only */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            style={{
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              gap: 5, width: 44, height: 44, background: "transparent", border: "none", cursor: "pointer",
              padding: "0.5rem", borderRadius: 10, transition: "background 0.2s", flexShrink: 0
            }}>
            <span style={{ display: "block", width: 24, height: 2, background: "#1a1a2e", borderRadius: 2, transition: "all 0.3s ease", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", width: 24, height: 2, background: "#1a1a2e", borderRadius: 2, transition: "all 0.3s ease", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: 24, height: 2, background: "#1a1a2e", borderRadius: 2, transition: "all 0.3s ease", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && (
        <div style={{
          overflow: "hidden",
          maxHeight: menuOpen ? 400 : 0,
          transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1)",
          background: "rgba(255,255,255,0.98)",
          borderTop: menuOpen ? "1px solid rgba(0,0,0,0.06)" : "none"
        }}>
          <div style={{ padding: "1rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={handleLinkClick} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "1rem", fontWeight: 500,
                color: "#374151", textDecoration: "none", padding: "0.75rem 0",
                borderBottom: "1px solid rgba(0,0,0,0.05)", transition: "color 0.2s", display: "block"
              }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = "#374151"}>{l}</a>
            ))}
            <a href="#contact" onClick={handleLinkClick} style={{
              marginTop: "0.75rem",
              background: "linear-gradient(135deg, #C9A84C, #b8962e)", color: "#fff",
              padding: "0.85rem 1.5rem", borderRadius: 50, fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", textAlign: "center",
              boxShadow: "0 4px 16px rgba(201,168,76,0.35)", display: "block"
            }}>
              Contact Us
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ onImageClick }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  const stats = [{ value: "2", suffix: "+", label: "Events Organized" }, { value: "100", suffix: "+", label: "Athletes Supported" }, { value: "3", suffix: "", label: "Countries" }];
  return (
    <section id="home" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", background: "linear-gradient(160deg, #f8f7f4 0%, #f0ede6 50%, #e8e3d8 100%)", paddingTop: 80, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: "10%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", left: "0%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,26,46,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "3rem 1.25rem", width: "100%" }}>
        {/* Single-column on mobile, two-column on desktop */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }} className="hero-grid">
          <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.8)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 50, padding: "0.4rem 1rem", marginBottom: "1.5rem", backdropFilter: "blur(8px)" }}>
              <span style={{ fontSize: "1rem" }}>🏃</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.83rem", fontWeight: 500, color: "#6b7280" }}>Organized Events Across Africa</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2.8rem, 10vw, 4.5rem)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.1, marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>Better<br /><span style={{ color: "#C9A84C" }}>Together</span></h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1rem", color: "#4b5563", lineHeight: 1.75, marginBottom: "2rem", maxWidth: 480 }}>
              ONE4ONE organizes running, hiking, and tour events in Kenya, Africa, and around the globe. Supporting athletes to achieve their goals through well-organized events.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a href="#events" style={{ background: "linear-gradient(135deg, #C9A84C, #b8962e)", color: "#fff", padding: "0.85rem 1.75rem", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 8px 32px rgba(201,168,76,0.4)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                View Upcoming Events <span>→</span>
              </a>
              <a href="#about" style={{ background: "rgba(255,255,255,0.9)", color: "#1a1a2e", padding: "0.85rem 1.75rem", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", border: "1.5px solid rgba(26,26,46,0.15)" }}>
                Learn More
              </a>
            </div>
            <div style={{ display: "flex", gap: "2.5rem", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(0,0,0,0.08)", flexWrap: "wrap" }}>
              {stats.map((s, i) => (
                <div key={i} style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.1}s` }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 800, color: "#C9A84C" }}><Counter target={s.value} suffix={s.suffix} /></div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "#9ca3af", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
    { icon: "💛", title: "Give Back", desc: "We give back to our community by supporting talented athletes to uplift them through training on financial literacy, mental wellness, and bodily wellness." },
    { icon: "🏆", title: "Better Together", desc: "Our slogan means that we shall also be able to give back to our community by supporting talented athletes and helping them attend events." },
  ];
  return (
    <section id="about" ref={ref} style={{ padding: "5rem 1.25rem", background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s ease" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "1rem" }}>About ONE4ONE</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b7280", fontSize: "1rem", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>ONE4ONE is an organization that organizes running, hiking, and tours. We believe in achieving greatness together.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: "1.25rem" }}>
          {cards.map((c, i) => (
            <div key={i} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transition: `all 0.7s ease ${i * 0.12}s`, background: "#f9f8f6", borderRadius: 20, padding: "1.75rem", border: "1px solid rgba(0,0,0,0.05)", cursor: "default" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(201,168,76,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1.25rem" }}>{c.icon}</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#1a1a2e", fontSize: "1rem", marginBottom: "0.6rem" }}>{c.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b7280", fontSize: "0.88rem", lineHeight: 1.65 }}>{c.desc}</p>
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
  const [active, setActive] = useState(0);
  const tabs = [
    { icon: "🏃", label: "Running Events" },
    { icon: "🥾", label: "Hiking Adventures" },
    { icon: "🗺️", label: "Tour Experiences" },
    { icon: "🏅", label: "Certifications" },
  ];
  return (
    <section ref={ref} style={{ padding: "4rem 1.25rem", background: "linear-gradient(160deg, #f8f7f4, #f0ede6)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s ease" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "1rem" }}>What We Organize</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b7280", fontSize: "1rem", maxWidth: 560, margin: "0 auto" }}>From mountain day dashes to marathon loops, we create memorable experiences for athletes of all levels across Kenya and beyond.</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap", opacity: visible ? 1 : 0, transition: "all 0.7s ease 0.2s" }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setActive(i)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.1rem", borderRadius: 50, border: "1.5px solid", borderColor: active === i ? "#C9A84C" : "rgba(0,0,0,0.1)", background: active === i ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.8)", color: active === i ? "#b8962e" : "#6b7280", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.25s" }}>
              <span>{t.icon}</span> {t.label}
            </button>
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
      { src: "/media/events/mtkd - 4.png", caption: "Marker Checker" },
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
    <section id="events" ref={ref} style={{ padding: "5rem 1.25rem", background: "#f4f3f0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* ─── Upcoming Events ─── */}
        <div style={{ textAlign: "center", marginBottom: "3rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s ease" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "0.75rem" }}>Upcoming Events</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b7280", fontSize: "1rem" }}>Join us for our next adventure. Registration now open!</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "4rem" }}>
          <div style={{
            opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)",
            transition: "all 0.7s ease",
            background: "#fff", borderRadius: 24, overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)",
            width: "100%", maxWidth: 440
          }}>
            <div
              style={{ position: "relative", aspectRatio: "16/9", background: "#e5e3dd", overflow: "hidden", cursor: "zoom-in" }}
              onClick={() => onImageClick(upcomingEvent.image, upcomingEvent.title)}>
              <img src={upcomingEvent.image} alt={upcomingEvent.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = "linear-gradient(135deg,#2d3561,#1a1a2e)"; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem">🏃</div>`; }} />
              <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(201,168,76,0.9)", color: "#fff", padding: "0.3rem 0.9rem", borderRadius: 50, fontSize: "0.75rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", backdropFilter: "blur(8px)" }}>
                {upcomingEvent.status}
              </div>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.2rem", color: "#1a1a2e", marginBottom: "1rem" }}>{upcomingEvent.title}</h3>
              {[["📅", upcomingEvent.date], ["📍", upcomingEvent.location], ["🕐", upcomingEvent.distance], ["👥", upcomingEvent.participants]].map(([ico, val], j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.45rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#6b7280" }}>
                  <span style={{ fontSize: "0.95rem" }}>{ico}</span> {val}
                </div>
              ))}
              <a href="#contact" style={{
                display: "block", width: "100%", marginTop: "1.25rem", padding: "0.85rem",
                background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#fff",
                border: "none", borderRadius: 50, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", textAlign: "center",
                boxShadow: "0 4px 16px rgba(201,168,76,0.35)", transition: "all 0.2s", textDecoration: "none"
              }}>
                Register Now
              </a>
            </div>
          </div>
        </div>

        {/* ─── Past Events ─── */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.75rem,5vw,2.5rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "0.5rem" }}>Past Events</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9ca3af", fontSize: "0.95rem" }}>Our successful events and achievements</p>
        </div>

        <div style={{
          background: "#fff", borderRadius: 24, overflow: "hidden",
          boxShadow: "0 4px 32px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.05)",
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)",
          transition: "all 0.7s ease 0.15s"
        }}>
          {/* Event header */}
          <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#1a1a2e", fontSize: "1.4rem" }}>{pastEvent.title}</h3>
              <span style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a", padding: "0.25rem 0.85rem", borderRadius: 50, fontSize: "0.75rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", alignSelf: "center" }}>Completed</span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9ca3af", fontSize: "0.9rem", marginBottom: "0.6rem" }}>{pastEvent.subtitle}</p>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>📅</span> {pastEvent.date}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>👥</span> Guides: {pastEvent.guides.join(" & ")}
              </div>
            </div>
          </div>

          {/* Event Photos */}
          <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#1a1a2e", fontSize: "1rem", marginBottom: "1.25rem" }}>
              📸 Event Photos
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" }}>
              {pastEvent.photos.map((photo, i) => (
                <div key={i}
                  style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", background: `hsl(${i * 35 + 190},22%,${32 + i * 4}%)`, cursor: "zoom-in" }}
                  onMouseEnter={() => setPhotoHovered(i)}
                  onMouseLeave={() => setPhotoHovered(null)}
                  onClick={() => onImageClick(photo.src, photo.caption)}>
                  <img src={photo.src} alt={photo.caption}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease", transform: photoHovered === i ? "scale(1.08)" : "scale(1)" }}
                    onError={ev => {
                      ev.target.style.display = "none";
                      ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem"><span style="font-size:2.2rem">${["⛰️","🏃","📸","🏁","🏅","🤝"][i]}</span><span style="font-family:sans-serif;font-size:0.72rem;color:rgba(255,255,255,0.65);text-align:center;padding:0 0.5rem">${photo.caption}</span></div>`;
                    }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)", opacity: photoHovered === i ? 1 : 0, transition: "opacity 0.3s" }} />
                  <div style={{ position: "absolute", bottom: 8, left: 10, opacity: photoHovered === i ? 1 : 0, transition: "all 0.3s" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "#fff" }}>{photo.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div style={{ padding: "1.5rem" }}>
            <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#1a1a2e", fontSize: "1rem", marginBottom: "1.25rem" }}>
              📜 Participation Certificates
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "0.85rem" }}>
              {pastEvent.certificates.map((cert, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(248,247,244,0.9)", borderRadius: 14, padding: "1rem 1.1rem", border: "1px solid rgba(201,168,76,0.15)", transition: "all 0.2s", cursor: "pointer", gap: "0.5rem" }}
                  onClick={() => onCertClick(cert)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(201,168,76,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🏅</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#1a1a2e", fontSize: "0.88rem" }}>{cert.name}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#9ca3af", fontSize: "0.72rem", marginTop: 2 }}>Mt. Kenya Day Dash · Jan 2026</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C", fontSize: "0.7rem", marginTop: 2, fontWeight: 600 }}>Click to preview</div>
                    </div>
                  </div>
                  <a href={cert.file} download target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.85rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#fff", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.75rem", textDecoration: "none", boxShadow: "0 2px 8px rgba(201,168,76,0.3)", whiteSpace: "nowrap", flexShrink: 0 }}>
                    ⬇ Download
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
  const items = [
    { src: "/gallery/gallery 1.png", label: "Running", title: "Vienna Loop" },
    { src: "/gallery/gallery 2.png", label: "Running", title: "Vienna Loop" },
    { src: "/gallery/gallery 3.png", label: "Running", title: "Vienna Loop" },
    { src: "/gallery/gallery 4.png", label: "Hiking", title: "Mt. Kenya Day Dash" },
    { src: "/gallery/gallery 5.png", label: "Hiking", title: "Mt. Kenya Day Dash" },
    { src: "/gallery/gallery 6.png", label: "Hiking", title: "Mt. Kenya Day Dash" },
  ];
  const fallbackEmoji = ["⛰️", "🏃", "🌅", "🏋️", "🗺️", "🏁"];

  const socialLinks = [
    { icon: <InstagramIcon size={18} />, name: "Instagram", url: "https://www.instagram.com/one4one_placeholder" },
    { icon: <FacebookIcon size={18} />, name: "Facebook", url: "https://www.facebook.com/one4one_placeholder" },
    { icon: <TwitterIcon size={18} />, name: "Twitter", url: "https://www.twitter.com/one4one_placeholder" },
  ];

  return (
    <section id="gallery" ref={ref} style={{ padding: "5rem 1.25rem", background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s ease" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "0.75rem" }}>Event Gallery</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b7280", fontSize: "1rem" }}>From our amazing past and upcoming events and adventures</p>
        </div>
        {/* Responsive gallery: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.85rem" }}>
          {items.map((item, i) => (
            <div key={i}
              style={{ position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", background: "#e5e3dd", cursor: "zoom-in", opacity: visible ? 1 : 0, transform: visible ? "none" : "scale(0.95)", transition: `all 0.6s ease ${i * 0.08}s` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onImageClick(item.src, item.title)}>
              <img src={item.src} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: hovered === i ? "scale(1.08)" : "scale(1)" }}
                onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${i * 40 + 200},25%,${30 + i * 5}%)`; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem">${fallbackEmoji[i]}</div>`; }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)", opacity: hovered === i ? 1 : 0, transition: "opacity 0.3s" }} />
              <div style={{ position: "absolute", bottom: 14, left: 14, opacity: hovered === i ? 1 : 0, transition: "all 0.3s" }}>
                <span style={{ background: "rgba(201,168,76,0.9)", color: "#fff", padding: "0.2rem 0.65rem", borderRadius: 50, fontSize: "0.72rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: "0.3rem", width: "fit-content" }}>{item.label}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#fff" }}>{item.title}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "2.5rem", opacity: visible ? 1 : 0, transition: "all 0.7s ease 0.5s" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#9ca3af", fontSize: "0.9rem", marginBottom: "1rem" }}>Want to see more photos from our events? Follow us on social media!</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            {socialLinks.map(({ icon, name, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.25rem", borderRadius: 50, border: "1.5px solid rgba(0,0,0,0.1)", background: "rgba(249,248,246,0.9)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.83rem", color: "#374151", cursor: "pointer", transition: "all 0.2s", textDecoration: "none" }}>
                {icon} {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Results ───────────────────────────────────────────────────────────────────
function Results() {
  const [ref, visible] = useInView();
  const events = [
    { title: "Mt. Kenya Day Dash", date: "24th January 2026", available: true },
  ];
  return (
    <section id="results" ref={ref} style={{ padding: "5rem 1.25rem", background: "#f4f3f0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s ease" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "0.75rem" }}>Results & Certificates</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b7280", fontSize: "1rem" }}>Download your certificates and view official event results</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          {[
            { icon: "⬆️", title: "Upload Results", desc: "Event organizers and officials can upload official results and certificates here. Participants will be able to download their certificates once uploaded.", btn: "Upload Official Results", filled: true },
            { icon: "⬇️", title: "Download Certificates", desc: "Participants can search for and download their event certificates and view their official results from completed events.", btn: "Search Your Certificate", filled: false },
          ].map((c, i) => (
            <div key={i} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)", transition: `all 0.7s ease ${i * 0.15}s`, background: "#fff", borderRadius: 24, padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1.25rem" }}>{c.icon}</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#1a1a2e", fontSize: "1.1rem", marginBottom: "0.75rem" }}>{c.title}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b7280", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>{c.desc}</p>
              <button style={{ width: "100%", padding: "0.85rem", background: c.filled ? "linear-gradient(135deg,#C9A84C,#b8962e)" : "transparent", color: c.filled ? "#fff" : "#C9A84C", border: c.filled ? "none" : "1.5px solid #C9A84C", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", transition: "all 0.2s", boxShadow: c.filled ? "0 4px 16px rgba(201,168,76,0.35)" : "none" }}>
                {c.btn}
              </button>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 24, padding: "1.75rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: "1.5rem", overflowX: "auto" }}>
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#1a1a2e", fontSize: "1.1rem", marginBottom: "1.5rem" }}>Recent Event Results</h3>
          {events.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.1rem", background: "#f9f8f6", borderRadius: 14, flexWrap: "wrap", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 40, height: 40, background: "rgba(201,168,76,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>🏆</div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#1a1a2e", fontSize: "0.92rem" }}>{e.title}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#9ca3af", fontSize: "0.78rem", marginTop: 2 }}>{e.date}</div>
                  {e.available && <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#16a34a", fontSize: "0.75rem", fontWeight: 600, marginTop: 2 }}>✓ Results Available</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button style={{ padding: "0.45rem 1rem", border: "1.5px solid rgba(201,168,76,0.4)", background: "transparent", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#C9A84C", fontSize: "0.8rem", cursor: "pointer" }}>
                  View Results
                </button>
                <button style={{ padding: "0.45rem 1rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", border: "none", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#fff", fontSize: "0.8rem", cursor: "pointer" }}>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "1.25rem" }}>
          {[
            { icon: "🥇", title: "Event Medals", desc: "All finishers receive a unique medal commemorating their achievement. Our medals feature the ONE4ONE branding and event-specific details." },
            { icon: "📜", title: "Certificates", desc: "Digital and printable certificates are available for all participants. Download yours from the results portal after the event." },
          ].map((c, i) => (
            <div key={i} style={{ background: "rgba(248,247,244,0.8)", borderRadius: 20, padding: "1.75rem", border: "1px solid rgba(201,168,76,0.12)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{c.icon}</div>
              <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#1a1a2e", fontSize: "1rem", marginBottom: "0.5rem" }}>{c.title}</h4>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.6 }}>{c.desc}</p>
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
  const submit = () => { if (form.name && form.email) { setSent(true); setTimeout(() => setSent(false), 3000); setForm({ name: "", email: "", subject: "", message: "" }); } };

  const socialLinks = [
    { icon: <InstagramIcon size={18} />, url: "https://www.instagram.com/one4one_placeholder" },
    { icon: <FacebookIcon size={18} />, url: "https://www.facebook.com/one4one_placeholder" },
    { icon: <TwitterIcon size={18} />, url: "https://www.twitter.com/one4one_placeholder" },
    { icon: <LinkedInIcon size={18} />, url: "https://www.linkedin.com/company/one4one_placeholder" },
  ];

  return (
    <section id="contact" ref={ref} style={{ padding: "5rem 1.25rem", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all 0.7s ease" }}>
        {/* Stack on mobile, side-by-side on desktop */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem", alignItems: "start" }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,6vw,3rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "1rem" }}>Get In Touch</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b7280", lineHeight: 1.7, marginBottom: "2rem" }}>Have questions about our events? Want to become a sponsor or partner? We'd love to hear from you!</p>
            {[
              { icon: "✉️", label: "Email", content: <a href="mailto:info@one4one.co" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C", fontSize: "0.85rem", textDecoration: "none" }}>info@one4one.co</a> },
              { icon: "📞", label: "Phone", content: <a href="tel:+254722943271" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C", fontSize: "0.85rem", textDecoration: "none" }}>+254 722 943 271</a> },
              { icon: "📍", label: "Location", content: <span style={{ fontFamily: "'DM Sans', sans-serif", color: "#6b7280", fontSize: "0.85rem" }}>Nairobi, Kenya</span> },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#1a1a2e", fontSize: "0.9rem", marginBottom: "0.2rem" }}>{c.label}</div>
                  {c.content}
                </div>
              </div>
            ))}
            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.75rem" }}>Follow us on social media:</p>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ width: 40, height: 40, borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.1)", background: "#f9f8f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", cursor: "pointer", transition: "all 0.2s", textDecoration: "none" }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: "#f9f8f6", borderRadius: 24, padding: "2rem", border: "1px solid rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#1a1a2e", fontSize: "1.2rem", marginBottom: "1.5rem" }}>Send Us a Message</h3>
            {[
              { label: "Full Name", name: "name", placeholder: "John Doe", type: "text" },
              { label: "Email Address", name: "email", placeholder: "john@example.com", type: "email" },
              { label: "Subject", name: "subject", placeholder: "Event Inquiry", type: "text" },
            ].map(f => (
              <div key={f.name} style={{ marginBottom: "1rem" }}>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.83rem", color: "#374151", display: "block", marginBottom: "0.4rem" }}>{f.label}</label>
                <input type={f.type} name={f.name} value={form[f.name]} onChange={handle} placeholder={f.placeholder} style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.1)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", outline: "none", transition: "border-color 0.2s", background: "#fff", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#C9A84C"}
                  onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"} />
              </div>
            ))}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.83rem", color: "#374151", display: "block", marginBottom: "0.4rem" }}>Message</label>
              <textarea name="message" value={form.message} onChange={handle} placeholder="Tell us about your inquiry..." rows={4} style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.1)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", outline: "none", resize: "vertical", transition: "border-color 0.2s", background: "#fff", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#C9A84C"}
                onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"} />
            </div>
            <button onClick={submit} style={{ width: "100%", padding: "1rem", background: sent ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#fff", border: "none", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 20px rgba(201,168,76,0.4)", transition: "all 0.3s" }}>
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
    { icon: <InstagramIcon size={16} />, url: "https://www.instagram.com/one4one_placeholder", label: "Instagram" },
    { icon: <FacebookIcon size={16} />, url: "https://www.facebook.com/one4one_placeholder", label: "Facebook" },
    { icon: <TwitterIcon size={16} />, url: "https://www.twitter.com/one4one_placeholder", label: "Twitter" },
    { icon: <LinkedInIcon size={16} />, url: "https://www.linkedin.com/company/one4one_placeholder", label: "LinkedIn" },
  ];

  // Quick links mapped to section anchors
  const quickLinks = [
    { label: "About Us", href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Gallery", href: "#gallery" },
    { label: "Results", href: "#results" },
  ];

  const eventLinks = [
    { label: "Upcoming Events", href: "#events" },
    { label: "Past Events", href: "#events" },
    { label: "Register", href: "#contact" },
    { label: "Download Certificate", href: "#results" },
  ];

  return (
    <footer style={{ background: "#111827", color: "#fff", padding: "4rem 1.25rem 2rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Responsive footer grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2.5rem", marginBottom: "3rem" }}>
          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(187,174,137,0.15)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                <img src="/media/logo.png" alt="ONE4ONE" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="color:#C9A84C;font-weight:900;font-size:10px;font-family:serif">1·4·1</span>'; }} />
              </div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>ONE4ONE</span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: 240, marginBottom: "1rem" }}>Organizing running, hiking, and tour events across Africa and beyond.</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.2s", textDecoration: "none" }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#fff", marginBottom: "1.25rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Quick Links</h4>
            {quickLinks.map((l, j) => (
              <a key={j} href={l.href}
                style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.83rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.6rem", cursor: "pointer", transition: "color 0.2s", textDecoration: "none" }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}>{l.label}</a>
            ))}
          </div>

          {/* Events */}
          <div>
            <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#fff", marginBottom: "1.25rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Events</h4>
            {eventLinks.map((l, j) => (
              <a key={j} href={l.href}
                style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.83rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.6rem", cursor: "pointer", transition: "color 0.2s", textDecoration: "none" }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}>{l.label}</a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#fff", marginBottom: "1.25rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Contact</h4>
            <a href="mailto:info@one4one.co" style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.83rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.6rem", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#C9A84C"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}>info@one4one.co</a>
            <a href="tel:+254722943271" style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.83rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.6rem", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#C9A84C"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}> +254 722 943 271</a>
            <span style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.83rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.6rem" }}>Nairobi, Kenya</span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>© 2026 ONE4ONE. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
              <span key={l} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [imageModal, setImageModal] = useState(null);
  const [certModal, setCertModal] = useState(null);

  const openImage = (src, alt) => setImageModal({ src, alt });
  const closeImage = () => setImageModal(null);
  const openCert = (cert) => setCertModal(cert);
  const closeCert = () => setCertModal(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        /* CRITICAL: prevent horizontal overflow on all screens */
        html, body { overflow-x: hidden; max-width: 100vw; }
        body { background: #fff; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeInModal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleInModal {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        /* Smooth hover transitions on touch devices */
        @media (hover: none) {
          a, button { -webkit-tap-highlight-color: rgba(201,168,76,0.2); }
        }
      `}</style>
      <Navbar />
      <Hero onImageClick={openImage} />
      <About />
      <WhatWeOrganize />
      <Events onImageClick={openImage} onCertClick={openCert} />
      <Gallery onImageClick={openImage} />
      <Results />
      <Contact />
      <Footer />

      {imageModal && <ImageModal src={imageModal.src} alt={imageModal.alt} onClose={closeImage} />}
      {certModal && <CertificateModal cert={certModal} onClose={closeCert} />}
    </>
  );
}