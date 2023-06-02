const { withStackbit } = require('experimental-next-stackbit');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['images.ctfassets.net']
    }
};

// module.exports = withStackbit(nextConfig);
module.exports = nextConfig;
