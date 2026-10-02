import type { StreakStatus } from "@/lib/streak";

/**
 * Seriya belgisi — yuz ifodasi holatga qarab o'zgaradi.
 *
 *   done    — alanga yorqin, tabassum qilyapti;
 *   atRisk  — alanga rangi so'lg'in, xavotirda, peshanasida ter;
 *   broken  — alanga o'chgan, kulrang, yig'layapti;
 *   none    — hali yoqilmagan, uxlab turibdi.
 *
 * Ranglar atayin qat'iy berilgan: alanga yorug' va qorong'i mavzuda ham bir
 * xil ko'rinishi kerak, chunki uning ma'nosi rangda.
 */

const PALETTE: Record<StreakStatus, { top: string; bottom: string; inner: string; face: string }> = {
  done: { top: "#fbbf24", bottom: "#ea580c", inner: "#fde68a", face: "#7c2d12" },
  atRisk: { top: "#fcd34d", bottom: "#d97706", inner: "#fef3c7", face: "#78350f" },
  broken: { top: "#cbd5e1", bottom: "#64748b", inner: "#e2e8f0", face: "#334155" },
  none: { top: "#e2e8f0", bottom: "#94a3b8", inner: "#f1f5f9", face: "#475569" },
};

export function StreakFlame({
  status,
  className = "size-7",
}: {
  status: StreakStatus;
  className?: string;
}) {
  const c = PALETTE[status];
  const id = `flame-${status}`;

  return (
    <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.top} />
          <stop offset="1" stopColor={c.bottom} />
        </linearGradient>
      </defs>

      {/* Alanga */}
      <path d="M16 2.5c4.2 5.2 7.3 8.4 7.3 13.3a7.3 7.3 0 0 1-14.6 0c0-4.9 3.1-8.1 7.3-13.3z" fill={`url(#${id})`} />
      <path d="M16 11c2.1 2.9 3.6 4.6 3.6 6.9a3.6 3.6 0 0 1-7.2 0c0-2.3 1.5-4 3.6-6.9z" fill={c.inner} opacity={0.55} />

      {/* Ko'zlar */}
      {status === "none" ? (
        // Uxlab turibdi — ko'zlar yumuq.
        <>
          <path d="M11.6 17.4q1.5 1.2 3 0" stroke={c.face} strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M17.4 17.4q1.5 1.2 3 0" stroke={c.face} strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </>
      ) : status === "broken" ? (
        // Yig'layapti — ko'zlar qisilgan.
        <>
          <path d="M11.6 18.4q1.5-1.6 3 0" stroke={c.face} strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M17.4 18.4q1.5-1.6 3 0" stroke={c.face} strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="13.1" cy="17.6" r="1.25" fill={c.face} />
          <circle cx="18.9" cy="17.6" r="1.25" fill={c.face} />
        </>
      )}

      {/* Og'iz */}
      {status === "done" && (
        <path d="M13.2 21.2q2.8 2.4 5.6 0" stroke={c.face} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      )}
      {status === "atRisk" && <ellipse cx="16" cy="21.4" rx="1.5" ry="1.2" fill={c.face} />}
      {status === "broken" && (
        <path d="M13.4 22.2q2.6-2.4 5.2 0" stroke={c.face} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      )}
      {status === "none" && (
        <path d="M14.3 21.6h3.4" stroke={c.face} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      )}

      {/* Yoshlar — faqat uzilganda, pastga tomchilab turadi */}
      {status === "broken" && (
        <>
          <path d="M12.3 20.4c.9 1.3 1.3 1.9 1.3 2.5a1.3 1.3 0 0 1-2.6 0c0-.6.4-1.2 1.3-2.5z" fill="#38bdf8" className="elc-tear" />
          <path
            d="M19.7 20.4c.9 1.3 1.3 1.9 1.3 2.5a1.3 1.3 0 0 1-2.6 0c0-.6.4-1.2 1.3-2.5z"
            fill="#38bdf8"
            className="elc-tear"
            style={{ animationDelay: "0.55s" }}
          />
        </>
      )}

      {/* Xavotir teri */}
      {status === "atRisk" && (
        <path d="M23.4 10.6c.8 1.1 1.2 1.6 1.2 2.2a1.2 1.2 0 0 1-2.4 0c0-.6.4-1.1 1.2-2.2z" fill="#60a5fa" />
      )}

      {/* Davom etayotgan seriyaning uchqunlari */}
      {status === "done" && (
        <>
          <circle cx="25.5" cy="9" r="1.1" fill="#fde68a" opacity={0.9} />
          <circle cx="6.8" cy="11.5" r="0.8" fill="#fde68a" opacity={0.7} />
        </>
      )}
    </svg>
  );
}
