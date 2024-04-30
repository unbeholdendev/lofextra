import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  async headers() {
    return [
      {
        source: "/(.*?)",
        headers: [
          {
            key: "cross-origin-embedder-policy",
            value: "require-corp",
          },
          {
            key: "cross-origin-opener-policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
