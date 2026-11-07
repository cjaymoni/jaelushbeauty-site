import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Soap bars used to live at /bars/<slug>. Keep old links and search results working.
  redirects() {
    return [
      { source: "/bars", destination: "/shop/soaps", permanent: true },
      { source: "/bars/:slug", destination: "/shop/soaps/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
