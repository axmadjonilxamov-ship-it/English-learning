import { notFound } from "next/navigation";
import { LessonClient } from "@/components/lesson/LessonClient";
import { LEVELS, getLevel } from "@/data";

/** Barcha darslar oldindan tayyorlanadi — sahifa darhol ochiladi. */
export function generateStaticParams() {
  return LEVELS.flatMap((level) => level.lessons.map((lesson) => ({ level: level.id, index: String(lesson.index) })));
}

export async function generateMetadata({ params }: { params: Promise<{ level: string; index: string }> }) {
  const { level: levelId, index } = await params;
  const lesson = getLevel(levelId)?.lessons[Number(index)];
  return { title: lesson ? `${lesson.title} — English Learning Center` : "Dars topilmadi" };
}

export default async function LessonPage({ params }: { params: Promise<{ level: string; index: string }> }) {
  const { level: levelId, index } = await params;
  const level = getLevel(levelId);
  const lesson = level?.lessons[Number(index)];
  if (!level || !lesson) notFound();

  // `key` — dars almashganda mashq holati o'zidan-o'zi boshidan boshlanadi.
  return <LessonClient key={lesson.id} level={level} lesson={lesson} />;
}
