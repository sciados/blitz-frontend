/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: { typedRoutes: true },
    // Force embedding the runtime value into the bundle
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
    }
};

// Log so we can confirm in Vercel build output
console.log("NEXT_PUBLIC_API_BASE_URL at build:", process.env.NEXT_PUBLIC_API_BASE_URL);

module.exports = nextConfig;