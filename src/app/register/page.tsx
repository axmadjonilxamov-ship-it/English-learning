import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Ro'yxatdan o'tish — English Learning Center" };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
