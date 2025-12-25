/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        typedRoutes: true
    },
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
    },

    // Webpack configuration for WebAssembly and AI packages
    webpack: (config, { isServer }) => {
        // Enable WebAssembly support
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true,
        };

        // Handle .wasm files as resources
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'asset/resource',
        });

        // CRITICAL: Exclude ONNX Runtime from optimization (minification)
        config.optimization = {
            ...config.optimization,
            minimizer: config.optimization.minimizer?.map((minimizer) => {
                if (minimizer.constructor.name === 'TerserPlugin') {
                    minimizer.options.exclude = /onnxruntime-web|ort\..*\.mjs/;
                }
                return minimizer;
            }),
        };

        // Client-side only: add fallbacks for Node.js modules
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
                stream: false,
                buffer: false,
            };
        }

        return config;
    },

    // Only transpile background-removal, NOT onnxruntime-web
    transpilePackages: [
        '@imgly/background-removal'
    ],
};

console.log("NEXT_PUBLIC_API_BASE_URL at build:", process.env.NEXT_PUBLIC_API_BASE_URL);

module.exports = nextConfig;