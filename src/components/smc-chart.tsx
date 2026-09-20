import { useMemo, useState } from "react";
import type { Candle, SMCDetection, TradingSignal } from "@workspace/api-client-react";
import { EmptyState, money, number } from "./trading-ui";
import { BarChart3, ZoomIn, ZoomOut } from "lucide-react";

type Timeframe = "15M" | "1H" | "4H";

export interface SMCOverlayState {
  smc: boolean;
  fvg: boolean;
  ob: boolean;
  liquidity: boolean;
  structure: boolean;
}

interface SMCChartProps {
  candles?: Candle[];
  signal?: TradingSignal;
  timeframe: Timeframe;
  overlays: SMCOverlayState;
  symbol: string;
}

const chartWidth = 1000;
const chartHeight = 470;
const plotLeft = 52;
const plotRight = 936;
const plotTop = 20;
const plotBottom = 312;
const volumeTop = 356;
const volumeBottom = 438;

function closestIndex(candles: Candle[], timestamp: string): number {
  return candles.reduce((closest, candle, index) => {
    const distance = Math.abs(new Date(candle.timestamp).getTime() - new Date(timestamp).getTime());
    const closestDistance = Math.abs(new Date(candles[closest].timestamp).getTime() - new Date(timestamp).getTime());
    return distance < closestDistance ? index : closest;
  }, 0);
}

function formatCandleTime(timestamp: string, timeframe: Timeframe): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: timeframe === "15M" ? undefined : "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

function detectionStyle(detection: SMCDetection): { color: string; fill: string; dash: string } {
  if (/Bullish OB/i.test(detection.type)) return { color: "#38bdf8", fill: "#38bdf8", dash: "2 3" };
  if (/Bearish OB/i.test(detection.type)) return { color: "#fb7185", fill: "#fb7185", dash: "2 3" };
  if (/Bullish FVG/i.test(detection.type)) return { color: "#5eead4", fill: "#5eead4", dash: "5 3" };
  if (/Bearish FVG/i.test(detection.type)) return { color: "#fda4af", fill: "#fda4af", dash: "5 3" };
  if (/Buy-side/i.test(detection.type)) return { color: "#fbbf24", fill: "#fbbf24", dash: "7 4" };
  if (/Sell-side/i.test(detection.type)) return { color: "#22d3ee", fill: "#22d3ee", dash: "7 4" };
  if (/Liquidity Sweep/i.test(detection.type)) return { color: "#f59e0b", fill: "#f59e0b", dash: "1 0" };
  if (/^BOS$/i.test(detection.type)) return { color: "#a78bfa", fill: "#a78bfa", dash: "7 3" };
  if (/CHoCH|MSS/i.test(detection.type)) return { color: "#f0abfc", fill: "#f0abfc", dash: "3 2" };
  if (/Bearish|LH|LL|Supply|resistance|buy-side swept/i.test(`${detection.type} ${detection.status}`)) return { color: "#fb7185", fill: "#fb7185", dash: "5 5" };
  if (/Bullish|HH|HL|Demand|support|sell-side swept/i.test(`${detection.type} ${detection.status}`)) return { color: "#5eead4", fill: "#5eead4", dash: "5 5" };
  return { color: "#a78bfa", fill: "#a78bfa", dash: "5 5" };
}

function relevantDetections(
  detections: SMCDetection[],
  overlays: SMCOverlayState,
  timeframe: Timeframe,
): SMCDetection[] {
  const matching = detections.filter((detection) => {
    if (detection.timeframe !== timeframe) return false;
    if (!overlays.smc) return false;
    if (detection.category === "imbalance") return overlays.fvg;
    if (detection.category === "order_block" || detection.category === "supply_demand") return overlays.ob;
    if (detection.category === "liquidity") return overlays.liquidity;
    if (detection.category === "structure" || detection.category === "support_resistance") return overlays.structure;
    return overlays.structure;
  });
  const newest = (pattern: RegExp, valid = true) => [...matching].reverse().find((detection) => pattern.test(detection.type) && (!valid || detection.status !== "Invalidated"));
  const structure = matching.filter((detection) => /^(HH|HL|LH|LL)$/.test(detection.type)).slice(-4);
  const supportResistance = matching.filter((detection) => detection.category === "support_resistance").slice(-4);
  const selected = [
    newest(/^BOS$/i),
    newest(/CHoCH|MSS/i),
    newest(/Order Block|Bullish OB|Bearish OB/i),
    newest(/Bullish FVG|Bearish FVG/i),
    newest(/Liquidity Sweep/i),
    ...structure,
    ...supportResistance,
  ].filter((detection): detection is SMCDetection => Boolean(detection));
  return [...new Map(selected.map((detection) => [`${detection.type}-${detection.timestamp}-${detection.price}`, detection])).values()];
}

