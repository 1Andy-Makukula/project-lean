import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            {
                // Supabase Storage
                protocol: "https",
                hostname: "*.supabase.co",
            },
            {
                // Unsplash (seed / placeholder images)
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
};

export default nextConfig;
