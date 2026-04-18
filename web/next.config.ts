import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useWasmBinary: true,
  },
  logging: {
    incomingRequests: {
      ignore: [/^\/api\/three-d-growth(?:\/.*)?$/],
    },
  },
};

export default nextConfig;
