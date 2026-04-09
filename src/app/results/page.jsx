"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = "http://75.119.159.17:9002";

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
  @keyframes spin {
    to { transform: rotate(360deg); }
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
  .filter-btn { transition: all 0.25s; }

  .skeleton {
    background: linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%);
    background-size: 400px 100%;
    animation: skeletonShimmer 1.4s ease infinite;
    border-radius: 10px;
  }

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

  async getEventMedia(eventId, fileType = null, page = 1, limit = 200) {
    let url = `${BASE_URL}/api/events/${eventId}/results?page=${page}&limit=${limit}`;
    if (fileType) url += `&file_type=${fileType}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Media fetch failed: ${res.status}`);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Failed to load media");
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

function formatFileSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const FilePdfIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size = 24, color = "#C9A84C" }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", border: `2px solid rgba(201,168,76,0.15)`, borderTopColor: color, animation: "spin 0.75s linear infinite", display: "inline-block", flexShrink: 0 }} />
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "error" ? "#7f1d1d" : "rgba(201,168,76,0.15)";
  const border = type === "error" ? "#dc2626" : "#C9A84C";
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 3000, background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "0.9rem 1.25rem", maxWidth: 360, display: "flex", alignItems: "center", gap: "0.75rem", animation: "fadeUp 0.3s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <span style={{ fontSize: "1rem" }}>{type === "error" ? "⚠️" : "✓"}</span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#fff", flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0 }}>✕</button>
    </div>
  );
}

