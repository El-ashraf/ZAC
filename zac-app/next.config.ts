/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  allowedDevOrigins: process.env.BASE44_PUBLIC_HOST_SUFFIX
    ? ['3000-' + process.env.BASE44_PUBLIC_HOST_SUFFIX]
    : undefined,
};

export default nextConfig;
