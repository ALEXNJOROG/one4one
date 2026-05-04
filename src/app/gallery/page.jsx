"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = "https://backone.one4one.co";

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
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes skeletonShimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
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

  .skeleton {
    background: linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%);
    background-size: 400px 100%;
    animation: skeletonShimmer 1.4s ease infinite;
    border-radius: 10px;
  }

  .event-row { transition: background 0.2s; }
  .event-row:hover { background: rgba(201,168,76,0.05) !important; }

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
const api = {
  async signup(username, email, password) {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error(`Signup failed: ${res.status}`);
    const json = await res.json();
    if (json.code !== 201) throw new Error(json.message || "Signup failed");
    return json.data;
  },

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
    return json.data;
  },

  async getEventById(eventId) {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}`);
    if (!res.ok) throw new Error(`Event fetch failed: ${res.status}`);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Failed to load event");
    return json.data;
  },

  async createEvent(payload, token) {
    const res = await fetch(`${BASE_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create event failed: ${res.status}`);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Create failed");
    return json.data;
  },

  async updateEvent(eventId, payload, token) {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Update event failed: ${res.status}`);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Update failed");
    return json.data;
  },

  async deleteEvent(eventId, token) {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`Delete event failed: ${res.status}`);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Delete failed");
    return json;
  },

  async getEventMedia(eventId, fileType = null, page = 1, limit = 100) {
    let url = `${BASE_URL}/api/events/${eventId}/media?page=${page}&limit=${limit}`;
    if (fileType) url += `&file_type=${fileType}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Media fetch failed: ${res.status}`);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Failed to load media");
    return json.data;
  },

  async getEventMediaStats(eventId) {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}/media/stats`);
    if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Failed to load stats");
    return json.data;
  },

  async uploadMedia(eventId, file, fileType, token) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);
    const res = await fetch(`${BASE_URL}/api/events/${eventId}/media/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Upload failed");
    return json.data;
  },

  async deleteMedia(mediaId, token) {
    const res = await fetch(`${BASE_URL}/api/media/${mediaId}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    return res.json();
  },
};

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

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0];
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function guessLabel(event) {
  const t = (event.title || "").toLowerCase();
  if (t.includes("run") || t.includes("loop") || t.includes("marathon") || t.includes("5k") || t.includes("10k")) return "Running";
  if (t.includes("hik") || t.includes("trek") || t.includes("mountain") || t.includes("kenya") || t.includes("dash")) return "Hiking";
  if (t.includes("tour") || t.includes("trip") || t.includes("travel")) return "Tour";
  return "Event";
}

const FALLBACK_EMOJIS = ["🏃", "🌅", "⛰️", "🥾", "📸", "🏁", "👥", "💧", "🧗", "🗺️", "🏅", "🤝"];

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
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
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
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size = 24, color = "#C9A84C" }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", border: `2px solid rgba(201,168,76,0.15)`, borderTopColor: color, animation: "spin 0.75s linear infinite", display: "inline-block", flexShrink: 0 }} />
  );
}

// ── Skeleton Cards ────────────────────────────────────────────────────────────
function SkeletonGrid({ count = 8 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 220, borderRadius: 10 }} />
      ))}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "error" ? "#7f1d1d" : type === "success" ? "rgba(201,168,76,0.15)" : "#1e293b";
  const border = type === "error" ? "#dc2626" : "#C9A84C";
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 3000, background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "0.9rem 1.25rem", maxWidth: 360, display: "flex", alignItems: "center", gap: "0.75rem", animation: "fadeUp 0.3s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <span style={{ fontSize: "1rem" }}>{type === "error" ? "⚠️" : "✓"}</span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#fff", flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0 }}>✕</button>
    </div>
  );
}

// ── Input Field Helper ────────────────────────────────────────────────────────
function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "0.45rem" }}>
        {label}{required && <span style={{ color: "#C9A84C", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  background: "#0d0d1a",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 6,
  color: "#fff",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.88rem",
  outline: "none",
  transition: "border-color 0.2s",
};

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess, showToast }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [fieldFocus, setFieldFocus] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = form;
    if (!username.trim() || !email.trim() || !password.trim()) {
      showToast("All fields are required", "error");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast("Please enter a valid email", "error");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await api.signup(username, email, password);
        showToast("Account created! Please log in.", "success");
        setMode("login");
        setForm(f => ({ ...f, password: "" }));
      } else {
        const { token, user } = await api.login(username, email, password);
        showToast(`Welcome, ${user.username}!`, "success");
        onSuccess({ token, user });
        onClose();
      }
    } catch (err) {
      showToast(err.message || (mode === "login" ? "Login failed" : "Signup failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const dynBorder = (field) => ({
    ...inputStyle,
    borderColor: fieldFocus === field ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.12)",
  });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2500, background: "rgba(5,5,15,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: "1rem" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 16, padding: "2.2rem", width: "100%", maxWidth: 460, animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Admin Access</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </h3>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <FormField label="Username" required>
            <input value={form.username} onChange={set("username")} onFocus={() => setFieldFocus("username")} onBlur={() => setFieldFocus(null)} placeholder="Your username" style={dynBorder("username")} autoComplete="username" />
          </FormField>
          <FormField label="Email" required>
            <input type="email" value={form.email} onChange={set("email")} onFocus={() => setFieldFocus("email")} onBlur={() => setFieldFocus(null)} placeholder="you@example.com" style={dynBorder("email")} autoComplete="email" />
          </FormField>
          <FormField label="Password" required>
            <input type="password" value={form.password} onChange={set("password")} onFocus={() => setFieldFocus("password")} onBlur={() => setFieldFocus(null)} placeholder="••••••••" style={dynBorder("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </FormField>
          <div style={{ marginTop: "1.8rem" }}>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.9rem", borderRadius: 6, background: loading ? "rgba(201,168,76,0.2)" : "linear-gradient(135deg,#C9A84C,#b8962e)", color: loading ? "rgba(201,168,76,0.4)" : "#0d0d1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.08em", textTransform: "uppercase", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s" }}>
              {loading ? <Spinner size={16} color="#C9A84C" /> : (mode === "login" ? "Sign In" : "Sign Up")}
            </button>
          </div>
          {/* <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button type="button" onClick={() => setMode(m => m === "login" ? "signup" : "login")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4, textDecorationColor: "#C9A84C", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
              {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
}

// ── Event Form Modal (Create / Edit) ──────────────────────────────────────────
function EventFormModal({ event, onClose, onSaved, showToast, token }) {
  const isEdit = !!event;
  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    event_date: event?.event_date ? formatDateForInput(event.event_date) : "",
    location: event?.location || "",
    cover_image: event?.cover_image || "",
    drive_link: event?.drive_link || "",
  });
  const [saving, setSaving] = useState(false);
  const [fieldFocus, setFieldFocus] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    if (!form.event_date) { showToast("Event date is required", "error"); return; }
    setSaving(true);
    try {
      let result;
      if (isEdit) {
        result = await api.updateEvent(event.id, form, token);
        console.log("Updated event response:", result);
        showToast("Event updated successfully!", "success");
      } else {
        result = await api.createEvent(form, token);
        showToast("Event created successfully!", "success");
      }
      onSaved(result, isEdit);
      onClose();
    } catch (err) {
      showToast(err.message || (isEdit ? "Update failed" : "Create failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const dynBorder = (field) => ({
    ...inputStyle,
    borderColor: fieldFocus === field ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.12)",
  });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2100, background: "rgba(5,5,15,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: "1rem" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 540, animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Events Manager</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 700, color: "#fff" }}>
              {isEdit ? "Edit Event" : "Create New Event"}
            </h3>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4 }}>✕</button>
        </div>

        <FormField label="Event Title" required>
          <input value={form.title} onChange={set("title")} onFocus={() => setFieldFocus("title")} onBlur={() => setFieldFocus(null)} placeholder="e.g. Mt. Kenya Day Dash 2026" style={dynBorder("title")} />
        </FormField>

        <FormField label="Description">
          <textarea value={form.description} onChange={set("description")} onFocus={() => setFieldFocus("description")} onBlur={() => setFieldFocus(null)} placeholder="A short description of the event..." rows={3} style={{ ...dynBorder("description"), resize: "vertical", minHeight: 80 }} />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          <FormField label="Event Date" required>
            <input type="date" value={form.event_date} onChange={set("event_date")} onFocus={() => setFieldFocus("event_date")} onBlur={() => setFieldFocus(null)} style={{ ...dynBorder("event_date"), colorScheme: "dark" }} />
          </FormField>
          <FormField label="Location">
            <input value={form.location} onChange={set("location")} onFocus={() => setFieldFocus("location")} onBlur={() => setFieldFocus(null)} placeholder="e.g. Nairobi, Kenya" style={dynBorder("location")} />
          </FormField>
        </div>

        <FormField label="Cover Image URL">
          <input value={form.cover_image} onChange={set("cover_image")} onFocus={() => setFieldFocus("cover_image")} onBlur={() => setFieldFocus(null)} placeholder="https://... (optional)" style={dynBorder("cover_image")} />
        </FormField>

        {/* ── Google Drive Album Link ── */}
        <FormField label="Google Drive Album Link">
          <input
            value={form.drive_link}
            onChange={set("drive_link")}
            onFocus={() => setFieldFocus("drive_link")}
            onBlur={() => setFieldFocus(null)}
            placeholder="https://drive.google.com/drive/folders/..."
            style={dynBorder("drive_link")}
          />
          {form.drive_link && (
            <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.74rem", color: "rgba(201,168,76,0.7)" }}>✓ Drive link set —</span>
              <a href={form.drive_link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.74rem", color: "#C9A84C", textDecoration: "underline" }}>preview link</a>
            </div>
          )}
        </FormField>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.75rem", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: "0.75rem", borderRadius: 6, background: saving ? "rgba(201,168,76,0.2)" : "linear-gradient(135deg,#C9A84C,#b8962e)", color: saving ? "rgba(201,168,76,0.4)" : "#0d0d1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: saving ? "not-allowed" : "pointer", letterSpacing: "0.08em", textTransform: "uppercase", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s" }}>
            {saving ? <><Spinner size={16} color="#C9A84C" /> {isEdit ? "Saving..." : "Creating..."}</> : isEdit ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteEventModal({ event, onClose, onDeleted, showToast, token }) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteEvent(event.id, token);
      showToast("Event deleted successfully", "success");
      onDeleted(event.id);
      onClose();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2200, background: "rgba(5,5,15,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: "1rem" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111122", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 420, animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.5rem" }}>🗑️</div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem" }}>Delete Event?</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "0.5rem" }}>
          You are about to delete <strong style={{ color: "#fff" }}>{event.title}</strong>.
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(220,38,38,0.8)", fontSize: "0.82rem", marginBottom: "1.75rem" }}>
          ⚠️ This will also delete all photos and videos under this event. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.75rem", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} style={{ flex: 1.5, padding: "0.75rem", borderRadius: 6, background: deleting ? "rgba(220,38,38,0.15)" : "rgba(220,38,38,0.85)", color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: deleting ? "not-allowed" : "pointer", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(220,38,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s" }}>
            {deleting ? <><Spinner size={14} color="#fff" /> Deleting...</> : <><TrashIcon /> Yes, Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Events Manager Modal ──────────────────────────────────────────────────────
function EventsManagerModal({ onClose, showToast, onEventsChanged, token }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getEvents();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleSaved = (savedEvent, isEdit) => {
    if (isEdit) {
      setEvents(prev => prev.map(e => e.id === savedEvent.id ? { ...e, ...savedEvent } : e));
    } else {
      setEvents(prev => [savedEvent, ...prev]);
    }
    onEventsChanged();
  };

  const handleDeleted = (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    onEventsChanged();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5,5,15,0.40)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: "1rem" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, width: "100%", maxWidth: 820, animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)", display: "flex", flexDirection: "column", maxHeight: "88vh" }}>

          {/* Modal Header */}
          <div style={{ padding: "1.75rem 2rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Admin</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>Events Manager</h2>
              </div>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                <button onClick={() => setShowCreateForm(true)} style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.55rem 1.1rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", border: "none", borderRadius: 6, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <PlusIcon /> New Event
                </button>
                <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)" }}>
                <span style={{ color: "#C9A84C", fontWeight: 700, fontSize: "1.1rem", fontFamily: "'Cormorant Garamond', serif" }}>{events.length}</span> {events.length === 1 ? "event" : "events"} total
              </div>
              <button onClick={loadEvents} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", padding: 0, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
                <RefreshIcon /> Refresh
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1, padding: "0.5rem 0" }}>
            {loading && (
              <div style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <Spinner size={32} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Loading events...</span>
              </div>
            )}
            {!loading && error && (
              <div style={{ padding: "2.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⚠️</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.88rem", marginBottom: "1rem" }}>{error}</p>
                <button onClick={loadEvents} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.25rem", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 6, color: "#C9A84C", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.74rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <RefreshIcon /> Retry
                </button>
              </div>
            )}
            {!loading && !error && events.length === 0 && (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.5 }}>📭</div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>No events yet</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.2)", marginBottom: "1.5rem" }}>Create your first event to start uploading media.</p>
                <button onClick={() => setShowCreateForm(true)} style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.7rem 1.4rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", border: "none", borderRadius: 6, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <PlusIcon /> Create First Event
                </button>
              </div>
            )}

            {!loading && !error && events.length > 0 && (
              <div>
                {/* Table Header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 70px 70px 160px 110px", gap: "0.5rem", padding: "0.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Event", "Date", "Photos", "Videos", "Drive Album", "Actions"].map(h => (
                    <span key={h} style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.62rem", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>

                {/* Table Rows */}
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="event-row"
                    style={{ display: "grid", gridTemplateColumns: "1fr 130px 70px 70px 160px 110px", gap: "0.5rem", padding: "1rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}
                  >
                    {/* Cell 1 – Event title */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                      {ev.location && (
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.74rem", color: "rgba(255,255,255,0.3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📍 {ev.location}</div>
                      )}
                    </div>

                    {/* Cell 2 – Date */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span style={{ color: "rgba(201,168,76,0.5)" }}><CalendarIcon /></span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>{formatDate(ev.event_date)}</span>
                    </div>

                    {/* Cell 3 – Photos */}
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 700, color: "#C9A84C" }}>
                      {ev.total_photos ?? "—"}
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", marginLeft: 3, fontWeight: 400 }}>ph</span>
                    </div>

                    {/* Cell 4 – Videos */}
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 700, color: "rgba(201,168,76,0.6)" }}>
                      {ev.total_videos ?? "—"}
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", marginLeft: 3, fontWeight: 400 }}>vid</span>
                    </div>

                    {/* Cell 5 – Drive Album link (wider, shows URL preview) */}
                    <div style={{ minWidth: 0 }}>
                      {ev.drive_link ? (
                        <a
                          href={ev.drive_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={ev.drive_link}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.75rem", borderRadius: 5, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", textDecoration: "none", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.66rem", letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.2s", whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%", textOverflow: "ellipsis" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.2)"; e.currentTarget.style.borderColor = "#C9A84C"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.1)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}
                        >
                          📁 View Album
                        </a>
                      ) : (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>No link set</span>
                      )}
                    </div>

                    {/* Cell 6 – Actions */}
                    <div style={{ display: "flex", gap: "0.45rem" }}>
                      <button
                        onClick={() => setEditingEvent(ev)}
                        title="Edit event"
                        style={{ width: 34, height: 34, borderRadius: 6, background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.18)"; e.currentTarget.style.borderColor = "#C9A84C"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.07)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; }}
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => setDeletingEvent(ev)}
                        title="Delete event"
                        style={{ width: 34, height: 34, borderRadius: 6, background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", color: "rgba(220,38,38,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.18)"; e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#fca5a5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.07)"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.2)"; e.currentTarget.style.color = "rgba(220,38,38,0.7)"; }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: "1rem 2rem", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.2)" }}>Changes take effect immediately across the gallery.</span>
            <button onClick={onClose} style={{ padding: "0.55rem 1.25rem", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Close
            </button>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <EventFormModal event={null} onClose={() => setShowCreateForm(false)} onSaved={handleSaved} showToast={showToast} token={token} />
      )}
      {editingEvent && (
        <EventFormModal event={editingEvent} onClose={() => setEditingEvent(null)} onSaved={handleSaved} showToast={showToast} token={token} />
      )}
      {deletingEvent && (
        <DeleteEventModal event={deletingEvent} onClose={() => setDeletingEvent(null)} onDeleted={handleDeleted} showToast={showToast} token={token} />
      )}
    </>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ events, onClose, onUploaded, showToast, token }) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");
  const [fileType, setFileType] = useState("photo");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    if (f.type.startsWith("video/")) setFileType("video");
    else setFileType("photo");
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file || !selectedEventId) return;
    setUploading(true);
    try {
      const result = await api.uploadMedia(selectedEventId, file, fileType, token);
      showToast("Media uploaded successfully!", "success");
      onUploaded(selectedEventId, result);
      onClose();
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5,5,15,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: "1rem" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 520, animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Media Manager</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>Upload Media</h3>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Select Event</label>
          <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} style={{ width: "100%", padding: "0.65rem 0.9rem", background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", cursor: "pointer", outline: "none" }}>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {["photo", "video"].map(t => (
            <button key={t} onClick={() => setFileType(t)} style={{ flex: 1, padding: "0.55rem", borderRadius: 6, border: "1px solid", borderColor: fileType === t ? "#C9A84C" : "rgba(255,255,255,0.1)", background: fileType === t ? "rgba(201,168,76,0.1)" : "transparent", color: fileType === t ? "#C9A84C" : "rgba(255,255,255,0.4)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}>
              {t === "photo" ? "📷 Photo" : "🎬 Video"}
            </button>
          ))}
        </div>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? "#C9A84C" : "rgba(201,168,76,0.25)"}`, borderRadius: 10, padding: "1.5rem", textAlign: "center", cursor: "pointer", background: dragOver ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)", transition: "all 0.2s", marginBottom: "1.25rem", minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          {preview ? (
            fileType === "photo"
              ? <img src={preview} alt="preview" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6, objectFit: "contain" }} />
              : <video src={preview} style={{ maxHeight: 100, maxWidth: "100%", borderRadius: 6 }} controls />
          ) : (
            <>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>{fileType === "photo" ? "🖼️" : "🎞️"}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.45)" }}>
                Drop {fileType} here or <span style={{ color: "#C9A84C", fontWeight: 600 }}>browse</span>
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>
                {fileType === "photo" ? "JPG, PNG, WEBP" : "MP4, MOV, AVI"} supported
              </div>
            </>
          )}
        </div>
        {file && (
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>
            {file.name} · {formatFileSize(file.size)}
          </div>
        )}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.75rem", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!file || !selectedEventId || uploading} style={{ flex: 2, padding: "0.75rem", borderRadius: 6, background: file && selectedEventId && !uploading ? "linear-gradient(135deg,#C9A84C,#b8962e)" : "rgba(201,168,76,0.2)", color: file && selectedEventId && !uploading ? "#0d0d1a" : "rgba(201,168,76,0.4)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: file && selectedEventId && !uploading ? "pointer" : "not-allowed", letterSpacing: "0.08em", textTransform: "uppercase", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s" }}>
            {uploading ? <><Spinner size={16} color="#C9A84C" /> Uploading...</> : <><UploadIcon /> Upload Media</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ items, startIndex, onClose, onDelete, canDelete, token }) {
  const [current, setCurrent] = useState(startIndex);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
  const isVideo = item?.file_type === "video" || (item?.storage_path || "").match(/\.(mp4|mov|avi|webm)$/i);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await onDelete(item.id, current, token);
    setDeleting(false);
    setConfirmDelete(false);
    if (items.length <= 1) { onClose(); return; }
    setCurrent(c => Math.min(c, items.length - 2));
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5,5,15,0.97)", backdropFilter: "blur(24px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>✕</button>
      <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", fontFamily: "'Syne', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", zIndex: 10 }}>
        {current + 1} / {items.length}
      </div>
      {canDelete && (
        <button onClick={e => { e.stopPropagation(); handleDelete(); }} disabled={deleting} style={{ position: "absolute", top: 20, right: 80, height: 44, paddingInline: "1rem", borderRadius: 6, background: confirmDelete ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.06)", border: `1px solid ${confirmDelete ? "#dc2626" : "rgba(255,255,255,0.12)"}`, color: confirmDelete ? "#fca5a5" : "rgba(255,255,255,0.45)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", zIndex: 10, transition: "all 0.2s" }}>
          {deleting ? <Spinner size={14} color="#fca5a5" /> : <TrashIcon />}
          {confirmDelete ? "Confirm Delete" : "Delete"}
        </button>
      )}
      <button onClick={e => { e.stopPropagation(); setCurrent(c => (c - 1 + items.length) % items.length); setConfirmDelete(false); }} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 52, height: 52, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "all 0.25s" }}>
        <ChevronLeft />
      </button>
      <button onClick={e => { e.stopPropagation(); setCurrent(c => (c + 1) % items.length); setConfirmDelete(false); }} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 52, height: 52, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "all 0.25s" }}>
        <ChevronRight />
      </button>
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "min(900px, 90vw)", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        {isVideo ? (
          <video key={item.storage_path} src={item.storage_path} controls autoPlay style={{ maxWidth: "min(900px, 88vw)", maxHeight: "78vh", display: "block", borderRadius: 10, border: "1px solid rgba(201,168,76,0.15)" }} />
        ) : (
          <img key={item.storage_path} src={item.storage_path} alt={item.original_filename || item.event_title} style={{ maxWidth: "min(900px, 88vw)", maxHeight: "78vh", objectFit: "contain", display: "block", borderRadius: 10, border: "1px solid rgba(201,168,76,0.15)" }}
            onError={ev => { ev.target.style.display = "none"; }} />
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(5,5,15,0.95), transparent)", borderRadius: "0 0 10px 10px", padding: "2rem 1.5rem 1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <span style={{ background: "rgba(201,168,76,0.9)", color: "#0d0d1a", padding: "0.18rem 0.7rem", borderRadius: 3, fontSize: "0.65rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.file_type || "photo"}</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#fff", fontWeight: 600 }}>{item.event_title || item.original_filename || ""}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>{formatDate(item.created_at)}</span>
          </div>
          {item.file_size && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", marginTop: "0.3rem" }}>{formatFileSize(item.file_size)}</div>}
          {/* Drive link in lightbox */}
          {item.event_drive_link && (
            <div style={{ marginTop: "0.65rem" }}>
              <a href={item.event_drive_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.4rem 1rem", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", borderRadius: 5, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "#C9A84C", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.25)"; e.currentTarget.style.borderColor = "#C9A84C"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.15)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; }}>
                📁 View Full Album on Drive <ExternalLinkIcon />
              </a>
            </div>
          )}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.4rem", maxWidth: "min(700px, 90vw)", overflowX: "auto", padding: "0 0.5rem" }}>
        {items.map((it, i) => (
          <div key={it.id} onClick={e => { e.stopPropagation(); setCurrent(i); setConfirmDelete(false); }} style={{ width: 54, height: 38, borderRadius: 5, overflow: "hidden", flexShrink: 0, cursor: "pointer", border: `1.5px solid ${i === current ? "#C9A84C" : "rgba(255,255,255,0.1)"}`, opacity: i === current ? 1 : 0.45, transition: "all 0.2s" }}>
            <img src={it.storage_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={ev => ev.target.style.display = "none"} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 70, right: 20, fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>← → arrow keys</div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ onUploadClick, onEventsClick, isAuthenticated, user, onLogout, onLoginClick }) {
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

  const handleUpload = () => { if (!isAuthenticated) { onLoginClick("upload"); } else { onUploadClick(); } };
  const handleEvents = () => { if (!isAuthenticated) { onLoginClick("events"); } else { onEventsClick(); } };

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, background: scrolled ? "rgba(10,10,20,0.94)" : "rgba(10,10,20,0.6)", backdropFilter: "blur(20px)", borderBottom: scrolled ? "1px solid rgba(201,168,76,0.12)" : "1px solid rgba(255,255,255,0.04)", transition: "all 0.5s", animation: mounted ? "navReveal 0.8s cubic-bezier(0.16,1,0.3,1)" : "none", maxWidth: "100vw", overflow: "hidden" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 74 }}>
          <a href="#home" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <div style={{ width: 200, height: 86, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
              <img src="/media/logo4.png" alt="ONE4ONE" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:1.1rem;color:#C9A84C;letter-spacing:0.05em">1·4·1</span>'; }} />
            </div>
          </a>
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {links.map(l => (
              <a key={l.label} href={l.href} className="nav-link" style={{ position: "relative", fontFamily: "'Syne', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: l.href === "/gallery" ? "#C9A84C" : "rgba(255,255,255,0.75)", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = l.href === "/gallery" ? "#C9A84C" : "rgba(255,255,255,0.75)"}>{l.label}</a>
            ))}
            {isAuthenticated ? (
              <>
                <button onClick={handleEvents} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", padding: "0.55rem 1.1rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.74rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.1)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.color = "#C9A84C"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                  <CalendarIcon /> Events
                </button>
                <button onClick={handleUpload} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", padding: "0.55rem 1.1rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.74rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.18)"; e.currentTarget.style.borderColor = "#C9A84C"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}>
                  <UploadIcon /> Upload
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>{user?.username}</span>
                  <button onClick={onLogout} title="Logout" style={{ width: 36, height: 36, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.1)"; e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#fca5a5"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                    <LogoutIcon />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => onLoginClick("events")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", padding: "0.55rem 1.1rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.74rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.1)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.color = "#C9A84C"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                  <CalendarIcon /> Events
                </button>
                <button onClick={() => onLoginClick("upload")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", padding: "0.55rem 1.1rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.74rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.18)"; e.currentTarget.style.borderColor = "#C9A84C"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}>
                  <UploadIcon /> Upload
                </button>
                <button onClick={() => onLoginClick("login")} style={{ background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", padding: "0.6rem 1.4rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.76rem", border: "none", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.3s", boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}>
                  Admin Login
                </button>
              </>
            )}
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
        {isAuthenticated ? (
          <>
            <button onClick={() => { setMenuOpen(false); onEventsClick(); }} style={{ display: "block", width: "100%", marginTop: "1rem", padding: "0.75rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>Manage Events</button>
            <button onClick={() => { setMenuOpen(false); onUploadClick(); }} style={{ display: "block", width: "100%", marginTop: "0.6rem", padding: "0.75rem", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>Upload Media</button>
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>{user?.username}</span>
              <button onClick={() => { setMenuOpen(false); onLogout(); }} style={{ background: "none", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5", padding: "0.3rem 0.8rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => { setMenuOpen(false); onLoginClick("events"); }} style={{ display: "block", width: "100%", marginTop: "1rem", padding: "0.75rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>Manage Events</button>
            <button onClick={() => { setMenuOpen(false); onLoginClick("upload"); }} style={{ display: "block", width: "100%", marginTop: "0.6rem", padding: "0.75rem", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>Upload Media</button>
            <button onClick={() => { setMenuOpen(false); onLoginClick("login"); }} style={{ display: "block", width: "100%", marginTop: "0.6rem", padding: "0.9rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Login</button>
          </>
        )}
        <a href="/#contact" onClick={() => setMenuOpen(false)} style={{ display: "block", marginTop: "0.6rem", padding: "0.9rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", textAlign: "center", letterSpacing: "0.08em", textTransform: "uppercase" }}>Contact Us</a>
      </div>
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 480, background: "rgba(0,0,0,0.5)" }} />}
    </>
  );
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function TickerBanner({ events }) {
  const items = events.length > 0
    ? events.map(e => e.title)
    : ["Running Events", "Hiking Adventures", "Tour Experiences", "Mt. Kenya Day Dash", "Vienna Loop", "Better Together", "Visual Diary", "All Moments"];
  const doubled = [...items, ...items, ...items, ...items];
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
function PageHero({ heroImages }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 150); }, []);

  const fallbacks = ["/media/events/mtkd - 1.png", "/media/events/mtkd - 3.png", "/gallery/gallery 1.png", "/media/events/mtkd - 5.png"];
  const images = heroImages.length >= 4 ? heroImages.slice(0, 4) : fallbacks;

  return (
    <section style={{ position: "relative", height: "52vh", minHeight: 380, overflow: "hidden", background: "#080812", display: "flex", alignItems: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, opacity: 0.35 }}>
        {images.map((src, i) => (
          <div key={i} style={{ overflow: "hidden", position: "relative" }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", animation: "heroKenBurns 10s ease-out infinite alternate" }}
              onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${i*50+200},20%,10%)`; }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,18,0.5) 0%, rgba(8,8,18,0.7) 60%, #0d0d1a 100%)" }} />
      <div style={{ position: "absolute", left: "1.5rem", top: "20%", bottom: "20%", width: 1, background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5), transparent)" }} />
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
function StatsBar({ totalPhotos, totalVideos, totalEvents, showing, loading }) {
  return (
    <div style={{ background: "#111122", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 1.5rem" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          {[
            { val: totalPhotos, label: "Photos" },
            { val: totalVideos, label: "Videos" },
            { val: totalEvents, label: "Events" },
            { val: showing, label: "Showing" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.45rem" }}>
              {loading ? (
                <div className="skeleton" style={{ width: 32, height: 24, borderRadius: 4 }} />
              ) : (
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: "#C9A84C", lineHeight: 1 }}>{s.val}</span>
              )}
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>Click any photo to view full size</span>
      </div>
    </div>
  );
}

// ── View Album Button (standalone reusable) ───────────────────────────────────
// Prominent banner shown above each event's photos in the grid
function ViewAlbumBanner({ eventName, driveLink, photoCount }) {
  if (!driveLink) return null;
  return (
    <a
      href={driveLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.85rem 1.25rem",
        background: "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.06) 100%)",
        border: "1px solid rgba(201,168,76,0.35)",
        borderRadius: 8,
        textDecoration: "none",
        transition: "all 0.25s",
        marginBottom: "0.85rem",
        flexWrap: "wrap",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.12) 100%)";
        e.currentTarget.style.borderColor = "#C9A84C";
        e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.15)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.06) 100%)";
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.3rem" }}>📁</span>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.1rem" }}>
            View Full Album on Google Drive
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>
            {photoCount > 0 ? `See all ${photoCount}+ photos from ${eventName}` : `All photos from ${eventName}`}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.45rem 1rem", background: "rgba(201,168,76,0.85)", borderRadius: 5, color: "#0d0d1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
        Open Album <ExternalLinkIcon />
      </div>
    </a>
  );
}

// ── Gallery Grid ──────────────────────────────────────────────────────────────
function GalleryGrid({ events, allMedia, loading, error, onRefresh, onDelete, showToast, isAuthenticated, token }) {
  const [ref, visible] = useInView();
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeEventId, setActiveEventId] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  // ── CHANGE 1: default layout is now "grid" ──
  const [layout, setLayout] = useState("grid");

  const labelSet = new Set(events.map(e => guessLabel(e)));
  const FILTERS = ["All", ...Array.from(labelSet)];

  const filtered = allMedia.filter(item => {
    const matchLabel = activeFilter === "All" || guessLabel({ title: item.event_title }) === activeFilter;
    const matchEvent = activeEventId === "all" || item.event_id === activeEventId;
    return matchLabel && matchEvent;
  });

  // Group media by event for the "by event" views
  const byEvent = filtered.reduce((acc, item) => {
    const key = item.event_id;
    if (!acc[key]) {
      const ev = events.find(e => e.id === key);
      const liveEvent = events.find(e => e.id === key);
acc[key] = {
  name: item.event_title,
  items: [],
  drive_link: liveEvent?.drive_link || item.event_drive_link || null,
};
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  // For grid view: group by event so we can show the album banner per event
  const byEventForGrid = Object.entries(byEvent);

  const openLightbox = (item) => {
    const idx = filtered.findIndex(f => f.id === item.id);
    if (idx >= 0) setLightboxIndex(idx);
  };

  const handleDelete = async (mediaId, currentIdx, authToken) => {
    try {
      await api.deleteMedia(mediaId, authToken);
      showToast("Media deleted", "success");
      onDelete(mediaId);
      if (filtered.length <= 1) setLightboxIndex(null);
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  if (error) {
    return (
      <section style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "#fff", marginBottom: "0.75rem" }}>Could not load gallery</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem" }}>{error}</p>
        <button onClick={onRefresh} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", border: "none", borderRadius: 6, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
          <RefreshIcon /> Retry
        </button>
      </section>
    );
  }

  return (
    <section ref={ref} style={{ padding: "3rem 1.5rem 6rem", background: "#0d0d1a", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* ── Filters & Layout Toggles ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1.25rem", opacity: visible ? 1 : 0, transition: "all 0.6s" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            {FILTERS.map(f => (
              <button key={f} className="filter-btn" onClick={() => setActiveFilter(f)} style={{ padding: "0.5rem 1.1rem", borderRadius: 4, border: "1px solid", borderColor: activeFilter === f ? "#C9A84C" : "rgba(255,255,255,0.1)", background: activeFilter === f ? "rgba(201,168,76,0.12)" : "transparent", color: activeFilter === f ? "#C9A84C" : "rgba(255,255,255,0.45)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {f}
              </button>
            ))}
            {events.length > 0 && (
              <>
                <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)", alignSelf: "center", margin: "0 0.25rem" }} />
                <button className="filter-btn" onClick={() => setActiveEventId("all")} style={{ padding: "0.5rem 1.1rem", borderRadius: 4, border: "1px solid", borderColor: activeEventId === "all" ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.07)", background: activeEventId === "all" ? "rgba(201,168,76,0.07)" : "transparent", color: activeEventId === "all" ? "rgba(201,168,76,0.9)" : "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.78rem", cursor: "pointer" }}>
                  All Events
                </button>
                {events.map(ev => (
                  <button key={ev.id} className="filter-btn" onClick={() => setActiveEventId(ev.id)} style={{ padding: "0.5rem 1.1rem", borderRadius: 4, border: "1px solid", borderColor: activeEventId === ev.id ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.07)", background: activeEventId === ev.id ? "rgba(201,168,76,0.07)" : "transparent", color: activeEventId === ev.id ? "rgba(201,168,76,0.9)" : "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.78rem", cursor: "pointer" }}>
                    {ev.title}
                  </button>
                ))}
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button onClick={onRefresh} title="Refresh gallery" style={{ width: 36, height: 36, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.color = "#C9A84C"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
              <RefreshIcon />
            </button>
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

        {loading && <SkeletonGrid count={9} />}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>📷</div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>No media found</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.2)" }}>
              {events.length === 0 ? "No events exist yet — create an event to get started." : "Try a different filter or upload photos to this event."}
            </p>
          </div>
        )}

        {/* ── MASONRY VIEW ── */}
        {!loading && layout === "masonry" && filtered.length > 0 && (
          <div>
            {/* Show album banners at top when viewing all events */}
            {activeEventId === "all" && byEventForGrid.map(([eventId, group]) => (
              group.drive_link ? (
                <ViewAlbumBanner
                  key={eventId}
                  eventName={group.name}
                  driveLink={group.drive_link}
                  photoCount={group.items.length}
                />
              ) : null
            ))}
            <div style={{ columns: "3 280px", gap: "1rem" }}>
              {filtered.map((item, i) => (
                <MasonryItem key={item.id} item={item} index={i} visible={visible} onClick={() => openLightbox(item)} />
              ))}
            </div>
          </div>
        )}

        {/* ── GRID VIEW (default) — grouped by event with album banner per group ── */}
        {!loading && layout === "grid" && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {byEventForGrid.map(([eventId, group]) => (
              <div key={eventId}>
                {/* Event heading row */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <div style={{ width: 3, height: 26, background: "#C9A84C", borderRadius: 2, flexShrink: 0 }} />
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>{group.name}</h3>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {group.items.length} {group.items.length === 1 ? "File" : "Files"}
                  </span>
                </div>

                {/* ── CHANGE 2: Prominent "View Full Album" banner under each event heading ── */}
                <ViewAlbumBanner
                  eventName={group.name}
                  driveLink={group.drive_link}
                  photoCount={group.items.length}
                />

                {/* Photo grid for this event */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                  {group.items.map((item, i) => (
                    <GridItem key={item.id} item={item} index={i} visible={visible} onClick={() => openLightbox(item)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FEATURED VIEW ── */}
        {!loading && layout === "featured" && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
            {byEventForGrid.map(([eventId, group]) => (
              <EventGroup key={eventId} name={group.name} items={group.items} driveLink={group.drive_link} visible={visible} onOpen={openLightbox} />
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && filtered.length > 0 && (
        <Lightbox
          items={filtered}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onDelete={handleDelete}
          canDelete={isAuthenticated}
          token={token}
        />
      )}
    </section>
  );
}

// ── Masonry Item ──────────────────────────────────────────────────────────────
function MasonryItem({ item, index, visible, onClick }) {
  const isVideo = item.file_type === "video" || (item.storage_path || "").match(/\.(mp4|mov|avi|webm)$/i);
  return (
    <div className="gallery-item" onClick={onClick} style={{ position: "relative", borderRadius: 10, overflow: "hidden", cursor: "zoom-in", marginBottom: "1rem", breakInside: "avoid", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: `opacity 0.6s ${(index % 6) * 0.07}s, transform 0.6s ${(index % 6) * 0.07}s`, border: "1px solid rgba(255,255,255,0.05)" }}>
      {isVideo ? (
        <video src={item.storage_path} style={{ width: "100%", display: "block", objectFit: "cover", pointerEvents: "none" }} muted playsInline />
      ) : (
        <img src={item.storage_path} alt={item.original_filename || item.event_title} style={{ width: "100%", display: "block", objectFit: "cover" }}
          onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${index*33+190},20%,12%)`; ev.target.parentNode.style.minHeight = "200px"; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.5rem">${FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length]}</div>`; }} />
      )}
      <div className="overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.92) 0%, transparent 55%)" }} />
      {isVideo && <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "0.2rem 0.5rem", fontFamily: "'Syne', sans-serif", fontSize: "0.62rem", color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "0.08em" }}>VIDEO</div>}
      <div className="caption" style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
        <span style={{ background: "rgba(201,168,76,0.9)", color: "#0d0d1a", padding: "0.15rem 0.65rem", borderRadius: 2, fontSize: "0.62rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-block", marginBottom: "0.35rem" }}>{item.file_type || "photo"}</span>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "0.95rem", color: "#fff" }}>{item.event_title}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{formatDate(item.created_at)}</div>
      </div>
    </div>
  );
}

// ── Grid Item ─────────────────────────────────────────────────────────────────
function GridItem({ item, index, visible, onClick }) {
  const isVideo = item.file_type === "video" || (item.storage_path || "").match(/\.(mp4|mov|avi|webm)$/i);
  return (
    <div className="gallery-item" onClick={onClick} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", cursor: "zoom-in", opacity: visible ? 1 : 0, transform: visible ? "none" : "scale(0.96)", transition: `all 0.6s ${(index % 6) * 0.07}s`, background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)" }}>
      {isVideo ? (
        <video src={item.storage_path} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} muted playsInline />
      ) : (
        <img src={item.storage_path} alt={item.original_filename || item.event_title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${index*33+190},20%,12%)`; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.8rem">${FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length]}</div>`; }} />
      )}
      <div className="overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.9) 0%, transparent 55%)" }} />
      {isVideo && <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "0.2rem 0.5rem", fontFamily: "'Syne', sans-serif", fontSize: "0.62rem", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>VIDEO</div>}
      <div className="caption" style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
        <span style={{ background: "rgba(201,168,76,0.9)", color: "#0d0d1a", padding: "0.15rem 0.65rem", borderRadius: 2, fontSize: "0.62rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-block", marginBottom: "0.35rem" }}>{item.file_type || "photo"}</span>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "0.9rem", color: "#fff" }}>{item.event_title}</div>
      </div>
    </div>
  );
}

