// Darslar darajalar bo'yicha alohida fayllarda saqlanadi — har birida 40 ta dars.
// Yangi dars qo'shish uchun kerakli daraja faylidagi modulning `lessons` ro'yxatiga qo'shing.
import type { RawLevel } from "@/types";
import { beginner } from "./levels/beginner";
import { elementary } from "./levels/elementary";
import { preinter } from "./levels/preinter";
import { intermediate } from "./levels/intermediate";
import { upper } from "./levels/upper";
import { ielts } from "./levels/ielts";

export const RAW_LEVELS: RawLevel[] = [beginner, elementary, preinter, intermediate, upper, ielts];
