import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = { title: "Yangi parol — English Learning Center" };

/**
 * Xatdagi havola avval better-auth'ning tekshiruv yo'liga tushadi, u esa
 * bizni shu sahifaga `?token=...` (yoki `?error=INVALID_TOKEN`) bilan
 * qaytaradi. `searchParams` Next 15+ da promise — shuning uchun kutamiz.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  return <ResetPasswordForm token={token ?? null} invalid={Boolean(error)} />;
}
