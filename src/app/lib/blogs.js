// Shared blog config, API helpers and small utilities.
// Used by src/app/blogs/page.jsx and (next step) src/app/blogs/[slug]/.

// 1) SET THIS: the blog server address, over http for now (port 1988).
//    Replace YOUR_SERVER_IP, or set NEXT_PUBLIC_BLOG_API_URL in .env.local
//    Example: NEXT_PUBLIC_BLOG_API_URL=http://12.34.56.78:1988
export const BLOG_API_URL =
  process.env.NEXT_PUBLIC_BLOG_API_URL || "http://75.119.159.17:1988";

export class BlogApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

async function send(path, { method = "GET", token, body, cache } = {}) {
  if (BLOG_API_URL.includes("YOUR_SERVER_IP")) {
    throw new BlogApiError(
      "Blog API URL is not set yet. Edit BLOG_API_URL in src/app/lib/blogs.js.",
      0
    );
  }
  let res;
  try {
    res = await fetch(`${BLOG_API_URL}${path}`, {
      method,
      cache,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body, // FormData: the browser sets the multipart boundary itself
    });
  } catch {
    throw new BlogApiError(
      "Could not reach the blog server. Check the API URL and that CORS allows this site.",
      0
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fallback = res.status === 401 ? "Unauthorized" : `Request failed (${res.status})`;
    throw new BlogApiError(data.message || data.error || fallback, res.status);
  }
  return data;
}

export const blogApi = {
  async list() {
    // no-store + cache-buster so new, edited and deleted posts show immediately
    const data = await send(`/api/blogs?_=${Date.now()}`, { cache: "no-store" });
    return Array.isArray(data) ? data : [];
  },
  get(id) {
    return send(`/api/blogs/${id}?_=${Date.now()}`, { cache: "no-store" });
  },
  create(token, formData) {
    return send("/api/blogs", { method: "POST", token, body: formData });
  },
  update(token, id, formData) {
    return send(`/api/blogs/${id}`, { method: "PUT", token, body: formData });
  },
  remove(token, id) {
    return send(`/api/blogs/${id}`, { method: "DELETE", token });
  },
};

// ── Utilities ────────────────────────────────────────────────────────────────
export function slugify(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// URL looks like /blogs/my-blog-title-12  (the number at the end is the blog id)
export function makeSlug(blog) {
  return `${slugify(blog.title) || "post"}-${blog.id}`;
}

export function idFromSlug(slug) {
  const m = String(slug || "").match(/(\d+)$/);
  return m ? Number(m[1]) : null;
}

// Removes Markdown and HTML so card excerpts read as plain text
export function stripMarkdown(input) {
  if (!input) return "";
  let t = String(input);
  t = t.replace(/<[^>]+>/g, "");
  t = t.replace(/```[\s\S]*?```/g, "");
  t = t.replace(/`([^`]+)`/g, "$1");
  t = t.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  t = t.replace(/^#{1,6}\s+/gm, "");
  t = t.replace(/(\*\*|__)(.*?)\1/g, "$2");
  t = t.replace(/(\*|_)(.*?)\1/g, "$2");
  t = t.replace(/^>\s?/gm, "");
  t = t.replace(/^\s*[-*+]\s+/gm, "");
  t = t.replace(/^\s*\d+\.\s+/gm, "");
  t = t.replace(/^\s*-{3,}\s*$/gm, "");
  return t.replace(/\s+/g, " ").trim();
}

export function excerpt(body, max = 160) {
  const t = stripMarkdown(body);
  return t.length > max ? t.slice(0, max).trimEnd() + "…" : t;
}

export function formatBlogDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  });
}

export function readingTime(body) {
  const words = stripMarkdown(body).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ISO string -> value for <input type="datetime-local">
export function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function sortByDateDesc(posts) {
  return [...posts].sort(
    (a, b) =>
      new Date(b.published_at || b.created_at).getTime() -
      new Date(a.published_at || a.created_at).getTime()
  );
}