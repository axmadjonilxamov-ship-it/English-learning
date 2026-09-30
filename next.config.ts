import type { NextConfig } from "next";

/**
 * Har bir qurilishga noyob belgi beramiz.
 *
 * Brauzerdagi sahifa o'ziga tikilgan belgini `/api/version` qaytargani bilan
 * solishtiradi; farq bo'lsa — yangi versiya chiqqan, demak foydalanuvchiga
 * "ilovani yangilang" deb aytamiz (`UpdatePrompt`).
 *
 * Vercel'da commit raqami ishlatiladi, mahalliyda esa qurilish vaqti.
 */
const buildId = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? String(Date.now());

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: buildId },
};

export default nextConfig;
