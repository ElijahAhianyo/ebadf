import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { CodeBlock } from "@/components/CodeBlock";

/*
 * Renders a ```mermaid code block from a post.
 *
 * Diagrams shouldn't hard-code colours. Instead they use the shared classes
 * below (e.g. `class iw indigo`), and this component supplies the colours
 * for the current light/dark theme. Thick links (`==>`) get the accent colour.
 *
 * Classes: neutral, ghost (dashed, for inputs), blue, indigo, green, amber,
 * rose, solid (high-contrast, for outputs like "on disk").
 */

type Theme = "light" | "dark";

const FONT = "'Onest', ui-sans-serif, system-ui, sans-serif";

const PALETTES: Record<Theme, { vars: Record<string, string>; classes: Record<string, string> }> = {
  light: {
    vars: {
      background: "#ffffff",
      primaryColor: "#f8fafc",
      primaryBorderColor: "#cbd5e1",
      primaryTextColor: "#0f172a",
      textColor: "#334155",
      lineColor: "#94a3b8",
      edgeLabelBackground: "#f8fafc",
      clusterBkg: "#f8fafc",
      clusterBorder: "#e2e8f0",
      titleColor: "#64748b",
    },
    classes: {
      neutral: "fill:#f8fafc,stroke:#cbd5e1,color:#0f172a",
      ghost: "fill:#ffffff,stroke:#cbd5e1,stroke-dasharray:5 4,color:#334155",
      blue: "fill:#eff6ff,stroke:#93c5fd,color:#1e3a8a",
      indigo: "fill:#eef2ff,stroke:#a5b4fc,color:#312e81",
      green: "fill:#f0fdf4,stroke:#86efac,color:#14532d",
      amber: "fill:#fffbeb,stroke:#fcd34d,color:#78350f",
      rose: "fill:#fff1f2,stroke:#fda4af,color:#881337",
      solid: "fill:#0f172a,stroke:#0f172a,color:#f8fafc",
    },
  },
  dark: {
    vars: {
      background: "#0a0a0a",
      primaryColor: "#171717",
      primaryBorderColor: "#404040",
      primaryTextColor: "#f5f5f5",
      textColor: "#d4d4d4",
      lineColor: "#525252",
      edgeLabelBackground: "#111111",
      clusterBkg: "#111111",
      clusterBorder: "#262626",
      titleColor: "#a3a3a3",
    },
    classes: {
      neutral: "fill:#171717,stroke:#404040,color:#f5f5f5",
      ghost: "fill:#0a0a0a,stroke:#525252,stroke-dasharray:5 4,color:#e5e5e5",
      blue: "fill:#0c1a2e,stroke:#3b82f6,color:#bfdbfe",
      indigo: "fill:#16153a,stroke:#6366f1,color:#c7d2fe",
      green: "fill:#0b1f14,stroke:#22c55e,color:#bbf7d0",
      amber: "fill:#221a08,stroke:#f59e0b,color:#fde68a",
      rose: "fill:#240b12,stroke:#f43f5e,color:#fecdd3",
      solid: "fill:#f5f5f5,stroke:#f5f5f5,color:#0a0a0a",
    },
  },
};

// classDef lines are only valid in flowcharts, so only append them there.
const isFlowchart = (chart: string) =>
  /^\s*(?:%%\{[\s\S]*?\}%%\s*)?(?:flowchart|graph)\b/.test(chart);

const withPalette = (chart: string, theme: Theme) => {
  if (!isFlowchart(chart)) return chart;
  const defs = Object.entries(PALETTES[theme].classes)
    .map(([name, style]) => `    classDef ${name} ${style},stroke-width:1.5px`)
    .join("\n");
  return `${chart.trimEnd()}\n${defs}\n`;
};

type MermaidApi = typeof import("mermaid")["default"];
let mermaidPromise: Promise<MermaidApi> | null = null;
// Loaded on first use, so posts without diagrams don't download Mermaid.
const loadMermaid = () => {
  mermaidPromise ??= import("mermaid").then((m) => m.default);
  return mermaidPromise;
};

export function MermaidDiagram({ chart }: { chart: string }) {
  const { resolvedTheme } = useTheme();
  const rawId = useId();
  const id = `mermaid-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadMermaid()
      .then(async (mermaid) => {
        // Mermaid sizes boxes by measuring text, so wait for Onest to load first.
        await document.fonts?.ready;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          fontFamily: FONT,
          themeVariables: { ...PALETTES[resolvedTheme].vars, fontFamily: FONT, fontSize: "15px" },
          flowchart: { curve: "basis", nodeSpacing: 36, rankSpacing: 60, padding: 18, htmlLabels: true },
        });
        const result = await mermaid.render(id, withPalette(chart, resolvedTheme));
        if (!cancelled) {
          setSvg(result.svg);
          setError(false);
        }
      })
      .catch((err) => {
        console.error("mermaid render error", err);
        // Mermaid can leave its temporary render node behind on failure.
        document.getElementById(`d${id}`)?.remove();
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme, id]);

  // Wide diagrams keep a readable minimum width and scroll sideways on phones
  // instead of shrinking their text.
  useEffect(() => {
    const el = ref.current?.querySelector("svg");
    if (!el) return;
    const natural = parseFloat(el.style.maxWidth) || el.viewBox.baseVal.width;
    if (natural) el.style.minWidth = `${Math.min(natural, 640)}px`;
  }, [svg]);

  if (error) {
    return <CodeBlock className="lang-mermaid">{chart}</CodeBlock>;
  }

  return (
    <figure className="mermaid-diagram not-prose my-8 overflow-x-auto">
      {svg ? (
        <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="h-40 animate-pulse rounded-lg bg-muted/40" aria-label="Loading diagram" />
      )}
    </figure>
  );
}