export function SMCChart({ candles = [], signal, timeframe, overlays, symbol }: SMCChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(60);
  const displayCandles = useMemo(() => candles.slice(-displayCount), [candles, displayCount]);
  const detections = useMemo(
    () => relevantDetections(signal?.detections ?? [], overlays, timeframe),
    [overlays, signal?.detections, timeframe],
  );

  const geometry = useMemo(() => {
    if (!displayCandles.length) return null;
    const prices = displayCandles.flatMap((candle) => [candle.high, candle.low]);
    const levels = signal ? [signal.entryPrice, signal.stopLoss, signal.takeProfit1, signal.takeProfit2] : [];
    const detectionPrices = overlays.smc
      ? detections.flatMap((detection) => [detection.price, detection.price2 ?? detection.price])
      : [];
    const finitePrices = [...prices, ...levels, ...detectionPrices].filter(Number.isFinite);
    const low = Math.min(...finitePrices);
    const high = Math.max(...finitePrices);
    const padding = Math.max((high - low) * 0.08, high * 0.001);
    const min = low - padding;
    const max = high + padding;
    const span = max - min || 1;
    const x = (index: number) => plotLeft + (index / Math.max(displayCandles.length - 1, 1)) * (plotRight - plotLeft);
    const y = (price: number) => plotBottom - ((price - min) / span) * (plotBottom - plotTop);
    const volumeMax = Math.max(...displayCandles.map((candle) => candle.volume), 1);
    return { min, max, x, y, volumeMax };
  }, [displayCandles, detections, overlays.smc, signal]);

  if (!geometry) {
    return <EmptyState icon={BarChart3} title="No live candles" description={`The ${symbol} ${timeframe} series is not available yet.`} />;
  }

  const bodyWidth = Math.max(5, Math.min(13, ((plotRight - plotLeft) / displayCandles.length) * 0.72));
  const hoveredCandle = hoverIndex == null ? null : displayCandles[hoverIndex];
  const hoveredX = hoverIndex == null ? null : geometry.x(hoverIndex);
  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = ((event.clientX - rect.left) / rect.width) * chartWidth;
    const index = Math.max(0, Math.min(displayCandles.length - 1, Math.round(((localX - plotLeft) / (plotRight - plotLeft)) * (displayCandles.length - 1))));
    setHoverIndex(index);
  };

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-secondary/40 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">Latest {displayCandles.length} candles · scroll horizontally</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setDisplayCount((count) => Math.max(36, count - 24))} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Zoom in" title="Zoom in"><ZoomIn className="size-3.5" /></button>
          <button type="button" onClick={() => setDisplayCount((count) => Math.min(120, count + 24))} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Zoom out" title="Zoom out"><ZoomOut className="size-3.5" /></button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl bg-background/35">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-[480px] min-w-[760px] w-full touch-none"
          role="img"
          aria-label={`${symbol} ${timeframe} interactive candlestick chart`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="volume-fade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8b8cff" stopOpacity=".28" />
              <stop offset="1" stopColor="#8b8cff" stopOpacity=".04" />
            </linearGradient>
          </defs>
          <rect x={plotLeft} y={plotTop} width={plotRight - plotLeft} height={plotBottom - plotTop} fill="transparent" />
          {[0, 1, 2, 3].map((line) => {
            const y = plotTop + (line / 3) * (plotBottom - plotTop);
            const price = geometry.max - (line / 3) * (geometry.max - geometry.min);
            return (
              <g key={line}>
                <line x1={plotLeft} x2={plotRight} y1={y} y2={y} stroke="hsl(var(--border) / .45)" strokeDasharray="3 5" />
                <text x={plotRight + 8} y={y + 3} fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="ui-monospace">{number(price, 2)}</text>
              </g>
            );
          })}
          <line x1={plotLeft} x2={plotRight} y1={volumeTop - 10} y2={volumeTop - 10} stroke="hsl(var(--border) / .65)" />
          <text x={plotLeft} y={volumeTop + 4} fill="hsl(var(--muted-foreground))" fontSize="9" fontFamily="ui-monospace">VOLUME</text>

          {overlays.smc && detections.map((detection, index) => {
            const candleIndex = closestIndex(displayCandles, detection.timestamp);
            const x = geometry.x(candleIndex);
            const style = detectionStyle(detection);
            const topPrice = Math.max(detection.price, detection.price2 ?? detection.price);
            const bottomPrice = Math.min(detection.price, detection.price2 ?? detection.price);
            const zone = detection.price2 != null && ["imbalance", "order_block", "supply_demand"].includes(detection.category);
            if (zone) {
              return (
                <rect
                  key={`${detection.type}-${detection.timestamp}-${index}`}
                  x={x}
                  y={geometry.y(topPrice)}
                  width={Math.max(24, plotRight - x)}
                  height={Math.max(3, geometry.y(bottomPrice) - geometry.y(topPrice))}
                  fill={style.fill}
                  fillOpacity=".08"
                  stroke={style.color}
                  strokeOpacity=".4"
                  strokeDasharray={style.dash}
                />
              );
            }
            const isLevel = detection.category === "liquidity" || detection.category === "support_resistance";
            return (
              <g key={`${detection.type}-${detection.timestamp}-${index}`}>
                {isLevel && <line x1={x} x2={plotRight} y1={geometry.y(detection.price)} y2={geometry.y(detection.price)} stroke={style.color} strokeOpacity=".55" strokeDasharray={style.dash} />}
                <circle cx={x} cy={geometry.y(detection.price)} r="4.5" fill={style.color} stroke="hsl(var(--card))" strokeWidth="1.5" />
                <text x={Math.min(x + 6, plotRight - 82)} y={geometry.y(detection.price) - 7} fill={style.color} fontSize="9" fontWeight="700">{detection.type}</text>
              </g>
            );
          })}

          {signal && [
            { label: "ENTRY", price: signal.entryPrice, color: "#60a5fa" },
            { label: "SL", price: signal.stopLoss, color: "#fb7185" },
            { label: "TP1", price: signal.takeProfit1, color: "#5eead4" },
            { label: "TP2", price: signal.takeProfit2, color: "#34d399" },
          ].map((level) => (
            <g key={level.label}>
              <line x1={plotLeft} x2={plotRight} y1={geometry.y(level.price)} y2={geometry.y(level.price)} stroke={level.color} strokeWidth="1" strokeDasharray={level.label === "ENTRY" ? "2 2" : "7 5"} strokeOpacity=".85" />
              <rect x={plotRight - 42} y={geometry.y(level.price) - 9} width="42" height="16" rx="3" fill="hsl(var(--card))" stroke={level.color} strokeOpacity=".6" />
              <text x={plotRight - 36} y={geometry.y(level.price) + 3} fill={level.color} fontSize="9" fontWeight="700">{level.label}</text>
            </g>
          ))}

          {displayCandles.map((candle, index) => {
            const x = geometry.x(index);
            const up = candle.close >= candle.open;
            const color = up ? "#5eead4" : "#fb7185";
            const bodyTop = geometry.y(Math.max(candle.open, candle.close));
            const bodyBottom = geometry.y(Math.min(candle.open, candle.close));
            const volumeHeight = (candle.volume / geometry.volumeMax) * (volumeBottom - volumeTop);
            return (
              <g key={candle.timestamp}>
                {index === displayCandles.length - 1 && <rect x={x - bodyWidth / 2 - 3} y={bodyTop - 3} width={bodyWidth + 6} height={Math.max(7, bodyBottom - bodyTop + 6)} rx="3" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />}
                <line x1={x} x2={x} y1={geometry.y(candle.high)} y2={geometry.y(candle.low)} stroke={color} strokeWidth="1.2" />
                <rect x={x - bodyWidth / 2} y={bodyTop} width={bodyWidth} height={Math.max(1.5, bodyBottom - bodyTop)} fill={color} fillOpacity=".9" rx="1" />
                <rect x={x - bodyWidth / 2} y={volumeBottom - volumeHeight} width={bodyWidth} height={volumeHeight} fill="url(#volume-fade)" />
              </g>
            );
          })}

          {hoveredX != null && hoveredCandle && (
            <g pointerEvents="none">
              <line x1={hoveredX} x2={hoveredX} y1={plotTop} y2={volumeBottom} stroke="hsl(var(--primary))" strokeDasharray="3 4" />
              <circle cx={hoveredX} cy={geometry.y(hoveredCandle.close)} r="4" fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth="2" />
            </g>
          )}
          <text x={plotLeft} y={chartHeight - 17} fill="hsl(var(--muted-foreground))" fontSize="9" fontFamily="ui-monospace">{formatCandleTime(displayCandles[0].timestamp, timeframe)}</text>
          <text x={plotRight - 82} y={chartHeight - 17} fill="hsl(var(--muted-foreground))" fontSize="9" fontFamily="ui-monospace">{formatCandleTime(displayCandles[displayCandles.length - 1].timestamp, timeframe)}</text>
        </svg>
      </div>
      {hoveredCandle && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg border border-border bg-card/95 px-3 py-2 shadow-lg">
          <div className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">{formatCandleTime(hoveredCandle.timestamp, timeframe)}</div>
          <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px]">
            <span className="text-muted-foreground">O <b className="text-foreground">{number(hoveredCandle.open, 2)}</b></span>
            <span className="text-muted-foreground">H <b className="text-foreground">{number(hoveredCandle.high, 2)}</b></span>
            <span className="text-muted-foreground">L <b className="text-foreground">{number(hoveredCandle.low, 2)}</b></span>
            <span className="text-muted-foreground">C <b className="text-foreground">{number(hoveredCandle.close, 2)}</b></span>
          </div>
          <div className="mt-1 font-mono text-[10px] text-muted-foreground">VOL {number(hoveredCandle.volume, 0)}</div>
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 font-mono text-[9px] uppercase tracking-[.1em] text-muted-foreground">
        <span><i className="mr-1 inline-block size-1.5 rounded-full bg-[#60a5fa]" />Entry</span>
        <span><i className="mr-1 inline-block size-1.5 rounded-full bg-[#fb7185]" />SL</span>
        <span><i className="mr-1 inline-block size-1.5 rounded-full bg-[#5eead4]" />TP1</span>
        <span><i className="mr-1 inline-block size-1.5 rounded-full bg-[#34d399]" />TP2</span>
        <span className="ml-auto normal-case tracking-normal text-muted-foreground/70">Live OHLC · {signal?.source ?? "reference source"}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-border/70 bg-secondary/30 px-3 py-3 text-[10px] text-muted-foreground sm:grid-cols-4">
        {[
          ["Bull OB", "#38bdf8", "Bullish Order Block"],
          ["Bear OB", "#fb7185", "Bearish Order Block"],
          ["Bull FVG", "#5eead4", "Bullish Fair Value Gap"],
          ["Bear FVG", "#fda4af", "Bearish Fair Value Gap"],
          ["Buy-side", "#fbbf24", "Buy-side liquidity"],
          ["Sell-side", "#22d3ee", "Sell-side liquidity"],
          ["BOS", "#a78bfa", "Break of Structure"],
          ["CHoCH", "#f0abfc", "Change of Character"],
          ["Sweep", "#f59e0b", "Liquidity sweep"],
          ["HH/HL", "#5eead4", "Bullish market structure"],
          ["LH/LL", "#fb7185", "Bearish market structure"],
          ["S/R", "#a78bfa", "Support / resistance"],
        ].map(([label, color, description]) => <span key={label} className="flex items-center gap-1.5" title={description}><i className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} /><b className="text-foreground">{label}</b><span className="hidden sm:inline">{description}</span></span>)}
      </div>
    </div>
  );
}
