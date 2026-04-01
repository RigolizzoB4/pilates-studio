/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Base64 / data URLs nas telas de postura
  images: {
    unoptimized: true,
  },
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA(nextConfig);
