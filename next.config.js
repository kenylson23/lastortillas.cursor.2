/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false, // Using pages directory structure
  },
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'via.placeholder.com',
      // Add your domain here when deploying
    ],
  },
  // Environment variables configuration
  env: {
    CUSTOM_KEY: 'my-value',
  },
  // Optional: Configure redirects
  async redirects() {
    return [
      // Add redirects here if needed
    ];
  },
  // Optional: Configure rewrites
  async rewrites() {
    return [
      // Add rewrites here if needed
    ];
  },
}

module.exports = nextConfig