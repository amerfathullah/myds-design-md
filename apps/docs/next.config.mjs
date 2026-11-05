import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    // Serve each image in public/ as it is committed (ADR-0006), not
    // re-encoded through the Image Optimization API.
    unoptimized: true,
  },
};

export default withMDX(config);
