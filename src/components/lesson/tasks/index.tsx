"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { PaperArea, PaperTitle, Ribbon, RibbonButton, RibbonGroup, RibbonOption } from "../shell";
import { seededShuffle } from "@/lib/shuffle";
import { speak } from "@/lib/speech";
import { useT } from "@/lib/i18n";
import type { Task, TaskBuild, TaskChoose, TaskListen, TaskMatch } from "@/types";

/** Yordam tugmasi shu orqali har bir mashq turiga murojaat qiladi. */
export type TaskHandle = { help: () => void };

/**
 * Variantlar tartibini har safar o'zgartirish uchun qo'shimcha urug'.
 *
 * Birinchi renderda bo'sh bo'ladi — shuning uchun serverdagi va brauzerdagi
 * HTML bir xil chiqadi. Sahifa yuklangach tasodifiy qiymat qo'yiladi va
 * variantlar qayta aralashtiriladi, ya'ni darsni qayta ishlaganda savollar
 * boshqa tartibda ko'rinadi.
 */
function useShuffleSalt(): string {
  const [salt, setSalt] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSalt(`:${Math.random().toString(36).slice(2, 8)}`);
  }, []);
  return salt;
}

type Common = {
  /** Sarlavha — oq varaq tepasida (darsning inglizcha nomi). */
  heading: string;
  onSolved: () => void;
  onWrong: (message: string) => void;
};

function SpeakGroup({ text }: { text: string }) {
  const t = useT();
  return (
    <RibbonGroup label={t("task.pronunciation")}>
      <RibbonButton icon="🔊" onClick={() => speak(text)}>
        {t("common.listen")}
      </RibbonButton>
      <RibbonButton icon="🐢" onClick={() => speak(text, 0.6)}>
        {t("common.slow")}
      </RibbonButton>
    </RibbonGroup>
  );
}

// ---------------------------------------------------------------- choose

const ChooseTask = forwardRef<TaskHandle, Common & { task: TaskChoose }>(function ChooseTask(
  { task, heading, onSolved, onWrong },
  ref,
) {
  const t = useT();
  const salt = useShuffleSalt();
  const options = useMemo(() => seededShuffle(task.opts, task.q + salt), [task, salt]);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [hinted, setHinted] = useState(false);

  useImperativeHandle(ref, () => ({ help: () => setHinted(true) }), []);

  const [before, after = ""] = task.q.split("___");

  const choose = (option: string) => {
    if (solved) return;
    if (option === task.a) {
      setSolved(true);
      onSolved();
    } else {
      setWrong(option);
      onWrong(`"${option}" ${t("task.notRight")}`);
    }
  };

  return (
    <>
      <Ribbon>
        <RibbonGroup label={t("task.options")}>
          {options.map((option) => (
            <RibbonOption
              key={option}
              disabled={solved}
              onClick={() => choose(option)}
              state={solved && option === task.a ? "correct" : wrong === option ? "wrong" : "idle"}
              className={hinted && !solved && option === task.a ? "spot" : undefined}
            >
              {option}
            </RibbonOption>
          ))}
        </RibbonGroup>
        <SpeakGroup text={task.q.replace("___", task.a)} />
      </Ribbon>

      <PaperArea>
        <PaperTitle>{heading}</PaperTitle>
        <p className="rounded border-b-[3px] border-blue-300 bg-[#f5f8ff] px-2.5 py-1 text-[1.55rem] leading-[2.1] max-md:text-[1.2rem]">
          {before}
          <span
            className={`mx-1.5 inline-block min-w-[110px] text-center align-bottom leading-[1.5] ${
              solved
                ? "anim-pop rounded border-b-[3px] border-green-600 bg-green-100 px-2.5 font-bold text-green-700"
                : "h-[1.5em] border-b-[3px] border-dashed border-blue-600"
            }`}
          >
            {solved ? task.a : ""}
          </span>
          {after}
        </p>
        <p className="mt-4 font-sans text-[1.1rem] italic text-gray-500">{task.uz}</p>
      </PaperArea>
    </>
  );
});

// ---------------------------------------------------------------- build