// ── Form Field Helper ─────────────────────────────────────────────────────────
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
    if (!username.trim() || !email.trim() || !password.trim()) { showToast("All fields are required", "error"); return; }
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
      showToast(err.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const dynBorder = (field) => ({ ...inputStyle, borderColor: fieldFocus === field ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.12)" });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2500, background: "rgba(5,5,15,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: "1rem" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 16, padding: "2.2rem", width: "100%", maxWidth: 460, animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Admin Access</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>{mode === "login" ? "Sign In" : "Create Account"}</h3>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
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
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.9rem", borderRadius: 6, background: loading ? "rgba(201,168,76,0.2)" : "linear-gradient(135deg,#C9A84C,#b8962e)", color: loading ? "rgba(201,168,76,0.4)" : "#0d0d1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.08em", textTransform: "uppercase", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              {loading ? <Spinner size={16} color="#C9A84C" /> : (mode === "login" ? "Sign In" : "Sign Up")}
            </button>
          </div>
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button type="button" onClick={() => setMode(m => m === "login" ? "signup" : "login")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4, textDecorationColor: "#C9A84C" }}>
              {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Upload Certificate Modal ──────────────────────────────────────────────────
function UploadCertModal({ events, onClose, onUploaded, showToast, token }) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");
  const [participantName, setParticipantName] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      showToast("Only PDF files are allowed for certificates", "error");
      return;
    }
    setFile(f);
    // Auto-fill name from filename if blank
    if (!participantName) {
      const name = f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
      setParticipantName(name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file || !selectedEventId) { showToast("Please select an event and a PDF file", "error"); return; }
    setUploading(true);
    try {
      // We store certificate PDFs as file_type "photo" or a custom type — using "photo" to stay compatible with existing API
      const result = await api.uploadMedia(selectedEventId, file, "pdf", token);
      showToast("Certificate uploaded successfully!", "success");
      onUploaded(selectedEventId, result, participantName, file.name);
      onClose();
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5,5,15,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: "1rem" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 520, animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Admin · Results Manager</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>Upload Certificate</h3>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <FormField label="Select Event" required>
          <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Participant Name">
          <input
            value={participantName}
            onChange={e => setParticipantName(e.target.value)}
            placeholder="e.g. Christopher Kamau"
            style={inputStyle}
          />
        </FormField>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? "#C9A84C" : "rgba(201,168,76,0.25)"}`, borderRadius: 10, padding: "1.5rem", textAlign: "center", cursor: "pointer", background: dragOver ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)", transition: "all 0.2s", marginBottom: "1.25rem", minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <input ref={fileRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C" }}>
                <FilePdfIcon />
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#C9A84C", fontSize: "0.85rem" }}>{file.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>{formatFileSize(file.size)}</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>📄</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.45)" }}>
                Drop PDF here or <span style={{ color: "#C9A84C", fontWeight: 600 }}>browse</span>
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>PDF certificates only</div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.75rem", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!file || !selectedEventId || uploading} style={{ flex: 2, padding: "0.75rem", borderRadius: 6, background: file && !uploading ? "linear-gradient(135deg,#C9A84C,#b8962e)" : "rgba(201,168,76,0.2)", color: file && !uploading ? "#0d0d1a" : "rgba(201,168,76,0.4)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: file && !uploading ? "pointer" : "not-allowed", letterSpacing: "0.08em", textTransform: "uppercase", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s" }}>
            {uploading ? <><Spinner size={16} color="#C9A84C" /> Uploading...</> : <><UploadIcon /> Upload Certificate</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Certificate Viewer Modal ──────────────────────────────────────────────────
function CertModal({ cert, name, onClose, onDelete, canDelete, showToast, token }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  

  useEffect(() => {
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handle); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Determine if the cert URL is a real URL (API) or a local path
  const certUrl = cert.startsWith("http") ? cert : cert;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5,5,15,0.97)", backdropFilter: "blur(24px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.2s" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(860px, 95vw)", borderRadius: 20, overflow: "hidden", background: "#0d0d1a", border: "1px solid rgba(201,168,76,0.2)", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(13,13,26,0.95))", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.12)", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(201,168,76,0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}>
              <CertIcon />
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>Participation Certificate</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {canDelete && (
              <button onClick={handleDelete} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", height: 36, background: confirmDelete ? "rgba(220,38,38,0.25)" : "rgba(220,38,38,0.08)", border: `1px solid ${confirmDelete ? "#dc2626" : "rgba(220,38,38,0.3)"}`, borderRadius: 6, color: confirmDelete ? "#fca5a5" : "rgba(220,38,38,0.7)", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" }}>
                {deleting ? <Spinner size={12} color="#fca5a5" /> : <TrashIcon />}
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </button>
            )}
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div style={{ height: "62vh", background: "#111122", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <iframe src={certUrl} title={`${name} Certificate`} width="100%" height="100%" style={{ border: "none", display: "block" }} />
        </div>

        {/* Footer */}
        <div style={{ background: "#0a0a14", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(201,168,76,0.08)", gap: "1rem", flexWrap: "wrap" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.25)", fontSize: "0.76rem", letterSpacing: "0.05em" }}>ESC TO CLOSE</p>
          <a href={certUrl} download target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1.5rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <DownloadIcon /> Download Certificate
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ isAuthenticated, user, onLogout, onLoginClick, onUploadClick }) {
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

          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {links.map(l => (
              <a key={l.label} href={l.href} className="nav-link" style={{ position: "relative", fontFamily: "'Syne', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: l.href === "/results" ? "#C9A84C" : "rgba(255,255,255,0.75)", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#C9A84C"}
                onMouseLeave={e => e.target.style.color = l.href === "/results" ? "#C9A84C" : "rgba(255,255,255,0.75)"}>{l.label}</a>
            ))}

            {isAuthenticated ? (
              <>
                <button onClick={onUploadClick} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", padding: "0.55rem 1.1rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.74rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; }}>
                  <UploadIcon /> Upload Cert
                </button>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>{user?.username}</span>
                <button onClick={onLogout} title="Logout" style={{ width: 36, height: 36, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LogoutIcon />
                </button>
              </>
            ) : (
              <button onClick={() => onLoginClick("upload")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", padding: "0.55rem 1.1rem", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.74rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <UploadIcon /> Admin Upload
              </button>
            )}
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
        {isAuthenticated ? (
          <button onClick={() => { setMenuOpen(false); onUploadClick(); }} style={{ display: "block", width: "100%", marginTop: "1rem", padding: "0.75rem", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Upload Certificate
          </button>
        ) : (
          <button onClick={() => { setMenuOpen(false); onLoginClick("upload"); }} style={{ display: "block", width: "100%", marginTop: "1rem", padding: "0.75rem", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Admin Upload
          </button>
        )}
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
        placeholder="Search by participant name or event…"
        style={{ width: "100%", padding: "0.78rem 1rem 0.78rem 2.75rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.5)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
    </div>
  );
}

// ── Event Card Header ─────────────────────────────────────────────────────────
function EventCardHeader({ event, onExpand, expanded, certCount }) {
  return (
    <div onClick={onExpand} style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem 2rem", cursor: "pointer", transition: "background 0.2s", flexWrap: "wrap" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.03)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {/* Cover thumb */}
      <div style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)", background: "#1a1a2e" }}>
        {event.cover_image ? (
          <img src={event.cover_image} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={ev => { ev.target.style.display = "none"; ev.target.parentNode.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.8rem">🏆</div>'; }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>🏆</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "#fff", fontSize: "1.35rem", letterSpacing: "-0.01em" }}>{event.title}</h3>
          <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)", padding: "0.15rem 0.7rem", borderRadius: 3, fontSize: "0.65rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Completed
          </span>
        </div>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          {event.event_date && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>📅 {new Date(event.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>}
          {event.location && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>📍 {event.location}</span>}
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>📜 {certCount} certificate{certCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", transition: "all 0.3s", transform: expanded ? "rotate(180deg)" : "none", flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </div>
    </div>
  );
}

// ── Certificates Table View ───────────────────────────────────────────────────
function CertificatesTable({ certs, search, onCertClick, onDeleteCert, isAuthenticated }) {
  const [ref, visible] = useInView(0.05);

  const filtered = search.trim()
    ? certs.filter(c => (c.participantName || c.original_filename || "").toLowerCase().includes(search.toLowerCase()))
    : certs;

  return (
    <div ref={ref} style={{ overflowX: "auto" }}>
      {filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem" }}>
          {search.trim()
            ? <>No certificate found matching "<strong style={{ color: "rgba(255,255,255,0.5)" }}>{search}</strong>"</>
            : "No certificates uploaded for this event yet."}
        </div>
      ) : (
        <table className="results-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["#", "Participant", "Filename", "Uploaded", "Certificate"].map((h, i) => (
                <th key={h} className={i === 2 || i === 3 ? "hide-mobile" : ""} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.85rem 1rem", textAlign: i === 4 ? "right" : "left", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((cert, i) => (
              <tr key={cert.id} className="result-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "transparent", animation: visible ? `rowIn 0.5s ${i * 0.07}s both` : "none" }}>
                <td style={{ padding: "1rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", width: 48 }}>#{i + 1}</td>
                <td style={{ padding: "1rem", fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.88rem" }}>
                  {cert.participantName || cert.original_filename?.replace(/\.pdf$/i, "") || "Participant"}
                </td>
                <td className="hide-mobile" style={{ padding: "1rem", fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {cert.original_filename || "—"}
                </td>
                <td className="hide-mobile" style={{ padding: "1rem", fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
                  {cert.created_at ? formatDateShort(cert.created_at) : "—"}
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
                    <button onClick={() => onCertClick(cert)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.42rem 0.85rem", background: "transparent", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 4, color: "#C9A84C", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.06em", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.1)"; e.currentTarget.style.borderColor = "#C9A84C"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}>
                      <EyeIcon /> View
                    </button>
                    <a href={cert.storage_path} download target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.42rem 0.85rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", borderRadius: 4, color: "#0d0d1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", textDecoration: "none", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                      <DownloadIcon /> Save
                    </a>
                    {isAuthenticated && (
                      <button onClick={() => onDeleteCert(cert)} title="Delete certificate" style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 4, color: "rgba(220,38,38,0.6)", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.18)"; e.currentTarget.style.color = "#fca5a5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.07)"; e.currentTarget.style.color = "rgba(220,38,38,0.6)"; }}>
                        <TrashIcon />
                      </button>
                    )}
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

// ── Certificates Grid View ────────────────────────────────────────────────────
function CertificatesGrid({ certs, search, onCertClick, onDeleteCert, isAuthenticated }) {
  const [ref, visible] = useInView();

  const filtered = search.trim()
    ? certs.filter(c => (c.participantName || c.original_filename || "").toLowerCase().includes(search.toLowerCase()))
    : certs;

  return (
    <div ref={ref} style={{ padding: "1.5rem 2rem 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.85rem" }}>
      {filtered.length === 0 ? (
        <div style={{ gridColumn: "1/-1", padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem" }}>
          {search.trim() ? `No certificate found matching "${search}"` : "No certificates uploaded for this event yet."}
        </div>
      ) : filtered.map((cert, i) => (
        <div key={cert.id} className="cert-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "1rem 1.25rem", border: "1px solid rgba(201,168,76,0.1)", gap: "0.75rem", opacity: visible ? 1 : 0, animation: visible ? `fadeUp 0.5s ${i * 0.07}s both` : "none" }}>
          <div onClick={() => onCertClick(cert)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, cursor: "pointer", flex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(201,168,76,0.18)", color: "#C9A84C" }}>
              <MedalIcon />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.88rem", marginBottom: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cert.participantName || cert.original_filename?.replace(/\.pdf$/i, "") || "Participant"}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "0.7rem" }}>
                {cert.created_at ? formatDateShort(cert.created_at) : "Certificate"}
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", color: "#C9A84C", fontSize: "0.65rem", marginTop: "0.2rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Tap to Preview →</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
            <a href={cert.storage_path} download target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.75rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", textDecoration: "none", letterSpacing: "0.04em" }}>
              <DownloadIcon /> Save
            </a>
            {isAuthenticated && (
              <button onClick={() => onDeleteCert(cert)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.75rem", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 4, color: "rgba(220,38,38,0.7)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.7rem", cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.2)"; e.currentTarget.style.color = "#fca5a5"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.07)"; e.currentTarget.style.color = "rgba(220,38,38,0.7)"; }}>
                <TrashIcon /> Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteCertModal({ cert, onClose, onDeleted, showToast, token }) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteMedia(cert.id, token);
      showToast("Certificate deleted", "success");
      onDeleted(cert.id);
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
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem" }}>Delete Certificate?</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "0.5rem" }}>
          You are about to delete the certificate for <strong style={{ color: "#fff" }}>{cert.participantName || cert.original_filename || "this participant"}</strong>.
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(220,38,38,0.8)", fontSize: "0.82rem", marginBottom: "1.75rem" }}>
          ⚠️ This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.75rem", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} style={{ flex: 1.5, padding: "0.75rem", borderRadius: 6, background: deleting ? "rgba(220,38,38,0.15)" : "rgba(220,38,38,0.85)", color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: deleting ? "not-allowed" : "pointer", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(220,38,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {deleting ? <><Spinner size={14} color="#fff" /> Deleting...</> : <><TrashIcon /> Yes, Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Results Section ──────────────────────────────────────────────────────
function ResultsSection({ events, certsByEvent, loading, error, onRefresh, onDeleteCert, showToast, isAuthenticated, token }) {
  const [ref, visible] = useInView();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("results");
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [certModal, setCertModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  // Auto-expand first event on load
  useEffect(() => {
    if (events.length > 0 && expandedEventId === null) {
      setExpandedEventId(events[0].id);
    }
  }, [events]);

  const handleDeleteFromModal = async () => {
    if (!certModal) return;
    try {
      await api.deleteMedia(certModal.id, token);
      showToast("Certificate deleted", "success");
      onDeleteCert(certModal.id);
      setCertModal(null);
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
      throw err;
    }
  };

  if (error) {
    return (
      <section style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "#fff", marginBottom: "0.75rem" }}>Could not load results</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem" }}>{error}</p>
        <button onClick={onRefresh} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", border: "none", borderRadius: 6, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
          <RefreshIcon /> Retry
        </button>
      </section>
    );
  }

  return (
    <section style={{ padding: "3rem 1.5rem 6rem", background: "#0d0d1a", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* Top controls */}
        <div ref={ref} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", marginBottom: "2.5rem", flexWrap: "wrap", opacity: visible ? 1 : 0, transition: "all 0.6s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", flex: 1 }}>
            <SearchBar value={search} onChange={setSearch} />
            <button onClick={onRefresh} title="Refresh" style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.color = "#C9A84C"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
              <RefreshIcon />
            </button>
          </div>

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

        {/* Loading state */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "4rem 0" }}>
            <Spinner size={36} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.3)", fontSize: "0.88rem" }}>Loading events and certificates…</span>
          </div>
        )}

        {/* No events */}
        {!loading && events.length === 0 && (
          <div style={{ borderRadius: 20, border: "1px dashed rgba(255,255,255,0.08)", padding: "4rem 2rem", textAlign: "center", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>📭</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "rgba(255,255,255,0.5)", fontSize: "1.4rem", marginBottom: "0.5rem" }}>No Events Found</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.25)", fontSize: "0.85rem" }}>Events and their certificates will appear here once created.</p>
          </div>
        )}

        {/* Event cards */}
        {!loading && events.map(event => {
          const certs = certsByEvent[event.id] || [];
          return (
            <div key={event.id} style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "#111122", marginBottom: "1.5rem", opacity: visible ? 1 : 0, transition: "all 0.6s" }}>
              <EventCardHeader
                event={event}
                expanded={expandedEventId === event.id}
                onExpand={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                certCount={certs.length}
              />

              <div style={{ overflow: "hidden", maxHeight: expandedEventId === event.id ? 4000 : 0, transition: "max-height 0.55s cubic-bezier(0.16,1,0.3,1)", borderTop: expandedEventId === event.id ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                {activeTab === "results" && (
                  <CertificatesTable
                    certs={certs}
                    search={search}
                    onCertClick={setCertModal}
                    onDeleteCert={setDeleteModal}
                    isAuthenticated={isAuthenticated}
                  />
                )}
                {activeTab === "certificates" && (
                  <CertificatesGrid
                    certs={certs}
                    search={search}
                    onCertClick={setCertModal}
                    onDeleteCert={setDeleteModal}
                    isAuthenticated={isAuthenticated}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Coming soon placeholder */}
        {!loading && (
          <div style={{ borderRadius: 20, border: "1px dashed rgba(255,255,255,0.08)", padding: "3rem 2rem", textAlign: "center", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(201,168,76,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", border: "1px solid rgba(201,168,76,0.1)" }}>
              <TrophyIcon />
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "rgba(255,255,255,0.5)", fontSize: "1.4rem", marginBottom: "0.5rem" }}>More Events Coming</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.25)", fontSize: "0.85rem", maxWidth: 380, margin: "0 auto 1.5rem", lineHeight: 1.7 }}>
              Results from upcoming events will be published here. Register for our next event!
            </p>
            <a href="/#events" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.5rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              View Upcoming Events
            </a>
          </div>
        )}
      </div>

      {/* Certificate viewer modal */}
      {certModal && (
        <CertModal
          cert={certModal.storage_path}
          name={certModal.participantName || certModal.original_filename?.replace(/\.pdf$/i, "") || "Certificate"}
          onClose={() => setCertModal(null)}
          onDelete={handleDeleteFromModal}
          canDelete={isAuthenticated}
          showToast={showToast}
          token={token}
        />
      )}

      {/* Delete confirm modal */}
      {deleteModal && (
        <DeleteCertModal
          cert={deleteModal}
          onClose={() => setDeleteModal(null)}
          onDeleted={(id) => { onDeleteCert(id); setDeleteModal(null); }}
          showToast={showToast}
          token={token}
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
  const [events, setEvents] = useState([]);
  const [certsByEvent, setCertsByEvent] = useState({}); // { eventId: [...certs] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Auth
  const [authToken, setAuthToken] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Load all events then fetch PDF media per event
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventsData = await api.getEvents();
      const eventList = eventsData.events || [];
      setEvents(eventList);

      // Fetch media for each event — we treat PDFs as certificates
      const mediaResults = await Promise.allSettled(
        eventList.map(ev => api.getEventMedia(ev.id))
      );

      const byEvent = {};
      mediaResults.forEach((result, i) => {
        const eventId = eventList[i].id;
        if (result.status === "fulfilled") {
          const files = result.value.media_files || result.value.results || [];
          // Filter for PDFs (by extension or mime hint in filename)
          const pdfs = files.filter(f =>
            (f.original_filename || f.storage_path || "").toLowerCase().endsWith(".pdf") ||
            f.file_type === "pdf"
          );
          // If no PDFs, fall back to all files (in case server doesn't preserve extension info)
          byEvent[eventId] = (pdfs.length > 0 ? pdfs : files).map(f => ({
            ...f,
            event_id: eventId,
            event_title: eventList[i].title,
            // Participant name: stored in original_filename without extension
            participantName: (f.original_filename || "").replace(/\.pdf$/i, "").replace(/[-_]/g, " ") || null,
          }));
        } else {
          byEvent[eventId] = [];
        }
      });

      setCertsByEvent(byEvent);
    } catch (err) {
      setError(err.message || "Failed to load results data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUploaded = useCallback((eventId, newMedia, participantName, filename) => {
    const enriched = {
      ...newMedia,
      event_id: eventId,
      file_type: "pdf",
      original_filename: filename,
      participantName: participantName || filename?.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
      created_at: new Date().toISOString(),
    };
    setCertsByEvent(prev => ({
      ...prev,
      [eventId]: [enriched, ...(prev[eventId] || [])],
    }));
  }, []);

  const handleDeleteCert = useCallback((mediaId) => {
    setCertsByEvent(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(eventId => {
        next[eventId] = next[eventId].filter(c => c.id !== mediaId);
      });
      return next;
    });
  }, []);

  const handleLoginSuccess = ({ token, user }) => {
    setAuthToken(token);
    setAuthUser(user);
    setShowAuthModal(false);
    if (pendingAction === "upload") setShowUpload(true);
    setPendingAction(null);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    showToast("Logged out successfully", "success");
  };

  const openAuth = (action) => {
    setPendingAction(action);
    setShowAuthModal(true);
  };

  const handleUploadClick = () => {
    if (!authToken) { openAuth("upload"); return; }
    if (events.length === 0) { showToast("No events found. Create an event first.", "error"); return; }
    setShowUpload(true);
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Navbar
        isAuthenticated={!!authToken}
        user={authUser}
        onLogout={handleLogout}
        onLoginClick={openAuth}
        onUploadClick={handleUploadClick}
      />
      <PageHero />
      <TickerBanner />
      <ResultsSection
        events={events}
        certsByEvent={certsByEvent}
        loading={loading}
        error={error}
        onRefresh={loadData}
        onDeleteCert={handleDeleteCert}
        showToast={showToast}
        isAuthenticated={!!authToken}
        token={authToken}
      />
      <AwardHighlights />
      <Footer />

      {showAuthModal && (
        <AuthModal
          onClose={() => { setShowAuthModal(false); setPendingAction(null); }}
          onSuccess={handleLoginSuccess}
          showToast={showToast}
        />
      )}

      {showUpload && authToken && events.length > 0 && (
        <UploadCertModal
          events={events}
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
          showToast={showToast}
          token={authToken}
        />
      )}

      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}