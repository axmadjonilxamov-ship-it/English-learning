import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PathScreen } from "@/components/path/PathScreen";
import { LEVELS, getLevel } from "@/data";

/** Har bir daraja uchun sahifa oldindan tayyorlanadi. */
export function generateStaticParams() {
  return LEVELS.map((level) => ({ level: level.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }) {
  const level = getLevel((await params).level);
  return { title: level ? `${level.full ?? level.name} kurs yo'li — English Learning Center` : "Daraja topilmadi" };
}

export default async function PathPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  // Noto'g'ri manzilda darhol 404 qaytaramiz.
  if (!getLevel(level)) notFound();

  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-muted" />}>
      <PathScreen levelId={level} />
    </Suspense>
  );
}
