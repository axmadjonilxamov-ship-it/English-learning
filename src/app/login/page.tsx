import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Kirish — English Learning Center" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
