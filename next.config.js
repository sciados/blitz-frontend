/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        typedRoutes: true
    },
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
    },

    // Webpack configuration for ONNX Runtime and WebAssembly
    webpack: (config, { isServer }) => {
        // Enable WebAssembly support for AI models
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true,
        };

        // Handle .wasm files
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'asset/resource',
        });

        // Fix for canvas and other node modules in client-side
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
            };
        }

        return config;
    },

    // Transpile packages that need ESM support
    transpilePackages: [
        'onnxruntime-web',
        '@imgly/background-removal'
    ],
};

console.log("NEXT_PUBLIC_API_BASE_URL at build:", process.env.NEXT_PUBLIC_API_BASE_URL);

module.exports = nextConfig;