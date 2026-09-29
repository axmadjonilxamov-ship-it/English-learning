import type { Task1Prompt } from "@/data/ielts-writing";

/** Task 1 topshirig'idagi grafik — ustunli yoki chiziqli. */
export function TaskChart({ chart }: { chart: Task1Prompt["chart"] }) {
  const W = 620;
  const H = 300;
  const PAD = { top: 20, right: 16, bottom: 46, left: 46 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const max = Math.max(...chart.series.flatMap((s) => s.values));
  // O'qni chiroyli yaxlit songacha ko'taramiz.
  const step = Math.pow(10, Math.floor(Math.log10(max || 1)));
  const top = Math.ceil(max / (step / 2 || 1)) * (step / 2 || 1) || 1;

  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(top * t));

  return (
    <figure className="rounded-2xl border border-line bg-surface p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Topshiriq grafigi">
        {/* Gorizontal chiziqlar va o'q qiymatlari */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} y1={y(t)} x2={W - PAD.right} y2={y(t)} stroke="currentColor" className="text-line" />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="currentColor" className="text-ink-muted">
              {t}
            </text>
          </g>
        ))}

        {chart.kind === "bar"
          ? chart.categories.map((cat, ci) => {
              const groupW = plotW / chart.categories.length;
              const barW = Math.min(26, (groupW - 12) / chart.series.length);
              const groupX = PAD.left + ci * groupW;
              return (
                <g key={cat}>
                  {chart.series.map((s, si) => {
                    const x = groupX + groupW / 2 - (barW * chart.series.length) / 2 + si * barW;
                    const v = s.values[ci];
                    return (
                      <rect key={s.label} x={x} y={y(v)} width={barW - 2} height={PAD.top + plotH - y(v)} rx={3} fill={s.color} />
                    );
                  })}
                  <text
                    x={groupX + groupW / 2}
                    y={H - PAD.bottom + 18}
                    textAnchor="middle"
                    fontSize={11}
                    fill="currentColor"
                    className="text-ink-muted"
                  >
                    {cat}
                  </text>
                </g>
              );
            })
          : chart.series.map((s) => {
              const pts = s.values.map((v, i) => {
                const x = PAD.left + (plotW / Math.max(1, chart.categories.length - 1)) * i;
                return `${x},${y(v)}`;
              });
              return (
                <g key={s.label}>
                  <polyline points={pts.join(" ")} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" />
                  {pts.map((p, i) => {
                    const [px, py] = p.split(",");
                    return <circle key={i} cx={px} cy={py} r={3.5} fill={s.color} />;
                  })}
                </g>
              );
            })}

        {/* Chiziqli grafikda gorizontal o'q yozuvlari */}
        {chart.kind === "line" &&
          chart.categories.map((cat, i) => (
            <text
              key={cat}
              x={PAD.left + (plotW / Math.max(1, chart.categories.length - 1)) * i}
              y={H - PAD.bottom + 18}
              textAnchor="middle"
              fontSize={11}
              fill="currentColor"
              className="text-ink-muted"
            >
              {cat}
            </text>
          ))}

        {/* O'qlar */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="currentColor" className="text-ink-muted" />
        <line
          x1={PAD.left}
          y1={PAD.top + plotH}
          x2={W - PAD.right}
          y2={PAD.top + plotH}
          stroke="currentColor"
          className="text-ink-muted"
        />
      </svg>

      <figcaption className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm">
        {chart.series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <i className="size-3 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="text-ink-muted">({chart.unit})</span>
      </figcaption>
    </figure>
  );
}
