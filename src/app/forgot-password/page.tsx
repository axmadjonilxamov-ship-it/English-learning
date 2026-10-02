import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Parolni tiklash — English Learning Center" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
