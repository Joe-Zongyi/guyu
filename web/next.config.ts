import type { NextConfig } from "next";

// Default: use native SWC (~10x faster startup).
// Set NEXT_USE_WASM_SWC=1 in env to fall back to the WASM binary
// if the native SWC binary fails to load on your machine.
const useWasmBinary = process.env.NEXT_USE_WASM_SWC === "1";

const nextConfig: NextConfig = {
  experimental: {
    useWasmBinary,
  },
  logging: {
    incomingRequests: {
      ignore: [/^\/api\/three-d-growth(?:\/.*)?$/],
    },
  },
};

export default nextConfig;
