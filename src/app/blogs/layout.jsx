// Server component: lets the "use client" listing page still have SEO metadata.
export const metadata = {
  title: "Blogs | ONE4ONE",
  description:
    "Stories, race updates and guides from ONE4ONE - running, hiking and tour events across Kenya and Africa.",
  openGraph: {
    title: "Blogs | ONE4ONE",
    description:
      "Stories, race updates and guides from ONE4ONE - running, hiking and tour events across Kenya and Africa.",
    type: "website",
  },
};

export default function BlogsLayout({ children }) {
  return children;
}