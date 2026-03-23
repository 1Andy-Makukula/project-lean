import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        // Local /public images (e.g., width, format config) are supported out of the box.
        // However, configuring formats and domains future-proofs the Image component.
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**", // Allows any external image for the MVP. Restrict later for production.
            },
        ],
    },
};

export default nextConfig;
