import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseHost) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL must be set; CSP connect-src cannot be built without it."
  );
}

// Build the websocket origin for Supabase Realtime so CSP doesn't block it.
const supabaseWsOrigin = (() => {
  try {
    const u = new URL(supabaseHost);
    return `wss://${u.host}`;
  } catch {
    return "";
  }
})();

const supabaseImageHost = (() => {
  try {
    return new URL(supabaseHost).hostname;
  } catch {
    return "";
  }
})();

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS — opt-in browsers to TLS for the next two years (preload-eligible).
  // Vercel terminates TLS but does not add HSTS by default.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      // pdfjs-dist may fall back to a blob:-URL worker when the configured
      // workerSrc fails to load. Without 'worker-src self blob:', CSP would
      // block that fallback and the PDF viewer breaks silently.
      "worker-src 'self' blob:",
      // Add wss:// origin for Supabase Realtime; without it CSP blocks the
      // websocket connection.
      `connect-src 'self' ${supabaseHost} ${supabaseWsOrigin}`.trim(),
      "frame-ancestors 'none'",
    ].join("; "),
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // Restrict next/image remote hosts to Supabase only. The codebase does
  // not load images from other hosts; locking this down avoids accidental
  // SSRF if an Image src ever takes user input.
  images: supabaseImageHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseImageHost,
          },
        ],
      }
    : undefined,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
