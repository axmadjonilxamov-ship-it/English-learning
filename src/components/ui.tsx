import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/25",
  success: "bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-600/25",
  ghost: "border border-line bg-surface text-ink hover:bg-surface-2",
  subtle: "border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10",
} as const;

const SIZES = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-[1.15rem] py-2.5 text-[0.95rem]",
  lg: "px-6 py-3.5 text-base",
} as const;

type ButtonStyle = { variant?: keyof typeof VARIANTS; size?: keyof typeof SIZES };

const buttonClass = ({ variant = "ghost", size = "md" }: ButtonStyle, extra = "") =>
  `inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;

export function ButtonLink({
  variant,
  size,
  className = "",
  ...props
}: ComponentProps<typeof Link> & ButtonStyle) {
  return <Link {...props} className={buttonClass({ variant, size }, className)} />;
}

/** Yupqa progress chizig'i. */
export function Bar({ percent, className = "", color }: { percent: number; className?: string; color?: string }) {
  return (
    <div className={`h-2 flex-1 overflow-hidden rounded-full bg-surface-2 ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: color ?? "var(--color-brand-500)" }}
      />
    </div>
  );
}

/** Foizni halqa ko'rinishida ko'rsatadi. */
export function Ring({ percent, size = 56, children }: { percent: number; size?: number; children?: ReactNode }) {
  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--color-brand-500) ${percent}%, var(--color-surface-2) 0)`,
      }}
    >
      <div className="absolute rounded-full bg-surface" style={{ inset: size * 0.11 }} />
      <span className="relative text-xs font-extrabold" style={{ fontSize: size * 0.22 }}>
        {children ?? `${percent}%`}
      </span>
    </div>
  );
}

export function StatCard({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      {icon}
      <div>
        <b className="block text-[1.75rem] font-extrabold leading-tight tracking-tight">{value}</b>
        <span className="text-sm text-ink-muted">{label}</span>
      </div>
    </div>
  );
}

export function SectionHead({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <div className="mb-4 mt-14 flex flex-wrap items-baseline justify-between gap-3">
      <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
      {hint && <span className="text-sm text-ink-muted">{hint}</span>}
    </div>
  );
}
