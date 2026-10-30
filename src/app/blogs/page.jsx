"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { saveAuth, loadAuth, clearAuth } from "../lib/auth";
import {
  blogApi,
  makeSlug,
  excerpt,
  formatBlogDate,
  readingTime,
  toDatetimeLocal,
  sortByDateDesc,
} from "../lib/blogs";

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = "https://backone.one4one.co"; // existing ONE4ONE admin login
const SYNE = "'Syne', sans-serif";
const DM = "'DM Sans', sans-serif";
const SERIF = "'Cormorant Garamond', serif";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

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
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes skeletonShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }

  .gold-shimmer {
    background: linear-gradient(90deg, #C9A84C 0%, #e8c96a 40%, #fff8e8 50%, #e8c96a 60%, #C9A84C 100%);
    background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; animation: shimmer 3s linear infinite;
  }
  .slide-track { animation: ticker 30s linear infinite; }
  .slide-track:hover { animation-play-state: paused; }
  .nav-link::after {
    content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px; background: #C9A84C;
    transition: width 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .nav-link:hover::after { width: 100%; }
  .skeleton {
    background: linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%);
    background-size: 400px 100%; animation: skeletonShimmer 1.4s ease infinite; border-radius: 10px;
  }

  .blog-card { transition: border-color 0.3s, box-shadow 0.3s; }
  .blog-card:hover { border-color: rgba(201,168,76,0.4) !important; box-shadow: 0 20px 60px rgba(0,0,0,0.45); }
  .blog-card .blog-img { transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); }
  .blog-card:hover .blog-img { transform: scale(1.05); }
  .blog-card:hover .blog-title { color: #e8c96a; }
  .blog-title { transition: color 0.25s; }

  .featured-card { display: grid; grid-template-columns: 1.3fr 1fr; }
  .clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

  input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible, a:focus-visible {
    outline: 2px solid rgba(201,168,76,0.7); outline-offset: 2px;
  }

  @media (max-width: 860px) {
    .featured-card { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
  }
  @media (min-width: 769px) {
    .mobile-menu-btn { display: none !important; }
    .mobile-nav-drawer { display: none !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

// ── Admin login (same endpoint the gallery/results pages use) ────────────────
async function adminLogin(username, email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.message || "Login failed");
  return { token: json.token, user: { username: json.username, email, role: "admin" } };
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const Svg = ({ children, size = 16, sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const SearchIcon = () => <Svg><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></Svg>;
const RefreshIcon = () => <Svg><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></Svg>;
const PlusIcon = () => <Svg sw={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Svg>;
const EditIcon = () => <Svg size={14}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Svg>;
const TrashIcon = () => <Svg size={14}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></Svg>;
const LogoutIcon = () => <Svg><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Svg>;
const ImageIcon = () => <Svg size={20} sw={1.8}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></Svg>;
const ArrowRight = () => <Svg size={14} sw={2.5}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Svg>;

// ── Small shared pieces ───────────────────────────────────────────────────────
function Spinner({ size = 24, color = "#C9A84C" }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", border: "2px solid rgba(201,168,76,0.15)", borderTopColor: color, animation: "spin 0.75s linear infinite", display: "inline-block", flexShrink: 0 }} />;
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "error" ? "#7f1d1d" : "rgba(201,168,76,0.15)";
  const border = type === "error" ? "#dc2626" : "#C9A84C";
  return (
    <div role="status" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 3000, background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "0.9rem 1.25rem", maxWidth: 380, display: "flex", alignItems: "center", gap: "0.75rem", animation: "fadeUp 0.3s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <span>{type === "error" ? "⚠️" : "✓"}</span>
      <span style={{ fontFamily: DM, fontSize: "0.85rem", color: "#fff", flex: 1 }}>{message}</span>
      <button onClick={onClose} aria-label="Dismiss" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1rem", padding: 0 }}>✕</button>
    </div>
  );
}

function FormField({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ fontFamily: SYNE, fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "0.45rem" }}>
        {label}{required && <span style={{ color: "#C9A84C", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ marginTop: "0.4rem", fontFamily: DM, fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{hint}</p>}
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
const ghostBtn = {
  padding: "0.75rem", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
  color: "rgba(255,255,255,0.5)", fontFamily: SYNE, fontWeight: 700, fontSize: "0.75rem",
  cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
};
const closeBtn = { width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const overlayStyle = (z) => ({ position: "fixed", inset: 0, zIndex: z, background: "rgba(5,5,15,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: "1rem" });

function useLockScroll() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
}

// Cover image with a graceful fallback if the file fails to load
function Cover({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", opacity: 0.25, background: "linear-gradient(135deg,#1e1e3a,#0d0d1a)" }}>📰</div>;
  }
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />;
}

// ── Admin login modal (same fields as the other admin pages) ─────────────────
function AuthModal({ onClose, onSuccess, showToast }) {
  useLockScroll();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const dyn = (f) => ({ ...inputStyle, borderColor: focus === f ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.12)" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = form;
    if (!username.trim() || !email.trim() || !password.trim()) { showToast("All fields are required", "error"); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { showToast("Please enter a valid email", "error"); return; }
    setLoading(true);
    try {
      const { token, user } = await adminLogin(username, email, password);
      showToast(`Welcome, ${user.username}!`, "success");
      onSuccess({ token, user });
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={overlayStyle(2500)}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 16, padding: "2.2rem", width: "100%", maxWidth: 460, animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem" }}>
          <div>
            <div style={{ fontFamily: SYNE, fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Admin Access</div>
            <h3 style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>Sign in to publish</h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={closeBtn}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <FormField label="Username" required><input value={form.username} onChange={set("username")} onFocus={() => setFocus("u")} onBlur={() => setFocus(null)} placeholder="Your username" style={dyn("u")} autoComplete="username" /></FormField>
          <FormField label="Email" required><input type="email" value={form.email} onChange={set("email")} onFocus={() => setFocus("e")} onBlur={() => setFocus(null)} placeholder="you@example.com" style={dyn("e")} autoComplete="email" /></FormField>
          <FormField label="Password" required><input type="password" value={form.password} onChange={set("password")} onFocus={() => setFocus("p")} onBlur={() => setFocus(null)} placeholder="••••••••" style={dyn("p")} autoComplete="current-password" /></FormField>
          <button type="submit" disabled={loading} style={{ ...goldBtn, width: "100%", marginTop: "1rem", padding: "0.9rem", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? <Spinner size={16} color="#0d0d1a" /> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Create / edit blog modal ──────────────────────────────────────────────────
function BlogFormModal({ mode, post, token, onClose, onSaved, onUnauthorized, showToast }) {
  useLockScroll();
  const isEdit = mode === "edit";
  const [title, setTitle] = useState(isEdit ? post.title || "" : "");
  const [body, setBody] = useState(isEdit ? post.body || "" : "");
  const [publishedAt, setPublishedAt] = useState(isEdit ? toDatetimeLocal(post.published_at) : "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(isEdit ? post.image_url || "" : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [focus, setFocus] = useState(null);
  const fileRef = useRef(null);
  const objectUrl = useRef(null);

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  const dyn = (f) => ({ ...inputStyle, borderColor: focus === f ? "rgba(201,168,76,0.6)" : "rgba(255,255,255,0.12)" });

  const pickImage = (file) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { setError("Image must be a JPG, PNG, GIF or WEBP file."); return; }
    if (file.size > MAX_IMAGE_BYTES) { setError("Image is larger than 5 MB. Choose a smaller file."); return; }
    setError("");
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setImageFile(file);
    setPreview(objectUrl.current);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Add a title."); return; }
    if (!body.trim()) { setError("Add the blog content."); return; }
    if (!isEdit && !imageFile) { setError("Choose a cover image for the new blog."); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("body", body);
      if (publishedAt) fd.append("published_at", new Date(publishedAt).toISOString());
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) await blogApi.update(token, post.id, fd);
      else await blogApi.create(token, fd);

      showToast(isEdit ? "Blog updated" : "Blog published", "success");
      onSaved();
    } catch (err) {
      if (err.status === 401) { onUnauthorized(err); return; }
      setError(err.message || "Could not save the blog.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ ...overlayStyle(2100), alignItems: "flex-start", overflowY: "auto", padding: "2rem 1rem" }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 640, margin: "auto", animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontFamily: SYNE, fontSize: "0.68rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Blog Manager</div>
            <h3 style={{ fontFamily: SERIF, fontSize: "1.7rem", fontWeight: 700, color: "#fff" }}>{isEdit ? "Edit blog" : "Upload a new blog"}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <FormField label="Title" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} onFocus={() => setFocus("t")} onBlur={() => setFocus(null)} placeholder="e.g. 5 tips for your first half marathon" style={dyn("t")} />
          </FormField>

          <FormField label="Content" required hint="Markdown works: ## headings, **bold**, - lists, [links](https://...). Plain text is fine too.">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} onFocus={() => setFocus("b")} onBlur={() => setFocus(null)} rows={10} placeholder="Write your blog here..." style={{ ...dyn("b"), resize: "vertical", minHeight: 160, lineHeight: 1.6 }} />
          </FormField>

          <FormField label="Publish date" hint="Optional. Leave blank to publish now.">
            <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} onFocus={() => setFocus("d")} onBlur={() => setFocus(null)} style={{ ...dyn("d"), colorScheme: "dark" }} />
          </FormField>

          <FormField label="Cover image" required={!isEdit} hint={isEdit ? "Leave empty to keep the current image. JPG, PNG, GIF or WEBP, up to 5 MB." : "JPG, PNG, GIF or WEBP, up to 5 MB."}>
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={(e) => pickImage(e.target.files?.[0])} style={{ display: "none" }} />
            <button type="button" onClick={() => fileRef.current?.click()} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.85rem 1rem", background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(201,168,76,0.25)", borderRadius: 8, color: "rgba(255,255,255,0.55)", fontFamily: DM, fontSize: "0.85rem", cursor: "pointer", textAlign: "left" }}>
              <span style={{ color: "#C9A84C", display: "flex" }}><ImageIcon /></span>
              {imageFile ? imageFile.name : "Choose an image"}
            </button>
            {preview && (
              <div style={{ marginTop: "0.75rem", height: 150, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#0d0d1a" }}>
                <img src={preview} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </FormField>

          {error && <div role="alert" style={{ marginBottom: "1rem", padding: "0.7rem 1rem", borderRadius: 8, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#fca5a5", fontFamily: DM, fontSize: "0.82rem" }}>{error}</div>}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button type="button" onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...goldBtn, flex: 2, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? <><Spinner size={16} color="#0d0d1a" /> {isEdit ? "Saving..." : "Publishing..."}</> : isEdit ? "Save changes" : "Publish blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirmation ───────────────────────────────────────────────────────
function DeleteBlogModal({ post, token, onClose, onDeleted, onUnauthorized, showToast }) {
  useLockScroll();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await blogApi.remove(token, post.id);
      showToast("Blog deleted", "success");
      onDeleted();
    } catch (err) {
      if (err.status === 401) { onUnauthorized(err); return; }
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div onClick={onClose} style={overlayStyle(2200)}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ background: "#111122", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 420, animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.5rem" }}>🗑️</div>
        <h3 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem" }}>Delete this blog?</h3>
        <p style={{ fontFamily: DM, color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "0.5rem" }}>
          <strong style={{ color: "#fff" }}>{post.title}</strong> will be removed from the site.
        </p>
        <p style={{ fontFamily: DM, color: "rgba(220,38,38,0.8)", fontSize: "0.82rem", marginBottom: "1.75rem" }}>This cannot be undone.</p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onClose} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{ flex: 1.5, padding: "0.75rem", borderRadius: 6, background: deleting ? "rgba(220,38,38,0.15)" : "rgba(220,38,38,0.85)", color: "#fff", fontFamily: SYNE, fontWeight: 700, fontSize: "0.75rem", cursor: deleting ? "not-allowed" : "pointer", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(220,38,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {deleting ? <><Spinner size={14} color="#fff" /> Deleting...</> : <><TrashIcon /> Delete blog</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ isAuthenticated, user, onLogout }) {
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
  const color = (l) => (l.href === "/blogs" ? "#C9A84C" : "rgba(255,255,255,0.75)");

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
              <a key={l.label} href={l.href} className="nav-link" style={{ position: "relative", fontFamily: SYNE, fontSize: "0.8rem", fontWeight: 600, color: color(l), textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.target.style.color = "#C9A84C")}
                onMouseLeave={(e) => (e.target.style.color = color(l))}>{l.label}</a>
            ))}
            {isAuthenticated && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontFamily: DM, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>{user?.username}</span>
                <button onClick={onLogout} title="Logout" aria-label="Logout" style={{ width: 36, height: 36, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><LogoutIcon /></button>
              </div>
            )}
            <a href="/#contact" style={{ background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", padding: "0.6rem 1.4rem", borderRadius: 4, fontFamily: SYNE, fontWeight: 700, fontSize: "0.76rem", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}>Contact Us</a>
          </div>

          <button className="mobile-menu-btn" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)} style={{ flexDirection: "column", justifyContent: "center", alignItems: "flex-end", gap: 5, width: 44, height: 44, background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem" }}>
            <span style={{ display: "block", width: 24, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", width: 18, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: 12, height: 2, background: "#C9A84C", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </nav>

      <div className="mobile-nav-drawer" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(300px, 85vw)", zIndex: 490, background: "rgba(8,8,20,0.99)", backdropFilter: "blur(30px)", transform: menuOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)", borderLeft: "1px solid rgba(201,168,76,0.12)", padding: "5.5rem 2rem 2rem" }}>
        {links.map((l) => (
          <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: "block", fontFamily: SYNE, fontSize: "1.1rem", fontWeight: 600, color: color(l), textDecoration: "none", padding: "0.9rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{l.label}</a>
        ))}
        {isAuthenticated && (
          <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: DM, color: "rgba(255,255,255,0.6)" }}>{user?.username}</span>
            <button onClick={() => { setMenuOpen(false); onLogout(); }} style={{ background: "none", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5", padding: "0.3rem 0.8rem", borderRadius: 4, fontFamily: SYNE, fontSize: "0.7rem", cursor: "pointer" }}>Logout</button>
          </div>
        )}
        <a href="/#contact" onClick={() => setMenuOpen(false)} style={{ display: "block", marginTop: "1.75rem", padding: "0.9rem", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", borderRadius: 4, fontFamily: SYNE, fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", textAlign: "center", letterSpacing: "0.08em", textTransform: "uppercase" }}>Contact Us</a>
      </div>
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 480, background: "rgba(0,0,0,0.5)" }} />}
    </>
  );
}

// ── Ticker + Hero ─────────────────────────────────────────────────────────────
function TickerBanner() {
  const items = ["ONE4ONE Blogs", "Race Stories", "Training Tips", "Event Updates", "Mt. Kenya Day Dash", "Vienna Loop", "Better Together", "Nairobi, Kenya"];
  const doubled = [...items, ...items];
  return (
    <div style={{ background: "var(--gold)", overflow: "hidden", padding: "0.52rem 0" }}>
      <div className="slide-track" style={{ display: "flex", width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontFamily: SYNE, fontWeight: 700, fontSize: "0.7rem", color: "#0d0d1a", letterSpacing: "0.13em", textTransform: "uppercase", padding: "0 2.5rem", display: "flex", alignItems: "center", gap: "1rem", whiteSpace: "nowrap" }}>
            {item}
            <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "rgba(13,13,26,0.35)" }} />
          </span>
        ))}
      </div>
    </div>
  );
}

function PageHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 150); }, []);
  return (
    <section style={{ position: "relative", height: "44vh", minHeight: 340, overflow: "hidden", background: "#080812", display: "flex", alignItems: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 75% 25%, rgba(201,168,76,0.12) 0%, transparent 55%), linear-gradient(to bottom, #080812 0%, #0d0d1a 100%)" }} />
      <div style={{ position: "absolute", left: "1.5rem", top: "20%", bottom: "20%", width: 1, background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5), transparent)" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", padding: "0 2rem 3.5rem 3rem", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", opacity: loaded ? 1 : 0, transition: "all 0.7s 0.1s" }}>
          <div style={{ width: 28, height: 1, background: "#C9A84C" }} />
          <span style={{ fontFamily: SYNE, fontSize: "0.7rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase" }}>Journal</span>
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(3rem, 8vw, 5.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.02em", opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.8s 0.2s cubic-bezier(0.16,1,0.3,1)" }}>
          Stories from the <span className="gold-shimmer">Trail</span>
        </h1>
        <p style={{ fontFamily: DM, color: "rgba(255,255,255,0.5)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 520, marginTop: "1rem", opacity: loaded ? 1 : 0, transition: "all 0.8s 0.35s" }}>
          Race updates, training advice and behind-the-scenes moments from ONE4ONE events.
        </p>
      </div>
    </section>
  );
}

// ── Cards ─────────────────────────────────────────────────────────────────────
function AdminActions({ onEdit, onDelete }) {
  const base = { width: 34, height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(8px)" };
  return (
    <div style={{ position: "absolute", top: 12, right: 12, zIndex: 5, display: "flex", gap: "0.4rem" }}>
      <button onClick={onEdit} title="Edit blog" aria-label="Edit blog" style={{ ...base, background: "rgba(8,8,18,0.8)", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}><EditIcon /></button>
      <button onClick={onDelete} title="Delete blog" aria-label="Delete blog" style={{ ...base, background: "rgba(8,8,18,0.8)", border: "1px solid rgba(220,38,38,0.4)", color: "#fca5a5" }}><TrashIcon /></button>
    </div>
  );
}

function BlogCard({ post, index, isAdmin, onEdit, onDelete }) {
  return (
    <article className="blog-card" style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#111122", border: "1px solid rgba(255,255,255,0.07)", animation: `fadeUp 0.6s ${Math.min(index, 6) * 0.06}s both` }}>
      {isAdmin && <AdminActions onEdit={() => onEdit(post)} onDelete={() => onDelete(post)} />}
      <Link href={`/blogs/${makeSlug(post)}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
        <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", background: "#1a1a2e" }}>
          <Cover className="blog-img" src={post.image_url} alt={post.title} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,26,0.55) 0%, transparent 50%)", pointerEvents: "none" }} />
        </div>
        <div style={{ padding: "1.4rem 1.5rem 1.6rem" }}>
          <div style={{ fontFamily: DM, fontSize: "0.78rem", color: "#C9A84C", marginBottom: "0.6rem" }}>
            {formatBlogDate(post.published_at || post.created_at)} · {readingTime(post.body)} min read
          </div>
          <h3 className="blog-title clamp-2" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.45rem", lineHeight: 1.2, color: "#fff", marginBottom: "0.65rem", letterSpacing: "-0.01em" }}>{post.title}</h3>
          <p className="clamp-3" style={{ fontFamily: DM, fontSize: "0.88rem", lineHeight: 1.7, color: "rgba(255,255,255,0.45)", marginBottom: "1.1rem" }}>{excerpt(post.body)}</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontFamily: SYNE, fontWeight: 700, fontSize: "0.72rem", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Read blog <ArrowRight /></span>
        </div>
      </Link>
    </article>
  );
}

function FeaturedCard({ post, isAdmin, onEdit, onDelete }) {
  return (
    <article className="blog-card" style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "#111122", border: "1px solid rgba(201,168,76,0.18)", marginBottom: "2rem", animation: "fadeUp 0.7s both" }}>
      {isAdmin && <AdminActions onEdit={() => onEdit(post)} onDelete={() => onDelete(post)} />}
      <Link href={`/blogs/${makeSlug(post)}`} className="featured-card" style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ position: "relative", minHeight: 300, overflow: "hidden", background: "#1a1a2e" }}>
          <Cover className="blog-img" src={post.image_url} alt={post.title} />
        </div>
        <div style={{ padding: "2.25rem 2.25rem 2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ alignSelf: "flex-start", background: "linear-gradient(135deg,#C9A84C,#b8962e)", color: "#0d0d1a", padding: "0.25rem 0.8rem", borderRadius: 3, fontFamily: SYNE, fontWeight: 700, fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>Latest</span>
          <div style={{ fontFamily: DM, fontSize: "0.8rem", color: "#C9A84C", marginBottom: "0.7rem" }}>
            {formatBlogDate(post.published_at || post.created_at)} · {readingTime(post.body)} min read
          </div>
          <h2 className="blog-title clamp-3" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)", lineHeight: 1.1, color: "#fff", marginBottom: "1rem", letterSpacing: "-0.015em" }}>{post.title}</h2>
          <p className="clamp-3" style={{ fontFamily: DM, fontSize: "0.95rem", lineHeight: 1.75, color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem" }}>{excerpt(post.body, 220)}</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontFamily: SYNE, fontWeight: 700, fontSize: "0.76rem", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Read blog <ArrowRight /></span>
        </div>
      </Link>
    </article>
  );
}

function SkeletonGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 380, borderRadius: 16 }} />)}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#080810", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1rem", color: "rgba(255,255,255,0.6)" }}>ONE4ONE</span>
          <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)" }} />
          <span style={{ fontFamily: DM, fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>Blogs</span>
        </div>
        <p style={{ fontFamily: DM, fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>© 2026 ONE4ONE. All rights reserved.</p>
        <a href="/" style={{ fontFamily: SYNE, fontSize: "0.75rem", fontWeight: 700, color: "#C9A84C", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>← Back to Home</a>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BlogsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Auth (same storage as gallery / results / registrations)
  const [authToken, setAuthToken] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Modals
  const [formModal, setFormModal] = useState(null); // { mode: "create" | "edit", post? }
  const [deleteModal, setDeleteModal] = useState(null);

  const showToast = useCallback((message, type = "success") => setToast({ message, type, id: Date.now() }), []);

  useEffect(() => {
    const saved = loadAuth();
    if (saved.token) { setAuthToken(saved.token); setAuthUser(saved.user); }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blogApi.list();
      setPosts(sortByDateDesc(data));
    } catch (err) {
      setError(err.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // The blog server answered 401: the token is not valid there.
  // This is the signal that the existing admin login is not shared with the blog server.
  const handleUnauthorized = useCallback((err) => {
    console.warn("[blogs] 401 from blog server:", err?.message);
    clearAuth();
    setAuthToken(null);
    setAuthUser(null);
    setFormModal(null);
    setDeleteModal(null);
    showToast("The blog server rejected this login (401). Sign in again; if it keeps happening, the blog server needs its own login.", "error");
  }, [showToast]);

  const handleLoginSuccess = ({ token, user }) => {
    saveAuth(token, user);
    setAuthToken(token);
    setAuthUser(user);
    setShowAuth(false);
    if (pendingAction === "upload") setFormModal({ mode: "create" });
    setPendingAction(null);
  };

  const handleLogout = () => {
    clearAuth();
    setAuthToken(null);
    setAuthUser(null);
    showToast("Logged out successfully", "success");
  };

  // Upload Blog: login first if needed, otherwise open the form straight away
  const handleUploadClick = () => {
    if (!authToken) { setPendingAction("upload"); setShowAuth(true); return; }
    setFormModal({ mode: "create" });
  };

  const requireAuthThen = (fn) => (post) => {
    if (!authToken) { setShowAuth(true); return; }
    fn(post);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => (p.title || "").toLowerCase().includes(q) || (p.body || "").toLowerCase().includes(q));
  }, [posts, query]);

  const searching = query.trim().length > 0;
  const featured = !searching && filtered.length > 0 ? filtered[0] : null;
  const gridPosts = featured ? filtered.slice(1) : filtered;
  const isAdmin = !!authToken;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Navbar isAuthenticated={isAdmin} user={authUser} onLogout={handleLogout} />
      <PageHero />
      <TickerBanner />

      <section style={{ padding: "3rem 1.5rem 6rem", background: "#0d0d1a", minHeight: "60vh" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 260 }}>
              <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
                <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}><SearchIcon /></div>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blogs" aria-label="Search blogs" style={{ ...inputStyle, padding: "0.78rem 1rem 0.78rem 2.75rem", background: "rgba(255,255,255,0.04)", borderRadius: 8 }} />
              </div>
              <button onClick={loadPosts} title="Refresh" aria-label="Refresh blogs" style={{ width: 42, height: 42, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.45)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><RefreshIcon /></button>
            </div>
            <button onClick={handleUploadClick} style={{ ...goldBtn, height: 42 }}><PlusIcon /> Upload Blog</button>
          </div>

          {!loading && !error && posts.length > 0 && (
            <div style={{ fontFamily: DM, fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginBottom: "1.25rem" }}>
              <strong style={{ color: "#C9A84C", fontFamily: SERIF, fontSize: "1.2rem" }}>{filtered.length}</strong>{" "}
              {searching ? "matching " : ""}blog{filtered.length !== 1 ? "s" : ""}
            </div>
          )}

          {loading && <SkeletonGrid />}

          {!loading && error && (
            <div style={{ borderRadius: 16, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.05)", padding: "2.5rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>⚠️</div>
              <p style={{ fontFamily: DM, color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 1.25rem" }}>{error}</p>
              <button onClick={loadPosts} style={goldBtn}><RefreshIcon /> Try again</button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div style={{ borderRadius: 20, border: "1px dashed rgba(255,255,255,0.08)", padding: "4rem 2rem", textAlign: "center", background: "rgba(255,255,255,0.015)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", opacity: 0.5 }}>📰</div>
              <h3 style={{ fontFamily: SERIF, fontWeight: 700, color: "rgba(255,255,255,0.55)", fontSize: "1.5rem", marginBottom: "0.4rem" }}>No blogs published yet</h3>
              <p style={{ fontFamily: DM, color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Use Upload Blog to publish the first one.</p>
              <button onClick={handleUploadClick} style={goldBtn}><PlusIcon /> Upload Blog</button>
            </div>
          )}

          {!loading && !error && posts.length > 0 && filtered.length === 0 && (
            <div style={{ borderRadius: 20, border: "1px dashed rgba(255,255,255,0.08)", padding: "3rem 2rem", textAlign: "center" }}>
              <p style={{ fontFamily: SERIF, fontSize: "1.3rem", color: "rgba(255,255,255,0.5)" }}>No blogs match "<span style={{ color: "#C9A84C" }}>{query}</span>"</p>
            </div>
          )}

          {!loading && !error && featured && (
            <FeaturedCard post={featured} isAdmin={isAdmin} onEdit={requireAuthThen((p) => setFormModal({ mode: "edit", post: p }))} onDelete={requireAuthThen(setDeleteModal)} />
          )}

          {!loading && !error && gridPosts.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {gridPosts.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} isAdmin={isAdmin} onEdit={requireAuthThen((x) => setFormModal({ mode: "edit", post: x }))} onDelete={requireAuthThen(setDeleteModal)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {showAuth && <AuthModal onClose={() => { setShowAuth(false); setPendingAction(null); }} onSuccess={handleLoginSuccess} showToast={showToast} />}

      {formModal && authToken && (
        <BlogFormModal
          mode={formModal.mode}
          post={formModal.post}
          token={authToken}
          onClose={() => setFormModal(null)}
          onSaved={() => { setFormModal(null); loadPosts(); }}
          onUnauthorized={handleUnauthorized}
          showToast={showToast}
        />
      )}

      {deleteModal && authToken && (
        <DeleteBlogModal
          post={deleteModal}
          token={authToken}
          onClose={() => setDeleteModal(null)}
          onDeleted={() => { setDeleteModal(null); loadPosts(); }}
          onUnauthorized={handleUnauthorized}
          showToast={showToast}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}