// ── Event Group (Featured view) ───────────────────────────────────────────────
function EventGroup({ name, items, driveLink, visible, onOpen }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", opacity: vis ? 1 : 0, transition: "all 0.6s", flexWrap: "wrap" }}>
        <div style={{ width: 3, height: 28, background: "#C9A84C", borderRadius: 2, flexShrink: 0 }} />
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 700, color: "#fff" }}>{name}</h3>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: "0.25rem" }}>{items.length} {items.length === 1 ? "File" : "Files"}</span>
      </div>

      {/* ── CHANGE 3: Prominent album banner in featured view too ── */}
      <div style={{ marginBottom: "1.25rem", opacity: vis ? 1 : 0, transition: "all 0.6s 0.1s" }}>
        <ViewAlbumBanner eventName={name} driveLink={driveLink} photoCount={items.length} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.85rem" }}>
        {items[0] && (
          <div className="gallery-item" onClick={() => onOpen(items[0])} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "16/7", cursor: "zoom-in", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)", opacity: vis ? 1 : 0, transition: "all 0.7s 0.15s" }}>
            <img src={items[0].storage_path} alt={items[0].event_title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = "#1a1a2e"; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:4rem">⛰️</div>`; }} />
            <div className="overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.85) 0%, transparent 50%)" }} />
            <div className="caption" style={{ position: "absolute", bottom: 24, left: 24 }}>
              <span style={{ background: "rgba(201,168,76,0.9)", color: "#0d0d1a", padding: "0.2rem 0.8rem", borderRadius: 2, fontSize: "0.65rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-block", marginBottom: "0.5rem" }}>Featured</span>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "1.4rem", color: "#fff" }}>{items[0].event_title}</div>
            </div>
          </div>
        )}
        {items.length > 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: "0.85rem" }}>
            {items.slice(1).map((item, i) => (
              <div key={item.id} className="gallery-item" onClick={() => onOpen(item)} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", cursor: "zoom-in", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)", opacity: vis ? 1 : 0, transition: `all 0.6s ${0.18 + i * 0.07}s` }}>
                <img src={item.storage_path} alt={item.event_title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.style.background = `hsl(${i*50+200},18%,12%)`; ev.target.parentNode.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.5rem">${FALLBACK_EMOJIS[(i+1) % FALLBACK_EMOJIS.length]}</div>`; }} />
                <div className="overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.88) 0%, transparent 55%)" }} />
                <div className="caption" style={{ position: "absolute", bottom: 12, left: 12 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "#fff" }}>{item.original_filename || item.event_title}</div>
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
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>More Moments on Social</h2>
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

