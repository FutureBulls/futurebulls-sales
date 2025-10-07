/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stokzy.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "api.stokzy.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
        port: "",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cdni.iconscout.com",
        port: "",
      },
    ]
  }
};

export default nextConfig;
