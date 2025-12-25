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

        // CRITICAL FIX: Configure Terser to skip ONNX Runtime files completely
        if (!isServer && config.optimization && config.optimization.minimizer) {
            const TerserPlugin = require('terser-webpack-plugin');

            config.optimization.minimizer = config.optimization.minimizer.map((plugin) => {
                if (plugin instanceof TerserPlugin) {
                    return new TerserPlugin({
                        ...plugin.options,
                        exclude: [
                            /onnxruntime-web/,
                            /ort\..*\.mjs$/,
                            /ort\..*\.js$/,
                        ],
                    });
                }
                return plugin;
            });
        }

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