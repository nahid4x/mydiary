/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
}

export default nextConfig