// ── Main App ──────────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [events, setEvents] = useState([]);
  const [allMedia, setAllMedia] = useState([]);
  const [stats, setStats] = useState({ totalPhotos: 0, totalVideos: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showEventsManager, setShowEventsManager] = useState(false);
  const [toast, setToast] = useState(null);

  const [authToken, setAuthToken] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const loadGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventsData = await api.getEvents();
      const eventList = eventsData.events || [];
      setEvents(eventList);

      const mediaResults = await Promise.allSettled(
        eventList.map(ev => api.getEventMedia(ev.id))
      );

      let combinedMedia = [];
      let totalPhotos = 0;
      let totalVideos = 0;

      mediaResults.forEach((result, i) => {
        if (result.status === "fulfilled") {
          const files = result.value.media_files || [];
          const enriched = files.map(f => ({
            ...f,
            event_id: eventList[i].id,
            event_title: eventList[i].title,
            // ── Ensure drive_link is passed through from the event object ──
            event_drive_link: eventList[i].drive_link || null,
          }));
          combinedMedia = [...combinedMedia, ...enriched];
          totalPhotos += files.filter(f => f.file_type === "photo").length;
          totalVideos += files.filter(f => f.file_type === "video").length;
        }
      });

      combinedMedia.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setAllMedia(combinedMedia);
      setStats({ totalPhotos, totalVideos });
    } catch (err) {
      setError(err.message || "Failed to load gallery data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGallery(); }, [loadGallery]);

  const handleUploaded = useCallback((eventId, newMedia) => {
    const event = events.find(e => e.id === eventId);
    const enriched = {
      ...newMedia,
      event_id: eventId,
      event_title: event?.title || "Event",
      event_drive_link: event?.drive_link || null,
      file_type: newMedia.file_type || "photo",
      created_at: new Date().toISOString(),
    };
    setAllMedia(prev => [enriched, ...prev]);
    if (enriched.file_type === "photo") setStats(s => ({ ...s, totalPhotos: s.totalPhotos + 1 }));
    else setStats(s => ({ ...s, totalVideos: s.totalVideos + 1 }));
  }, [events]);

  const handleDelete = useCallback((mediaId) => {
    setAllMedia(prev => {
      const item = prev.find(m => m.id === mediaId);
      if (item?.file_type === "photo") setStats(s => ({ ...s, totalPhotos: Math.max(0, s.totalPhotos - 1) }));
      if (item?.file_type === "video") setStats(s => ({ ...s, totalVideos: Math.max(0, s.totalVideos - 1) }));
      return prev.filter(m => m.id !== mediaId);
    });
  }, []);

  const handleEventsChanged = useCallback(() => { loadGallery(); }, [loadGallery]);

  const handleLoginSuccess = ({ token, user }) => {
    setAuthToken(token);
    setAuthUser(user);
    setShowAuthModal(false);
    if (pendingAction === "upload") setShowUpload(true);
    else if (pendingAction === "events") setShowEventsManager(true);
    setPendingAction(null);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    setShowUpload(false);
    setShowEventsManager(false);
    showToast("Logged out successfully", "success");
  };

  const openAuth = (action) => {
    setPendingAction(action);
    setShowAuthModal(true);
  };

  const heroImages = allMedia
    .filter(m => m.file_type === "photo" && m.storage_path)
    .slice(0, 4)
    .map(m => m.storage_path);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Navbar
        onUploadClick={() => setShowUpload(true)}
        onEventsClick={() => setShowEventsManager(true)}
        isAuthenticated={!!authToken}
        user={authUser}
        onLogout={handleLogout}
        onLoginClick={openAuth}
      />
      <PageHero heroImages={heroImages} />
      <TickerBanner events={events} />
      <StatsBar
        totalPhotos={stats.totalPhotos}
        totalVideos={stats.totalVideos}
        totalEvents={events.length}
        showing={allMedia.length}
        loading={loading}
      />
      <GalleryGrid
        events={events}
        allMedia={allMedia}
        loading={loading}
        error={error}
        onRefresh={loadGallery}
        onDelete={handleDelete}
        showToast={showToast}
        isAuthenticated={!!authToken}
        token={authToken}
      />
      <SocialCTA />
      <Footer />

      {showAuthModal && (
        <AuthModal
          onClose={() => { setShowAuthModal(false); setPendingAction(null); }}
          onSuccess={handleLoginSuccess}
          showToast={showToast}
        />
      )}

      {showEventsManager && authToken && (
        <EventsManagerModal
          onClose={() => setShowEventsManager(false)}
          showToast={showToast}
          onEventsChanged={handleEventsChanged}
          token={authToken}
        />
      )}

      {showUpload && authToken && events.length > 0 && (
        <UploadModal
          events={events}
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
          showToast={showToast}
          token={authToken}
        />
      )}

      {showUpload && authToken && events.length === 0 && (
        <div onClick={() => setShowUpload(false)} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5,5,15,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "2rem", maxWidth: 400, textAlign: "center", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📭</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "#fff", marginBottom: "0.75rem" }}>No Events Yet</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              You need at least one event before uploading media. Create one using the <strong style={{ color: "#C9A84C" }}>Events</strong> button in the nav.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button onClick={() => { setShowUpload(false); setShowEventsManager(true); }} style={{ padding: "0.7rem 1.4rem", background: "transparent", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C", borderRadius: 6, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Create Event
              </button>
              <button onClick={() => setShowUpload(false)} style={{ padding: "0.7rem 1.5rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", border: "none", borderRadius: 6, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}