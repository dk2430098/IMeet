import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "detect-node-es": path.resolve(__dirname, "node_modules/detect-node-es/esm/browser.js"),
    };
    return config;
  },

  async headers() {
    const cspHeader = `
      default-src 'self' 'unsafe-inline' 'unsafe-eval' clerk.com *.clerk.com *.clerk.accounts.dev;
      script-src 'self' 'unsafe-inline' 'unsafe-eval' clerk.com *.clerk.com *.clerk.accounts.dev https://cdn.jsdelivr.net;
      connect-src 'self' clerk.com *.clerk.com *.clerk.accounts.dev api.convex.dev *.convex.cloud *.stream-io-video.com *.getstream.io *.stream-io-api.com wss://*.convex.cloud wss://*.stream-io-video.com wss://*.getstream.io wss://*.stream-io-api.com https://cdn.jsdelivr.net https://emkc.org https://formspree.io;
      img-src 'self' data: https: blob:;
      worker-src 'self' blob: https://cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
      font-src 'self' https://cdn.jsdelivr.net data:;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