const BuildTask = forwardRef<TaskHandle, Common & { task: TaskBuild }>(function BuildTask(
  { task, heading, onSolved, onWrong },
  ref,
) {
  const t = useT();
  const words = useMemo(() => task.s.split(" "), [task]);
  const salt = useShuffleSalt();
  const tiles = useMemo(
    () => seededShuffle(words.map((w, i) => ({ w, key: `${i}-${w}` })), task.s + salt),
    [words, task.s, salt],
  );
  const [placed, setPlaced] = useState<number[]>([]);
  const [status, setStatus] = useState<"idle" | "ok" | "bad">("idle");
  const solved = status === "ok";

  // So'zlar qayta aralashganda joylashtirilganlarni tozalaymiz —
  // aks holda indekslar eski tartibga ishora qilib qoladi.
  const [prevTiles, setPrevTiles] = useState(tiles);
  if (prevTiles !== tiles) {
    setPrevTiles(tiles);
    setPlaced([]);
    setStatus("idle");
  }

  const check = (next: number[]) => {
    if (next.length < tiles.length) return;
    if (next.map((i) => tiles[i].w).join(" ") === task.s) {
      setStatus("ok");
      onSolved();
    } else {
      setStatus("bad");
      onWrong(t("task.wrongOrder"));
    }
  };

  const add = (index: number) => {
    if (solved || placed.includes(index)) return;
    const next = [...placed, index];
    setPlaced(next);
    setStatus("idle");
    check(next);
  };

  useImperativeHandle(
    ref,
    () => ({
      help: () => {
        if (solved) return;
        // Birinchi xato joyni topamiz va undan keyingi so'zlarni olib tashlaymiz.
        let k = 0;
        while (k < placed.length && tiles[placed[k]].w === words[k]) k++;
        if (k < placed.length) {
          setPlaced(placed.slice(0, k));
          setStatus("idle");
          onWrong(t("task.removedAfter"));
          return;
        }
        const next = tiles.findIndex((t, i) => t.w === words[k] && !placed.includes(i));
        if (next !== -1) add(next);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placed, solved, tiles, words],
  );

  return (
    <>
      <Ribbon>
        <RibbonGroup label={t("task.wordsPanel")}>
          <div className="flex max-w-[640px] flex-wrap items-center gap-2">
            {tiles.map((tile, i) => (
              <RibbonOption key={tile.key} onClick={() => add(i)} state={placed.includes(i) ? "used" : "idle"}>
                {tile.w}
              </RibbonOption>
            ))}
          </div>
        </RibbonGroup>
        <RibbonGroup label={t("task.edit")}>
          <RibbonButton
            icon="↺"
            onClick={() => {
              if (solved) return;
              setPlaced([]);
              setStatus("idle");
            }}
          >
            {t("common.clear")}
          </RibbonButton>
        </RibbonGroup>
        <SpeakGroup text={task.s} />
      </Ribbon>

      <PaperArea>
        <PaperTitle>{heading}</PaperTitle>
        <p className="font-sans text-[1.3rem] text-gray-700">“{task.uz}”</p>
        <div
          className={`mt-4.5 mt-[18px] flex min-h-[66px] flex-wrap items-center gap-2 rounded border-b-[3px] px-3 py-2.5 ${
            solved ? "border-green-500 bg-green-50" : status === "bad" ? "anim-shake border-red-500 bg-[#f5f8ff]" : "border-blue-300 bg-[#f5f8ff]"
          }`}
        >
          {placed.length === 0 ? (
            <span className="italic text-gray-400">{t("task.pickWords")}</span>
          ) : (
            placed.map((tileIndex, position) => (
              <button
                key={`${tileIndex}-${position}`}
                type="button"
                onClick={() => {
                  if (solved) return;
                  setPlaced(placed.filter((_, i) => i !== position));
                  setStatus("idle");
                }}
                className={`rounded-lg px-3 py-1.5 font-sans text-[1.3rem] font-semibold transition ${
                  solved ? "cursor-default bg-green-100 text-green-800" : "bg-indigo-100 text-indigo-900 hover:bg-red-100 hover:text-red-800"
                }`}
              >
                {tiles[tileIndex].w}
              </button>
            ))
          )}
          {solved && <span className="-ml-1.5 text-[1.4rem]">{task.end ?? "."}</span>}
        </div>
      </PaperArea>
    </>
  );
});

// ---------------------------------------------------------------- match

const MatchTask = forwardRef<TaskHandle, Common & { task: TaskMatch }>(function MatchTask(
  { task, heading, onSolved, onWrong },
  ref,
) {
  const t = useT();
  const salt = useShuffleSalt();
  const seed = task.pairs.map((p) => p[0]).join("|") + salt;
  const left = useMemo(() => seededShuffle(task.pairs.map((p) => p[0]), seed), [task, seed]);
  const right = useMemo(() => seededShuffle(task.pairs.map((p) => p[1]), seed + "uz"), [task, seed]);

  const [matched, setMatched] = useState<string[]>([]);
  const [selEn, setSelEn] = useState<string | null>(null);
  const [selUz, setSelUz] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState(0);
  const [hint, setHint] = useState<[string, string] | null>(null);

  const pairOf = (en: string) => task.pairs.find((p) => p[0] === en);

  const resolve = (en: string | null, uz: string | null) => {
    if (!en || !uz) return;
    const ok = task.pairs.some((p) => p[0] === en && p[1] === uz);
    setSelEn(null);
    setSelUz(null);
    if (ok) {
      const next = [...matched, en];
      setMatched(next);
      speak(en);
      if (next.length === task.pairs.length) onSolved();
    } else {
      setWrongPair((n) => n + 1);
      onWrong(t("task.wrongPair"));
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      help: () => {
        const pair = task.pairs.find((p) => !matched.includes(p[0]));
        if (pair) setHint([pair[0], pair[1]]);
      },
    }),
    [matched, task.pairs],
  );

  const doneAll = matched.length === task.pairs.length;
  const btn = (text: string, side: "en" | "uz") => {
    const isMatched = side === "en" ? matched.includes(text) : matched.some((en) => pairOf(en)?.[1] === text);
    const selected = side === "en" ? selEn === text : selUz === text;
    const hinted = hint?.[side === "en" ? 0 : 1] === text && !isMatched;
    return (
      <button
        key={text}
        type="button"
        disabled={isMatched}
        onClick={() => {
          if (isMatched) return;
          if (side === "en") {
            setSelEn(text);
            speak(text);
            resolve(text, selUz);
          } else {
            setSelUz(text);
            resolve(selEn, text);
          }
        }}
        className={`rounded-xl border-2 px-4 py-3.5 text-left font-sans text-[1.15rem] font-semibold transition max-md:px-2.5 max-md:py-3 max-md:text-base ${
          isMatched
            ? "cursor-default border-green-500 bg-green-50 text-green-700"
            : selected
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 bg-white hover:border-blue-300"
        } ${hinted ? "spot" : ""}`}
      >
        {text}
      </button>
    );
  };

  return (
    <>
      <Ribbon>
        <RibbonGroup label={t("task.result")}>
          <div className="flex flex-col items-center px-2.5">
            <b className="text-[1.8rem] text-white">
              {matched.length}/{task.pairs.length}
            </b>
            <span className="text-sm text-gray-400">{t("task.pairs")}</span>
          </div>
        </RibbonGroup>
        <SpeakGroup text={task.pairs.map((p) => p[0]).join(", ")} />
      </Ribbon>

      <PaperArea>
        <PaperTitle>{heading}</PaperTitle>
        <div key={wrongPair} className={`grid grid-cols-2 gap-6 max-md:gap-2.5 ${wrongPair && !doneAll ? "anim-shake" : ""}`}>
          <div className="flex flex-col gap-2.5">{left.map((t) => btn(t, "en"))}</div>
          <div className="flex flex-col gap-2.5">{right.map((t) => btn(t, "uz"))}</div>
        </div>
      </PaperArea>
    </>
  );
});

// ---------------------------------------------------------------- listen

const ListenTask = forwardRef<TaskHandle, Common & { task: TaskListen }>(function ListenTask(
  { task, heading, onSolved, onWrong },
  ref,
) {
  const t = useT();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "bad">("idle");
  const [revealed, setRevealed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const solved = status === "ok";

  useImperativeHandle(ref, () => ({ help: () => setRevealed((n) => Math.min(n + 1, task.w.length)) }), [task.w.length]);

  const check = () => {
    if (solved || !value.trim()) return;
    if (value.trim().toLowerCase() === task.w.toLowerCase()) {
      setStatus("ok");
      onSolved();
    } else {
      setStatus("bad");
      onWrong(t("task.listenAgain"));
    }
  };

  return (
    <>
      <Ribbon>
        <RibbonGroup label={t("task.pronunciation")}>
          <RibbonButton icon="🔊" big onClick={() => speak(task.w, 0.85)}>
            {t("common.listen")}
          </RibbonButton>
          <RibbonButton icon="🐢" onClick={() => speak(task.w, 0.55)}>
            {t("common.slow")}
          </RibbonButton>
          <RibbonButton icon="✔️" onClick={check}>
            {t("common.check")}
          </RibbonButton>
        </RibbonGroup>
      </Ribbon>

      <PaperArea>
        <PaperTitle>{heading}</PaperTitle>
        <p className="font-sans italic text-gray-500">{t("task.typeHeard")}</p>
        <input
          ref={inputRef}
          type="text"
          value={value}
          readOnly={solved}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="…"
          onChange={(e) => {
            setValue(e.target.value);
            setStatus("idle");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              check();
            }
          }}
          className={`mt-4 w-full rounded border-b-[3px] bg-[#f5f8ff] px-1.5 py-2 font-serif text-[1.8rem] text-gray-900 outline-none ${
            solved ? "border-green-500 bg-green-50 text-green-800" : status === "bad" ? "anim-shake border-red-500" : "border-blue-300 focus:border-blue-600"
          }`}
        />
        <p className="mt-2.5 min-h-6 font-sans font-semibold tracking-[0.15em] text-gray-500">
          {solved ? (
            <span className="tracking-normal">
              <b className="not-italic text-green-700">{task.w}</b> — {task.uz}
            </span>
          ) : (
            task.w
              .split("")
              .map((c, i) => (i < revealed ? c : "_"))
              .join(" ")
          )}
        </p>
      </PaperArea>
    </>
  );
});

// ---------------------------------------------------------------- tanlovchi

export const TaskView = forwardRef<TaskHandle, Common & { task: Task }>(function TaskView(props, ref) {
  switch (props.task.t) {
    case "choose":
      return <ChooseTask {...props} task={props.task} ref={ref} />;
    case "build":
      return <BuildTask {...props} task={props.task} ref={ref} />;
    case "match":
      return <MatchTask {...props} task={props.task} ref={ref} />;
    case "listen":
      return <ListenTask {...props} task={props.task} ref={ref} />;
  }
});

/** Mashqning "to'g'ri javobi" — ovoz chiqarib o'qish uchun. */
export function taskSentence(task: Task): string {
  switch (task.t) {
    case "choose":
      return task.q.replace("___", task.a).replace(/\(.*?\)/g, "").replace(/\s—.*$/, "");
    case "build":
      return task.s;
    case "listen":
      return task.w;
    case "match":
      return task.pairs.map((p) => p[0]).join(", ");
  }
}

/** Mashq turiga qarab ko'rsatma matni. */
export function TaskInstruction({ task }: { task: Task }) {
  const t = useT();
  const mark = (text: string) => (
    <mark className="rounded bg-slate-400/20 px-1.5 font-bold text-white">{text}</mark>
  );

  switch (task.t) {
    case "choose": {
      const [a, b] = t("task.chooseInstruction").split(t("task.chooseMark"));
      return (<>{a}{mark(t("task.chooseMark"))}{b}</>);
    }
    case "build": {
      const [a, b] = t("task.buildInstruction").split(t("task.buildMark"));
      return (<>{a}{mark(t("task.buildMark"))}{b}</>);
    }
    case "match": {
      const [a, b] = t("task.matchInstruction").split(t("task.matchMark"));
      return (<>{a}{mark(t("task.matchMark"))}{b}</>);
    }
    case "listen": {
      const [a, b] = t("task.listenInstruction").split(t("task.listenMark"));
      return (<>{a}{mark(t("task.listenMark"))}{b}</>);
    }
  }
}
