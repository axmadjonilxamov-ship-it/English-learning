"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Yordam bosilganda qaysi qism yonishi kerakligini bolalarga uzatadi. */
export type Spot = { target: "ribbon" | "paper" | null; nonce: number };

export const SpotContext = createContext<Spot>({ target: null, nonce: 0 });

function useSpotClass(area: "ribbon" | "paper") {
  const spot = useContext(SpotContext);
  return { active: spot.target === area, key: spot.target === area ? spot.nonce : 0 };
}

/** Mashq oynasining yuqori paneli — "dastur tugmalari" shu yerda. */
export function Ribbon({ children }: { children: ReactNode }) {
  const { active, key } = useSpotClass("ribbon");
  return (
    <div
      key={key}
      className={`mx-3 flex min-h-[116px] flex-wrap rounded-[10px] border border-white/7 bg-[#1f2322] px-1.5 pb-2 pt-3.5 ${
        active ? "spot" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function RibbonGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col border-r border-white/10 px-4 last:border-r-0 max-md:px-2">
      <div className="flex min-h-16 flex-1 items-center gap-2">{children}</div>
      <div className="mt-2 text-center text-sm text-gray-400">{label}</div>
    </div>
  );
}

/** Lentadagi javob varianti (so'z yoki tugma). */
export function RibbonOption({
  children,
  state = "idle",
  ...props
}: React.ComponentProps<"button"> & { state?: "idle" | "correct" | "wrong" | "used" }) {
  const styles = {
    idle: "border-white/12 bg-[#2a2f2e] hover:border-blue-400 hover:bg-[#2c3747]",
    correct: "border-green-500 bg-green-500/20 text-green-200",
    wrong: "border-red-500 bg-red-500/15 anim-shake",
    used: "pointer-events-none opacity-20 border-white/12 bg-[#2a2f2e]",
  }[state];
  return (
    <button
      type="button"
      {...props}
      className={`rounded-[10px] border-[1.5px] px-4 py-2.5 text-[1.05rem] font-semibold text-slate-100 transition disabled:cursor-default ${styles}`}
    >
      {children}
    </button>
  );
}

/** Lentadagi ikonkali tugma (tinglash, sekin, tozalash…). */
export function RibbonButton({
  icon,
  children,
  big,
  ...props
}: React.ComponentProps<"button"> & { icon: ReactNode; big?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className="flex flex-col items-center gap-1 rounded-[10px] border border-transparent px-3 py-1.5 text-sm text-gray-200 transition hover:bg-white/5"
    >
      <span className={big ? "text-[2rem] leading-none" : "text-[1.4rem] leading-none"}>{icon}</span>
      {children}
    </button>
  );
}

/** Oq "hujjat" maydoni — mashq shu yerda bajariladi. */
export function PaperArea({ children }: { children: ReactNode }) {
  const { active, key } = useSpotClass("paper");
  return (
    <div className="flex flex-1 justify-center overflow-auto bg-[#151918] p-7 max-md:p-3">
      <div
        key={key}
        className={`w-full max-w-[820px] rounded-[3px] bg-white px-14 py-12 font-serif text-gray-900 shadow-[0_12px_30px_rgba(0,0,0,.45)] max-md:px-4 max-md:py-6 ${
          active ? "spot" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function PaperTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 text-center font-sans text-[2rem] font-extrabold tracking-tight max-md:text-[1.45rem]">
      {children}
    </div>
  );
}
