/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreBuildErrors: true,
  },
  images: {
    loader: "cloudinary",
    path: "https://res.cloudinary.com/dgil12nlr/image/upload",
    domains: ["firebasestorage.googleapis.com", "res.cloudinary.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
