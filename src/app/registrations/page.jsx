"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { saveAuth, loadAuth, clearAuth } from "../lib/auth";

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = "https://backone.one4one.co";
const STATUSES = ["paid", "failed"];
const PAGE_SIZES = [10, 20, 50, 100];
const SYNE = "'Syne', sans-serif";
const DM = "'DM Sans', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

const STATUS_STYLE = {
    paid: { bg: "rgba(34,197,94,0.12)", fg: "#4ade80", bd: "rgba(34,197,94,0.3)" },
    pending: { bg: "rgba(245,158,11,0.12)", fg: "#fbbf24", bd: "rgba(245,158,11,0.3)" },
    failed: { bg: "rgba(220,38,38,0.12)", fg: "#fca5a5", bd: "rgba(220,38,38,0.3)" },
    cancelled: { bg: "rgba(148,163,184,0.1)", fg: "#cbd5e1", bd: "rgba(148,163,184,0.25)" },
    expired: { bg: "rgba(167,139,250,0.1)", fg: "#c4b5fd", bd: "rgba(167,139,250,0.25)" },
};

// ── Global CSS ────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  html, body { overflow-x: hidden; max-width: 100vw; }
  body { background: #0d0d1a; color: #fff; }
  :root { --gold: #C9A84C; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes navReveal { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes skeletonShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }

  .gold-shimmer {
    background: linear-gradient(90deg, #C9A84C 0%, #e8c96a 40%, #fff8e8 50%, #e8c96a 60%, #C9A84C 100%);
    background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; animation: shimmer 3s linear infinite;
  }
  .nav-link::after {
    content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px; background: #C9A84C;
    transition: width 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .nav-link:hover::after { width: 100%; }
  .reg-row { transition: background 0.2s; cursor: pointer; }
  .reg-row:hover { background: rgba(201,168,76,0.05) !important; }
  .th-sort { cursor: pointer; user-select: none; transition: color 0.2s; }
  .th-sort:hover { color: #C9A84C !important; }
  .skeleton {
    background: linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%);
    background-size: 400px 100%; animation: skeletonShimmer 1.4s ease infinite; border-radius: 10px;
  }
  .chip { transition: all 0.2s; cursor: pointer; }
  select option { background: #0d0d1a; color: #fff; }

  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
  }
  @media (min-width: 769px) {
    .mobile-menu-btn { display: none !important; }
    .mobile-nav-drawer { display: none !important; }
  }
`;

// ── API Layer ─────────────────────────────────────────────────────────────────
class ApiError extends Error {
    constructor(message, status) { super(message); this.status = status; }
}

async function request(path, token) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(json.error || json.message || `Request failed (${res.status})`, res.status);
    return json;
}

function buildQuery(params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) return;
        qs.set(k, Array.isArray(v) ? v.join(",") : String(v));
    });
    return qs.toString();
}

const api = {
    async login(username, email, password) {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });
        if (!res.ok) throw new Error(`Login failed: ${res.status}`);
        const json = await res.json();
        if (json.code !== 200) throw new Error(json.message || "Login failed");
        return { token: json.token, user: { username: json.username, email, role: "admin" } };
    },

    async getEvents(page = 1, limit = 50) {
        const res = await fetch(`${BASE_URL}/api/events?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`);
        const json = await res.json();
        if (json.status !== "success") throw new Error(json.message || "Failed to load events");
        return json.data.events || [];
    },

    getRegistrations(eventId, params, token) {
        return request(`/api/events/${eventId}/registrations?${buildQuery(params)}`, token);
    },

    getRegistration(id, token) {
        return request(`/api/registrations/${id}`, token);
    },
};

// ── Utilities ─────────────────────────────────────────────────────────────────
function fmtDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" });
}
function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
const fmtKES = (n) => `KES ${Number(n || 0).toLocaleString()}`;
const fmtRace = (r) => (r === undefined || r === null || r === "" ? "—" : `${r} km`);
const fmtHeard = (h) => (Array.isArray(h) ? h.join(", ") : h || "—");
const fmtYesNo = (v) => (v ? String(v).charAt(0).toUpperCase() + String(v).slice(1) : "—");

// ── Icons ─────────────────────────────────────────────────────────────────────
const Svg = ({ children, size = 16, sw = 2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const SearchIcon = () => <Svg><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></Svg>;
const RefreshIcon = () => <Svg><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></Svg>;
const DownloadIcon = () => <Svg size={15}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Svg>;
const LogoutIcon = () => <Svg><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Svg>;
const ChevL = () => <Svg size={15} sw={2.5}><path d="M15 18l-6-6 6-6" /></Svg>;
const ChevR = () => <Svg size={15} sw={2.5}><path d="M9 18l6-6-6-6" /></Svg>;
const LockIcon = () => <Svg size={26} sw={1.8}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Svg>;

// ── Small shared components ───────────────────────────────────────────────────
function Spinner({ size = 24, color = "#C9A84C" }) {
    return <div style={{ width: size, height: size, borderRadius: "50%", border: "2px solid rgba(201,168,76,0.15)", borderTopColor: color, animation: "spin 0.75s linear infinite", display: "inline-block", flexShrink: 0 }} />;
}

function Toast({ message, type = "success", onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const bg = type === "error" ? "#7f1d1d" : "rgba(201,168,76,0.15)";
    const border = type === "error" ? "#dc2626" : "#C9A84C";
    return (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 3000, background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "0.9rem 1.25rem", maxWidth: 360, display: "flex", alignItems: "center", gap: "0.75rem", animation: "fadeUp 0.3s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            <span>{type === "error" ? "⚠️" : "✓"}</span>
            <span style={{ fontFamily: DM, fontSize: "0.85rem", color: "#fff", flex: 1 }}>{message}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1rem", padding: 0 }}>✕</button>
        </div>
    );
}

function FormField({ label, children }) {
    return (
        <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontFamily: SYNE, fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "0.45rem" }}>{label}</label>
            {children}
        </div>
    );
}

const inputStyle = {
    width: "100%", padding: "0.65rem 0.9rem", background: "#0d0d1a",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff",
    fontFamily: DM, fontSize: "0.88rem", outline: "none", transition: "border-color 0.2s",
};

const goldBtn = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
    padding: "0.7rem 1.4rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a",
    border: "none", borderRadius: 6, fontFamily: SYNE, fontWeight: 700, fontSize: "0.76rem",
    cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
};

function StatusBadge({ status }) {
    const s = STATUS_STYLE[status] || STATUS_STYLE.cancelled;
    return (
        <span style={{ display: "inline-block", padding: "0.18rem 0.7rem", borderRadius: 3, background: s.bg, color: s.fg, border: `1px solid ${s.bd}`, fontFamily: SYNE, fontWeight: 700, fontSize: "0.63rem", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {status || "—"}
        </span>
    );
}

// ── Auth Modal (login only — admin access) ────────────────────────────────────
function AuthModal({ onClose, onSuccess, showToast }) {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [focus, setFocus] = useState(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
    const dyn = (f) => ({ ...inputStyle, borderColor: focus === f ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.12)" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, password } = form;
        if (!username.trim() || !email.trim() || !password.trim()) { showToast("All fields are required", "error"); return; }
        if (!/^\S+@\S+\.\S+$/.test(email)) { showToast("Please enter a valid email", "error"); return; }
        setLoading(true);
        try {
            const { token, user } = await api.login(username, email, password);
            showToast(`Welcome, ${user.username}!`, "success");
            onSuccess({ token, user });
        } catch (err) {
            showToast(err.message || "Login failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2500, background: "rgba(5,5,15,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: "1rem" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 16, padding: "2.2rem", width: "100%", maxWidth: 460, animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem" }}>
                    <div>
                        <div style={{ fontFamily: SYNE, fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Admin Access</div>
                        <h3 style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>Sign In</h3>
                    </div>
                    <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer" }}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <FormField label="Username"><input value={form.username} onChange={set("username")} onFocus={() => setFocus("u")} onBlur={() => setFocus(null)} placeholder="Your username" style={dyn("u")} autoComplete="username" /></FormField>
                    <FormField label="Email"><input type="email" value={form.email} onChange={set("email")} onFocus={() => setFocus("e")} onBlur={() => setFocus(null)} placeholder="you@example.com" style={dyn("e")} autoComplete="email" /></FormField>
                    <FormField label="Password"><input type="password" value={form.password} onChange={set("password")} onFocus={() => setFocus("p")} onBlur={() => setFocus(null)} placeholder="••••••••" style={dyn("p")} autoComplete="current-password" /></FormField>
                    <button type="submit" disabled={loading} style={{ ...goldBtn, width: "100%", marginTop: "1rem", padding: "0.9rem", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                        {loading ? <Spinner size={16} color="#0d0d1a" /> : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ isAuthenticated, user, onLogout, onLoginClick }) {
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
        { label: "About", href: "/#about" },
        { label: "Events", href: "/#events" },
        { label: "Gallery", href: "/gallery" },
        { label: "Results", href: "/results" },
        { label: "Blogs", href: "/blogs" },
        ...(isAuthenticated ? [{ label: "Registrations", href: "/registrations" }] : []),
    ];
    const linkColor = (l) => (l.href === "/registrations" ? "#C9A84C" : "rgba(255,255,255,0.75)");

    return (
        <>
            <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, background: scrolled ? "rgba(10,10,20,0.94)" : "rgba(10,10,20,0.6)", backdropFilter: "blur(20px)", borderBottom: scrolled ? "1px solid rgba(201,168,76,0.12)" : "1px solid rgba(255,255,255,0.04)", transition: "all 0.5s", animation: mounted ? "navReveal 0.8s cubic-bezier(0.16,1,0.3,1)" : "none", maxWidth: "100vw", overflow: "hidden" }}>
                <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 74 }}>
                    <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                        <div style={{ width: 200, height: 86, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src="/media/logo4.png" alt="ONE4ONE" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:1.1rem;color:#C9A84C;letter-spacing:0.05em">1·4·1</span>'; }} />
                        </div>
                    </a>
                    <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                        {links.map((l) => (
                            <a key={l.label} href={l.href} className="nav-link" style={{ position: "relative", fontFamily: SYNE, fontSize: "0.8rem", fontWeight: 600, color: linkColor(l), textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.2s" }}
                                onMouseEnter={(e) => (e.target.style.color = "#C9A84C")}
                                onMouseLeave={(e) => (e.target.style.color = linkColor(l))}>{l.label}</a>
                        ))}
                        {isAuthenticated ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <span style={{ fontFamily: DM, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>{user?.username}</span>
                                <button onClick={onLogout} title="Logout" style={{ width: 36, height: 36, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><LogoutIcon /></button>
                            </div>
                        ) : (
                            <button onClick={onLoginClick} style={goldBtn}>Admin Login</button>
                        )}
                    </div>
                    <button className="mobile-menu-btn" onClick={() => setMenuOpen((o) => !o)} style={{ flexDirection: "column", justifyContent: "center", alignItems: "flex-end", gap: 5, width: 44, height: 44, background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem" }}>
                        <span style={{ display: "block", width: 24, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
                        <span style={{ display: "block", width: 18, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
                        <span style={{ display: "block", width: 12, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
                    </button>
                </div>
            </nav>

            <div className="mobile-nav-drawer" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(300px, 85vw)", zIndex: 490, background: "rgba(8,8,20,0.99)", backdropFilter: "blur(30px)", transform: menuOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)", borderLeft: "1px solid rgba(201,168,76,0.12)", padding: "5.5rem 2rem 2rem" }}>
                {links.map((l) => (
                    <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: "block", fontFamily: SYNE, fontSize: "1.1rem", fontWeight: 600, color: linkColor(l), textDecoration: "none", padding: "0.9rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{l.label}</a>
                ))}
                {isAuthenticated ? (
                    <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: DM, color: "rgba(255,255,255,0.6)" }}>{user?.username}</span>
                        <button onClick={() => { setMenuOpen(false); onLogout(); }} style={{ background: "none", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5", padding: "0.3rem 0.8rem", borderRadius: 4, fontFamily: SYNE, fontSize: "0.7rem", cursor: "pointer" }}>Logout</button>
                    </div>
                ) : (
                    <button onClick={() => { setMenuOpen(false); onLoginClick(); }} style={{ ...goldBtn, width: "100%", marginTop: "1.25rem" }}>Admin Login</button>
                )}
            </div>
            {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 480, background: "rgba(0,0,0,0.5)" }} />}
        </>
    );
}

// ── Page Hero ─────────────────────────────────────────────────────────────────
function PageHero() {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => { setTimeout(() => setLoaded(true), 150); }, []);
    return (
        <section style={{ position: "relative", height: "40vh", minHeight: 300, overflow: "hidden", background: "#080812", display: "flex", alignItems: "flex-end" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 30%, rgba(201,168,76,0.1) 0%, transparent 55%), linear-gradient(to bottom, #080812 0%, #0d0d1a 100%)" }} />
            <div style={{ position: "absolute", left: "1.5rem", top: "20%", bottom: "20%", width: 1, background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5), transparent)" }} />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", padding: "0 2rem 3rem 3rem", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", opacity: loaded ? 1 : 0, transition: "all 0.7s 0.1s" }}>
                    <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
                    <span style={{ fontFamily: SYNE, fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Admin Dashboard</span>
                </div>
                <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2.6rem, 7vw, 4.8rem)", fontWeight: 700, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.02em", opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.8s 0.2s cubic-bezier(0.16,1,0.3,1)" }}>
                    Registered <span className="gold-shimmer">Runners</span>
                </h1>
            </div>
        </section>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, loading, accent = "#C9A84C" }) {
    return (
        <div style={{ flex: "1 1 200px", padding: "1.25rem 1.5rem", borderRadius: 14, background: "#111122", border: "1px solid rgba(255,255,255,0.07)", borderTop: `2px solid ${accent}` }}>
            <div style={{ fontFamily: SYNE, fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.6rem" }}>{label}</div>
            {loading ? <div className="skeleton" style={{ height: 34, width: 100 }} /> : (
                <div style={{ fontFamily: SERIF, fontSize: "2.1rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{value}</div>
            )}
            {sub && <div style={{ fontFamily: DM, fontSize: "0.74rem", color: "rgba(255,255,255,0.3)", marginTop: "0.5rem" }}>{sub}</div>}
        </div>
    );
}

// ── Registration Detail Modal ─────────────────────────────────────────────────
function DetailModal({ row, token, onClose, onUnauthorized }) {
    const [data, setData] = useState(row);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    }, [onClose]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const full = await api.getRegistration(row.id, token);
                if (!cancelled) setData(full);
            } catch (e) {
                if (cancelled) return;
                if (e.status === 401 || e.status === 403) { onUnauthorized(); return; }
                setErr(e.status === 404 ? "Registration not found." : e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [row.id, token]); // eslint-disable-line react-hooks/exhaustive-deps

    const fields = [
        ["Full Name", data.full_name], ["Email", data.email || "—"], ["Phone", data.phone_number || "—"],
        ["Ticket No.", data.ticket_no || "—"], ["Tickets Bought", data.tickets_bought ?? "—"], ["Amount", fmtKES(data.amount)],
        ["Race", fmtRace(data.race)], ["Recovery Games", fmtYesNo(data.recovery_games)], ["Heard About Us", fmtHeard(data.how_did_you_hear)],
        ["M-Pesa Receipt", data.mpesa_receipt || "—"], ["Checkout Request ID", data.checkout_request_id || "—"], ["Registration ID", data.id],
        ["Registered At", fmtDateTime(data.created_at)], ["Paid At", fmtDateTime(data.paid_at)], ["Last Updated", fmtDateTime(data.updated_at)],
    ];

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5,5,15,0.85)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.2s ease" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "min(640px, 95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden", background: "#111122", border: "1px solid rgba(201,168,76,0.2)", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ padding: "1.4rem 1.75rem", background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(13,13,26,0.9))", borderBottom: "1px solid rgba(201,168,76,0.12)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                    <div>
                        <div style={{ fontFamily: SYNE, fontSize: "0.65rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Registration Details</div>
                        <div style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: "0.5rem" }}>{data.full_name}</div>
                        <StatusBadge status={data.status} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        {loading && <Spinner size={18} />}
                        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", cursor: "pointer" }}>✕</button>
                    </div>
                </div>
                <div style={{ padding: "1.5rem 1.75rem", overflowY: "auto" }}>
                    {err && <div style={{ marginBottom: "1rem", padding: "0.7rem 1rem", borderRadius: 8, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#fca5a5", fontFamily: DM, fontSize: "0.8rem" }}>{err} Showing the details from the list instead.</div>}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.1rem 1.5rem" }}>
                        {fields.map(([k, v]) => (
                            <div key={k} style={{ minWidth: 0 }}>
                                <div style={{ fontFamily: SYNE, fontSize: "0.62rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{k}</div>
                                <div style={{ fontFamily: DM, fontSize: "0.88rem", color: "#fff", wordBreak: "break-all" }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const DEFAULT_FILTERS = { q: "", status: [], from: "", to: "", dateField: "created_at", sort: "created_at", order: "desc" };

export default function RegistrationsPage() {
    // Auth
    const [authReady, setAuthReady] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [authUser, setAuthUser] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [toast, setToast] = useState(null);

    // Events
    const [events, setEvents] = useState([]);
    const [eventId, setEventId] = useState("");

    // Query state
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    // Data
    const [rows, setRows] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });
    const [filteredAmount, setFilteredAmount] = useState(0);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [exportPct, setExportPct] = useState(0);
    const reqId = useRef(0);

    const showToast = useCallback((message, type = "success") => setToast({ message, type, id: Date.now() }), []);

    // Restore saved login on mount
    useEffect(() => {
        const saved = loadAuth();
        if (saved.token) { setAuthToken(saved.token); setAuthUser(saved.user); }
        else setShowAuth(true);
        setAuthReady(true);
    }, []);

    const handleUnauthorized = useCallback(() => {
        clearAuth();
        setAuthToken(null);
        setAuthUser(null);
        setRows([]);
        setStats(null);
        setSelected(null);
        setShowAuth(true);
        showToast("Session expired. Please sign in again.", "error");
    }, [showToast]);

    const handleLoginSuccess = ({ token, user }) => {
        saveAuth(token, user);
        setAuthToken(token);
        setAuthUser(user);
        setShowAuth(false);
    };

    const handleLogout = () => {
        clearAuth();
        setAuthToken(null);
        setAuthUser(null);
        setRows([]);
        setStats(null);
        setEventId("");
        setShowAuth(true);
        showToast("Logged out successfully", "success");
    };

    // Load events (only once logged in)
    useEffect(() => {
        if (!authToken) return;
        let cancelled = false;
        (async () => {
            try {
                const list = await api.getEvents();
                if (cancelled) return;
                const sorted = [...list].sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
                setEvents(sorted);
                // Default: nearest upcoming event, otherwise the most recent one
                const now = Date.now();
                const upcoming = sorted.filter((e) => e.event_date && new Date(e.event_date).getTime() >= now);
                const pick = upcoming.length ? upcoming[upcoming.length - 1] : sorted[0];
                if (pick) setEventId((cur) => cur || pick.id);
            } catch (err) {
                if (!cancelled) setError(err.message || "Failed to load events");
            }
        })();
        return () => { cancelled = true; };
    }, [authToken]);

    // Debounce search box -> filters.q
    useEffect(() => {
        const t = setTimeout(() => {
            setFilters((f) => (f.q === searchInput.trim() ? f : { ...f, q: searchInput.trim() }));
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const dateError = filters.from && filters.to && filters.from > filters.to ? "'From' date must be on or before 'To' date." : null;

    const queryParams = useCallback((pg, lm) => ({
        status: filters.status, q: filters.q, from: filters.from, to: filters.to,
        date_field: filters.dateField, sort: filters.sort, order: filters.order, page: pg, limit: lm,
    }), [filters]);

    // Main table data
    const load = useCallback(async () => {
        if (!authToken || !eventId || dateError) return;
        const id = ++reqId.current;
        setLoading(true);
        setError(null);
        try {
            const params = queryParams(page, limit);
            const onlyPaid = filters.status.length === 1 && filters.status[0] === "paid";
            const onlyFailed = filters.status.length === 1 && filters.status[0] === "failed";
            const [json, paidJson] = await Promise.all([
                api.getRegistrations(eventId, params, authToken),
                onlyPaid || onlyFailed
                    ? Promise.resolve(null)
                    : api.getRegistrations(eventId, { ...params, status: ["paid"], page: 1, limit: 1 }, authToken),
            ]);
            if (id !== reqId.current) return;
            setRows(json.data || []);
            setPagination(json.pagination || { page, limit, total: 0, total_pages: 1 });
            setFilteredAmount(onlyFailed ? 0 : onlyPaid ? (json.total_amount || 0) : (paidJson?.total_amount || 0));
        } catch (err) {
            if (id !== reqId.current) return;
            if (err.status === 401 || err.status === 403) { handleUnauthorized(); return; }
            setError(err.message || "Failed to load registrations");
        } finally {
            if (id === reqId.current) setLoading(false);
        }
    }, [authToken, eventId, queryParams, page, limit, dateError, handleUnauthorized]);

    useEffect(() => { load(); }, [load]);

    // Summary cards (unfiltered, per event)
    const loadStats = useCallback(async () => {
        if (!authToken || !eventId) return;
        setStatsLoading(true);
        try {
            const [all, paid, failed] = await Promise.all([
                api.getRegistrations(eventId, { page: 1, limit: 1 }, authToken),
                api.getRegistrations(eventId, { status: "paid", page: 1, limit: 1 }, authToken),
                api.getRegistrations(eventId, { status: "failed", page: 1, limit: 1 }, authToken),
            ]);
            setStats({
                total: all.pagination?.total ?? 0,
                paid: paid.pagination?.total ?? 0,
                failed: failed.pagination?.total ?? 0,
                collected: paid.total_amount ?? 0,
            });
        } catch (err) {
            if (err.status === 401 || err.status === 403) handleUnauthorized();
            else setStats(null);
        } finally {
            setStatsLoading(false);
        }
    }, [authToken, eventId, handleUnauthorized]);

    useEffect(() => { loadStats(); }, [loadStats]);

    // Handlers
    const updateFilter = (patch) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); };
    const toggleStatus = (s) => updateFilter({ status: filters.status.includes(s) ? [] : [s] });
    const resetFilters = () => { setFilters(DEFAULT_FILTERS); setSearchInput(""); setPage(1); };
    const changeEvent = (id) => { setEventId(id); resetFilters(); };
    const toggleSort = (col) => {
        if (filters.sort === col) updateFilter({ order: filters.order === "desc" ? "asc" : "desc" });
        else updateFilter({ sort: col, order: col === "full_name" ? "asc" : "desc" });
    };
    const refreshAll = () => { load(); loadStats(); };

    const hasActiveFilters = filters.q || filters.status.length || filters.from || filters.to;
    const currentEvent = events.find((e) => e.id === eventId);

    // Export to Excel — fetches EVERY page matching the current filters
    const handleExport = async () => {
        if (!eventId || exporting || dateError) return;
        setExporting(true);
        setExportPct(0);
        try {
            const all = [];
            let p = 1, totalPages = 1, totalAmount = 0;
            do {
                const json = await api.getRegistrations(eventId, queryParams(p, 100), authToken);
                all.push(...(json.data || []));
                totalPages = json.pagination?.total_pages || 1;
                totalAmount = json.total_amount ?? totalAmount;
                setExportPct(Math.round((p / totalPages) * 100));
                p++;
            } while (p <= totalPages);

            if (!all.length) { showToast("No registrations match the current filters.", "error"); return; }

            const XLSX = await import("xlsx");
            const sheetRows = all.map((r, i) => ({
                "#": i + 1,
                "Full Name": r.full_name || "",
                "Email": r.email || "",
                "Phone": r.phone_number || "",
                "Tickets": r.tickets_bought ?? "",
                "Race (km)": r.race ?? "",
                "Recovery Games": fmtYesNo(r.recovery_games) === "—" ? "" : fmtYesNo(r.recovery_games),
                "How They Heard": fmtHeard(r.how_did_you_hear) === "—" ? "" : fmtHeard(r.how_did_you_hear),
                "Amount (KES)": Number(r.amount || 0),
                "Status": r.status || "",
                "Ticket No.": r.ticket_no || "",
                "M-Pesa Receipt": r.mpesa_receipt || "",
                "Registered At": r.created_at ? fmtDateTime(r.created_at) : "",
                "Paid At": r.paid_at ? fmtDateTime(r.paid_at) : "",
            }));

            const wsData = XLSX.utils.json_to_sheet(sheetRows);
            wsData["!cols"] = [6, 24, 28, 16, 8, 10, 15, 22, 13, 11, 16, 16, 22, 22].map((w) => ({ wch: w }));

            const filterText = [
                filters.q && `Search: "${filters.q}"`,
                filters.status.length && `Status: ${filters.status.join(", ")}`,
                filters.from && `${filters.dateField === "paid_at" ? "Paid" : "Registered"} from: ${filters.from}`,
                filters.to && `${filters.dateField === "paid_at" ? "Paid" : "Registered"} to: ${filters.to}`,
            ].filter(Boolean).join(" | ") || "None (all registrations)";

            const summary = [
                ["ONE4ONE — Registrations Report"],
                [],
                ["Event", currentEvent?.title || ""],
                ["Generated", fmtDateTime(new Date().toISOString())],
                ["Filters applied", filterText],
                ["Registrations in report", all.length],

                ["Amount collected (KES)", all.filter((r) => r.status === "paid").reduce((s, r) => s + Number(r.amount || 0), 0)],
            ];
            const wsSummary = XLSX.utils.aoa_to_sheet(summary);
            wsSummary["!cols"] = [{ wch: 30 }, { wch: 60 }];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
            XLSX.utils.book_append_sheet(wb, wsData, "Registrations");

            const safeTitle = (currentEvent?.title || "event").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
            XLSX.writeFile(wb, `${safeTitle}-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`);
            showToast(`Exported ${all.length} registration${all.length !== 1 ? "s" : ""} to Excel`, "success");
        } catch (err) {
            if (err.status === 401 || err.status === 403) handleUnauthorized();
            else showToast(err.message || "Export failed", "error");
        } finally {
            setExporting(false);
            setExportPct(0);
        }
    };

    // Pagination helpers
    const pageNumbers = useMemo(() => {
        const total = pagination.total_pages || 1;
        const cur = pagination.page || page;
        const start = Math.max(1, Math.min(cur - 2, total - 4));
        const end = Math.min(total, start + 4);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [pagination, page]);

    const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
    const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);

    const SortHead = ({ col, label, align = "left" }) => {
        const active = filters.sort === col;
        return (
            <th className="th-sort" onClick={() => toggleSort(col)} style={{ ...thStyle, textAlign: align, color: active ? "#C9A84C" : "rgba(255,255,255,0.35)" }}>
                {label} {active ? (filters.order === "desc" ? "↓" : "↑") : <span style={{ opacity: 0.3 }}>↕</span>}
            </th>
        );
    };

    // ── Render: gate ──
    if (!authReady) {
        return (<><style>{GLOBAL_CSS}</style><div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner size={36} /></div></>);
    }

    if (!authToken) {
        return (
            <>
                <style>{GLOBAL_CSS}</style>
                <Navbar isAuthenticated={false} user={null} onLogout={handleLogout} onLoginClick={() => setShowAuth(true)} />
                <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "6rem 1.5rem 2rem", textAlign: "center" }}>
                    <div style={{ maxWidth: 420 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 1.5rem", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C" }}><LockIcon /></div>
                        <h1 style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>Admin Access Required</h1>
                        <p style={{ fontFamily: DM, color: "rgba(255,255,255,0.45)", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: "1.75rem" }}>This page shows registered runners and is only available to ONE4ONE administrators. Please sign in to continue.</p>
                        <button onClick={() => setShowAuth(true)} style={goldBtn}>Admin Login</button>
                    </div>
                </div>
                {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleLoginSuccess} showToast={showToast} />}
                {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </>
        );
    }

    // ── Render: dashboard ──
    return (
        <>
            <style>{GLOBAL_CSS}</style>
            <Navbar isAuthenticated user={authUser} onLogout={handleLogout} onLoginClick={() => setShowAuth(true)} />
            <PageHero />

            <section style={{ padding: "2.5rem 1.5rem 6rem", background: "#0d0d1a", minHeight: "60vh" }}>
                <div style={{ maxWidth: 1320, margin: "0 auto" }}>

                    {/* Event selector + actions */}
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1.25rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
                        <div style={{ minWidth: 260, flex: "0 1 420px" }}>
                            <FormField label="Event">
                                <select value={eventId} onChange={(e) => changeEvent(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                                    {events.length === 0 && <option value="">Loading events…</option>}
                                    {events.map((ev) => (
                                        <option key={ev.id} value={ev.id}>{ev.title}{ev.event_date ? ` — ${fmtDate(ev.event_date)}` : ""}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>
                        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem" }}>
                            <button onClick={refreshAll} title="Refresh" style={{ width: 42, height: 42, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.45)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><RefreshIcon /></button>
                            <button onClick={handleExport} disabled={exporting || !eventId || !!dateError} style={{ ...goldBtn, height: 42, opacity: exporting || !eventId || dateError ? 0.6 : 1, cursor: exporting ? "wait" : "pointer" }}>
                                {exporting ? <><Spinner size={15} color="#0d0d1a" /> Exporting {exportPct}%</> : <><DownloadIcon /> Export to Excel</>}
                            </button>
                        </div>
                    </div>

                    {/* Summary cards */}
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                        <StatCard label="Total Registered" value={stats?.total ?? "—"} sub="All statuses" loading={statsLoading} />
                        <StatCard label="Paid" value={stats?.paid ?? "—"} sub="Payment confirmed" loading={statsLoading} accent="#4ade80" />
                        <StatCard label="Failed" value={stats?.failed ?? "—"} sub="Registration not completed" loading={statsLoading} accent="#fca5a5" />
                        <StatCard label="Collected" value={stats ? fmtKES(stats.collected) : "—"} sub="From paid registrations" loading={statsLoading} accent="#C9A84C" />
                    </div>

                    {/* Filters */}
                    <div style={{ padding: "1.25rem 1.5rem", borderRadius: 16, background: "#111122", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.25rem" }}>
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                            <div style={{ flex: "2 1 280px", position: "relative" }}>
                                <label style={labelStyle}>Search</label>
                                <div style={{ position: "absolute", left: "0.9rem", bottom: "0.75rem", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}><SearchIcon /></div>
                                <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Name, email, phone or ticket no." style={{ ...inputStyle, paddingLeft: "2.5rem" }} />
                            </div>
                            <div style={{ flex: "1 1 150px" }}>
                                <label style={labelStyle}>Date based on</label>
                                <select value={filters.dateField} onChange={(e) => updateFilter({ dateField: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                                    <option value="created_at">Registration date</option>
                                    <option value="paid_at">Payment date</option>
                                </select>
                            </div>
                            <div style={{ flex: "1 1 140px" }}>
                                <label style={labelStyle}>From</label>
                                <input type="date" value={filters.from} onChange={(e) => updateFilter({ from: e.target.value })} style={{ ...inputStyle, colorScheme: "dark" }} />
                            </div>
                            <div style={{ flex: "1 1 140px" }}>
                                <label style={labelStyle}>To</label>
                                <input type="date" value={filters.to} onChange={(e) => updateFilter({ to: e.target.value })} style={{ ...inputStyle, colorScheme: "dark" }} />
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "1.1rem" }}>
                            <span style={{ ...labelStyle, marginBottom: 0, marginRight: "0.4rem" }}>Status</span>
                            {STATUSES.map((s) => {
                                const on = filters.status.includes(s);
                                const st = STATUS_STYLE[s];
                                return (
                                    <button key={s} className="chip" onClick={() => toggleStatus(s)} style={{ padding: "0.38rem 0.9rem", borderRadius: 4, border: `1px solid ${on ? st.fg : "rgba(255,255,255,0.12)"}`, background: on ? st.bg : "transparent", color: on ? st.fg : "rgba(255,255,255,0.45)", fontFamily: SYNE, fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s}</button>
                                );
                            })}
                            {hasActiveFilters && (
                                <button onClick={resetFilters} style={{ marginLeft: "auto", background: "none", border: "none", color: "#C9A84C", fontFamily: SYNE, fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", textDecoration: "underline" }}>Clear filters</button>
                            )}
                        </div>
                        {dateError && <div style={{ marginTop: "0.9rem", color: "#fca5a5", fontFamily: DM, fontSize: "0.8rem" }}>⚠️ {dateError}</div>}
                    </div>

                    {/* Result summary line */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.9rem" }}>
                        <div style={{ fontFamily: DM, fontSize: "0.85rem", color: "rgba(255,255,255,0.45)" }}>
                            <strong style={{ color: "#C9A84C", fontFamily: SERIF, fontSize: "1.2rem" }}>{pagination.total}</strong> {hasActiveFilters ? "matching" : ""} registration{pagination.total !== 1 ? "s" : ""}
                            <span style={{ margin: "0 0.6rem", opacity: 0.3 }}>•</span>
                            <strong style={{ color: "#C9A84C", fontFamily: SERIF, fontSize: "1.2rem" }}>{fmtKES(filteredAmount)}</strong> collected
                        </div>
                        <div style={{ fontFamily: DM, fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>Click a row for full details</div>
                    </div>

                    {/* Table */}
                    <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "#111122", overflow: "hidden" }}>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", minWidth: 1080, borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                                        <th style={thStyle}>#</th>
                                        <SortHead col="full_name" label="Runner" />
                                        <th style={thStyle}>Phone</th>
                                        <th style={thStyle}>Race</th>
                                        <th style={thStyle}>Tickets</th>
                                        <th style={thStyle}>Recovery</th>
                                        <SortHead col="amount" label="Amount" align="right" />
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Ticket No.</th>
                                        <SortHead col="created_at" label="Registered" />
                                        <SortHead col="paid_at" label="Paid" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && rows.length === 0 && Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i}><td colSpan={11} style={{ padding: "0.7rem 1rem" }}><div className="skeleton" style={{ height: 26 }} /></td></tr>
                                    ))}
                                    {rows.map((r, i) => (
                                        <tr key={r.id} className="reg-row" onClick={() => setSelected(r)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}>
                                            <td style={{ ...tdStyle, color: "rgba(255,255,255,0.3)", fontFamily: SERIF, fontWeight: 700, fontSize: "1rem" }}>{(pagination.page - 1) * pagination.limit + i + 1}</td>
                                            <td style={tdStyle}>
                                                <div style={{ fontFamily: SYNE, fontWeight: 700, fontSize: "0.86rem", color: "#fff" }}>{r.full_name}</div>
                                                <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{r.email || "—"}</div>
                                            </td>
                                            <td style={tdStyle}>{r.phone_number || "—"}</td>
                                            <td style={tdStyle}>{fmtRace(r.race)}</td>
                                            <td style={tdStyle}>{r.tickets_bought ?? "—"}</td>
                                            <td style={tdStyle}>{fmtYesNo(r.recovery_games)}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", color: "#C9A84C", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtKES(r.amount)}</td>
                                            <td style={tdStyle}><StatusBadge status={r.status} /></td>
                                            <td style={{ ...tdStyle, fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>{r.ticket_no || "—"}</td>
                                            <td style={{ ...tdStyle, fontSize: "0.78rem", whiteSpace: "nowrap" }}>{fmtDateTime(r.created_at)}</td>
                                            <td style={{ ...tdStyle, fontSize: "0.78rem", whiteSpace: "nowrap" }}>{fmtDateTime(r.paid_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {!loading && error && (
                            <div style={{ padding: "2.5rem", textAlign: "center" }}>
                                <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>⚠️</div>
                                <p style={{ fontFamily: DM, color: "rgba(255,255,255,0.45)", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</p>
                                <button onClick={refreshAll} style={goldBtn}><RefreshIcon /> Retry</button>
                            </div>
                        )}
                        {!loading && !error && eventId && rows.length === 0 && (
                            <div style={{ padding: "3.5rem 1.5rem", textAlign: "center" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", opacity: 0.5 }}>🏃</div>
                                <p style={{ fontFamily: SERIF, fontSize: "1.3rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.3rem" }}>{hasActiveFilters ? "No registrations match these filters" : "No registrations yet for this event"}</p>
                                <p style={{ fontFamily: DM, fontSize: "0.82rem", color: "rgba(255,255,255,0.25)" }}>{hasActiveFilters ? "Try adjusting or clearing the filters." : "Registered runners will appear here as they sign up."}</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.total > 0 && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", fontFamily: DM, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                                    <span>Showing {showingFrom}–{showingTo} of {pagination.total}</span>
                                    <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} style={{ ...inputStyle, width: "auto", padding: "0.35rem 0.6rem", fontSize: "0.78rem", cursor: "pointer" }}>
                                        {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} / page</option>)}
                                    </select>
                                </div>
                                <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pagination.page <= 1} style={pageBtn(false, pagination.page <= 1)}><ChevL /></button>
                                    {pageNumbers.map((n) => (
                                        <button key={n} onClick={() => setPage(n)} style={pageBtn(n === pagination.page, false)}>{n}</button>
                                    ))}
                                    <button onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))} disabled={pagination.page >= pagination.total_pages} style={pageBtn(false, pagination.page >= pagination.total_pages)}><ChevR /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <footer style={{ background: "#080810", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "2.5rem 1.5rem" }}>
                <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1rem", color: "rgba(255,255,255,0.6)" }}>ONE4ONE</span>
                        <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)" }} />
                        <span style={{ fontFamily: DM, fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>Registrations</span>
                    </div>
                    <p style={{ fontFamily: DM, fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>© 2026 ONE4ONE. All rights reserved.</p>
                    <a href="/" style={{ fontFamily: SYNE, fontSize: "0.75rem", fontWeight: 700, color: "#C9A84C", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>← Back to Home</a>
                </div>
            </footer>

            {selected && <DetailModal row={selected} token={authToken} onClose={() => setSelected(null)} onUnauthorized={handleUnauthorized} />}
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleLoginSuccess} showToast={showToast} />}
            {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}

// ── Shared table/label styles ─────────────────────────────────────────────────
const labelStyle = { fontFamily: SYNE, fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "0.45rem" };
const thStyle = { fontFamily: SYNE, fontWeight: 700, fontSize: "0.64rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", padding: "0.9rem 1rem", textAlign: "left", whiteSpace: "nowrap" };
const tdStyle = { padding: "0.9rem 1rem", fontFamily: DM, fontSize: "0.84rem", color: "rgba(255,255,255,0.75)", verticalAlign: "middle" };
const pageBtn = (active, disabled) => ({
    minWidth: 34, height: 34, padding: "0 0.5rem", borderRadius: 6,
    border: `1px solid ${active ? "#C9A84C" : "rgba(255,255,255,0.1)"}`,
    background: active ? "rgba(201,168,76,0.15)" : "transparent",
    color: active ? "#C9A84C" : "rgba(255,255,255,0.5)",
    fontFamily: SYNE, fontWeight: 700, fontSize: "0.74rem",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1,
    display: "flex", alignItems: "center", justifyContent: "center",
});