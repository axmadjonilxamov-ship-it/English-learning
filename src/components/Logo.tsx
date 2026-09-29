type Props = {
  /** Belgi yonida "English / Learning Center" yozuvi ko'rsatilsinmi. */
  withWordmark?: boolean;
  className?: string;
  size?: number;
};

/** Saytning logotipi: ko'k nutq pufakchasi ichida "En" va to'q sariq nuqta. */
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`shrink-0 overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path
        d="M10 6h40a9 9 0 0 1 9 9v25a9 9 0 0 1-9 9H26L16 58V49h-6a9 9 0 0 1-9-9V15a9 9 0 0 1 9-9z"
        className="fill-brand-700 dark:fill-brand-500"
      />
      <text
        x="30"
        y="37"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="800"
        fontSize="24"
        fill="#fff"
      >
        En
      </text>
      <circle cx="57" cy="7" r="7" className="fill-accent-500" />
    </svg>
  );
}

export function Logo({ withWordmark = true, className = "", size = 40 }: Props) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-brand-700 dark:text-white">
            English
          </span>
          <span className="mt-1 text-[0.56rem] font-bold uppercase tracking-[0.3em] text-ink-muted max-sm:hidden">
            Learning Center
          </span>
        </span>
      )}
    </span>
  );
}
