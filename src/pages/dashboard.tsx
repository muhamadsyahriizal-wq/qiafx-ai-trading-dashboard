import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  getGetDashboardQueryKey,
  getGetPortfolioQueryKey,
  getListTradesQueryKey,
  useCreatePaperTrade,
  useGetDashboard,
  useGetMarketChart,
  useGetTradingSignal,
  useListMarkets,
} from '@workspace/api-client-react';
import type { TradingSignal } from '@workspace/api-client-react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  EmptyState,
  ErrorState,
  MarketIcon,
  MiniSparkline,
  Modal,
  PageHeading,
  Panel,
  RefreshCw,
  SignalBadge,
  Skeleton,
  StatusPill,
  Toast,
  TradeForm,
  compactMoney,
  money,
  number,
  relativeTime,
} from '@/components/trading-ui';
import { SMCChart, type SMCOverlayState } from '@/components/smc-chart';

type ChartTimeframe = '15M' | '1H' | '4H';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const dashboardQuery = useGetDashboard();
  const marketQuery = useListMarkets();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1H');
  const [overlays, setOverlays] = useState<SMCOverlayState>({ smc: true, fvg: true, ob: true, liquidity: true, structure: true });
  const chartQuery = useGetMarketChart(selectedSymbol, { interval: timeframe });
  const signalQuery = useGetTradingSignal(selectedSymbol);
  const createTrade = useCreatePaperTrade();
  const [tradeOpen, setTradeOpen] = useState(false);
  const [toast, setToast] = useState('');
  const markets = marketQuery.data ?? dashboardQuery.data?.markets ?? [];
  const featureSymbol = selectedSymbol;
  const market = markets.find((item) => item.symbol === selectedSymbol) ?? dashboardQuery.data?.featuredMarket;
  const signal = signalQuery.data ?? dashboardQuery.data?.signal;
  const activity = dashboardQuery.data?.activity ?? [];
  const isLoading = dashboardQuery.isLoading || marketQuery.isLoading;
  const hasError = dashboardQuery.isError && marketQuery.isError;

  const submitTrade = (data: { side: 'BUY' | 'SELL'; quantity: number; entryPrice: number; stopLoss: number | null; takeProfit: number | null }) => {
    createTrade.mutate(
      { data: { symbol: featureSymbol, ...data } },
      {
        onSuccess: () => {
          setTradeOpen(false);
          setToast('Paper position opened');
          void queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetPortfolioQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
        },
      },
    );
  };

  if (isLoading) return <DashboardSkeleton />;
  if (hasError) return <ErrorState message="The cockpit could not reach the paper trading service." retry={() => { void dashboardQuery.refetch(); void marketQuery.refetch(); }} />;

  return (
    <>
      <PageHeading
        eyebrow="Market overview"
        title="Good morning, stay decisive."
        description="A clean read on the market, without the exchange noise."
        action={<div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/[.06] px-3 py-2 text-xs font-semibold text-accent"><span className="size-1.5 rounded-full bg-accent" />Paper trading active</div>}
      />

      <div className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(330px,.85fr)]">
         <Panel className="overflow-hidden" title={market ? `${market.symbol} · ${market.name}` : selectedSymbol} subtitle="Real OHLC · educational SMC map · paper only" action={<StatusPill status="neutral" label="Live reference" />}>
          <div className="px-5 pt-5 md:px-6">
             <div className="space-y-3 border-b border-border/70 pb-4">
               <div className="flex flex-wrap items-center gap-2">
                 {['BTC/USDT', 'XAU/USD'].map((symbol) => <button key={symbol} type="button" onClick={() => setSelectedSymbol(symbol)} className={`rounded-lg border px-3 py-2 font-mono text-[10px] font-bold transition-colors ${selectedSymbol === symbol ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`} data-testid={`button-market-${symbol.replace('/', '-').toLowerCase()}`}>{symbol}</button>)}
                 <span className="ml-auto font-mono text-[10px] text-muted-foreground">{market?.source}</span>
               </div>
               <div className="flex flex-wrap items-center gap-2">
                 {(['15M', '1H', '4H'] as ChartTimeframe[]).map((item) => <button key={item} type="button" onClick={() => setTimeframe(item)} className={`rounded-md px-3 py-1.5 font-mono text-[10px] font-bold transition-colors ${timeframe === item ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'}`} data-testid={`button-timeframe-${item}`}>{item}</button>)}
                 <div className="ml-auto flex flex-wrap gap-1.5">
                   {([
                     ['smc', 'SMC'],
                     ['fvg', 'FVG'],
                     ['ob', 'OB'],
                     ['liquidity', 'Liquidity'],
                     ['structure', 'Structure'],
                   ] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setOverlays((current) => ({ ...current, [key]: !current[key] }))} className={`rounded-md border px-2 py-1.5 text-[10px] font-semibold transition-colors ${overlays[key] ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-secondary text-muted-foreground'}`} aria-pressed={overlays[key]}>{label} {overlays[key] ? 'ON' : 'OFF'}</button>)}
                 </div>
               </div>
             </div>
            <div className="flex items-end justify-between gap-3">
              <div><div className="font-mono text-3xl font-medium tracking-[-0.07em] md:text-4xl" data-testid="text-featured-price">{money(market?.price, 2)}</div><div className={`mt-2 flex items-center gap-1.5 text-sm font-semibold ${(market?.change24h ?? 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>{(market?.change24h ?? 0) >= 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}{number(Math.abs(market?.change24h ?? 0), 2)}% today</div></div>
              <div className="hidden text-right sm:block"><div className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">24h volume</div><div className="mt-1 font-mono text-sm">{compactMoney(market?.volume24h)}</div></div>
            </div>
             <div className="mt-5"><SMCChart candles={chartQuery.data} signal={signal} timeframe={timeframe} overlays={overlays} symbol={selectedSymbol} /></div>
             <div className="flex items-center justify-between border-t border-border/70 pt-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className={`size-1.5 rounded-full ${chartQuery.isFetching ? 'animate-pulse bg-primary' : 'bg-accent'}`} />{chartQuery.isFetching ? 'Loading live candles' : `Data as of ${market?.dataAsOf ? relativeTime(market.dataAsOf) : '—'}`}</div><button type="button" onClick={() => void chartQuery.refetch()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80" data-testid="button-refresh-chart"><RefreshCw className={`size-3.5 ${chartQuery.isFetching ? 'animate-spin' : ''}`} />Refresh</button></div>
          </div>
        </Panel>

        <Panel className="relative overflow-hidden border-primary/20" title="AI market read" subtitle={signal ? `Updated ${relativeTime(signal.updatedAt)}` : 'Awaiting signal'}>
          <div className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-primary/10 blur-3xl" />
          <div className="px-5 py-5 md:px-6">
            {signal ? <><div className="flex items-center justify-between"><SignalBadge action={signal.action} /><span className="font-mono text-xs text-muted-foreground">{number(signal.confidence, 0)}% factor score</span></div><div className="mt-5 flex items-baseline gap-2"><span className="text-3xl font-extrabold tracking-[-0.06em]">{signal.action === 'WAIT' ? 'WAIT / no valid setup' : `${signal.action} setup`}</span></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${signal.action === 'SELL' ? 'bg-destructive' : signal.action === 'BUY' ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${Math.min(100, signal.confidence)}%` }} /></div><div className="mt-5 grid grid-cols-2 gap-3 text-xs"><SignalLevel label="Entry" value={signal.entryPrice} /><SignalLevel label="SL" value={signal.stopLoss} /><SignalLevel label="TP1" value={signal.takeProfit1} /><SignalLevel label="TP2" value={signal.takeProfit2} /></div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/70 pt-4"><div><div className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">Risk / reward</div><div className="mt-1 font-mono text-sm">{number(signal.riskReward, 2)}R</div></div><div><div className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">Timeframe</div><div className="mt-1 text-sm font-semibold">4H · 1H · 15M</div></div></div><button type="button" onClick={() => setTradeOpen(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110" data-testid="button-open-paper-trade"><BarChart3 className="size-4" />Open paper trade</button></> : <EmptyState icon={BarChart3} title="No signal yet" description="Refresh the market read when the next analysis is available." action={<button type="button" onClick={() => void signalQuery.refetch()} className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold" data-testid="button-refresh-signal">Refresh signal</button>} />}
          </div>
        </Panel>
      </div>

      {signal && <SMCEducationalReason signal={signal} />}

      <div className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
        <Panel title="Markets on watch" subtitle="Reference prices across your shortlist" action={<span className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">{markets.length} tracked</span>}>
          <div className="divide-y divide-border/70">
            {markets.length ? markets.slice(0, 5).map((item) => <div key={item.symbol} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/40 md:px-6"><MarketIcon symbol={item.symbol} accent={item.accent} /><div className="min-w-0 flex-1"><div className="text-sm font-bold">{item.symbol}</div><div className="text-xs text-muted-foreground">{item.name}</div></div><div className="hidden w-20 sm:block"><MiniSparkline values={[item.price * .98, item.price * .99, item.price * 1.01, item.price * .995, item.price]} tone={item.change24h >= 0 ? 'green' : 'red'} /></div><div className="text-right"><div className="font-mono text-sm">{money(item.price)}</div><div className={`font-mono text-[11px] ${item.change24h >= 0 ? 'text-accent' : 'text-destructive'}`}>{item.change24h >= 0 ? '+' : ''}{number(item.change24h)}%</div></div></div>) : <EmptyState icon={BarChart3} title="Watchlist is quiet" description="Tracked markets will appear here when the feed is available." />}
          </div>
        </Panel>
        <Panel title="Recent activity" subtitle="Your latest paper decisions" action={<Link href="/history" className="text-xs font-semibold text-primary hover:text-primary/80" data-testid="link-view-history">View all</Link>}>
          <div className="divide-y divide-border/70">
            {activity.length ? activity.slice(0, 4).map((trade) => <div key={trade.id} className="flex items-center gap-3 px-5 py-3.5 md:px-6"><span className={`grid size-8 place-items-center rounded-lg ${trade.side === 'BUY' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>{trade.side === 'BUY' ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}</span><div className="min-w-0 flex-1"><div className="text-sm font-semibold">{trade.side} {trade.symbol}</div><div className="text-xs text-muted-foreground">{relativeTime(trade.createdAt)} · {number(trade.quantity, 4)} units</div></div><StatusPill status={trade.status === 'open' ? 'open' : 'closed'} label={trade.status} /></div>) : <EmptyState title="No paper trades" description="Use the signal above to make your first sandbox decision." />}
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/40 px-5 py-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-2"><ShieldIcon /><span>Signalroom is a paper-trading cockpit. Market data is for analysis; orders never reach an exchange.</span></div><span className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground/70">No real funds at risk</span></div>
       {tradeOpen && <Modal title={`Open ${featureSymbol} position`} description="Build a paper position around the current reference price." onClose={() => setTradeOpen(false)}><TradeForm symbol={featureSymbol} price={market?.price ?? signal?.entryPrice ?? 0} onSubmit={submitTrade} pending={createTrade.isPending} /></Modal>}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  );
}

function SignalLevel({ label, value }: { label: string; value: number }) {
  return <div><div className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">{label}</div><div className="mt-1 font-mono text-sm">{money(value)}</div></div>;
}

function SMCEducationalReason({ signal }: { signal: TradingSignal }) {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const detections = signal.detections;
  const newest = (pattern: RegExp, timeframe?: string) => [...detections].reverse().find((detection) => pattern.test(`${detection.type} ${detection.status}`) && (!timeframe || detection.timeframe === timeframe));
  const timestamp = (detection?: TradingSignal['detections'][number]) => detection ? ` · Candle ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(detection.timestamp))}` : '';
  const latestCandle = signal.dataAsOf;
  const reasons: Array<{ text: string; timestamp?: string }> = [];
  const htf = newest(/^(HH|HL|LH|LL|BOS|CHoCH|MSS)/, '4H');
  const oneHour = newest(/^(HH|HL|LH|LL|BOS|CHoCH|MSS)/, '1H');
  const liquidity = newest(/Liquidity Sweep|sell-side swept|buy-side swept/i);
  const orderBlock = newest(/OB|Order Block|Supply zone|Demand zone/i);
  const fvg = newest(/FVG/i);
  const break = newest(/^(BOS|CHoCH|MSS)$/);
  if (signal.action === 'WAIT') {
    reasons.push({ text: 'Bukti belum cukup untuk setup yang valid. Sistem memilih WAIT dan tidak memaksa BUY atau SELL.' });
    reasons.push({ text: 'Tunggu confluence struktur, liquidity, zona entry, dan konfirmasi break yang lebih lengkap.', timestamp: latestCandle });
  } else {
    reasons.push({ text: `4H market structure: ${signal.htfBias === 'bullish' ? 'bullish' : 'bearish'} berdasarkan swing high/low yang telah dikonfirmasi.`, timestamp: htf?.timestamp });
    reasons.push({ text: `1H structure confirmation: ${oneHour ? `${oneHour.type} terdeteksi` : 'bias timeframe lebih rendah mengikuti pembacaan multi-timeframe'}.`, timestamp: oneHour?.timestamp });
    reasons.push({ text: liquidity ? `Liquidity sweep ${/sell-side/i.test(`${liquidity.type} ${liquidity.status}`) ? 'sell-side' : 'buy-side'} terdeteksi; harga mengambil level lalu menutup kembali.` : 'Belum ada liquidity sweep yang cukup kuat.', timestamp: liquidity?.timestamp });
    reasons.push({ text: orderBlock ? `${orderBlock.type} diidentifikasi dari candle lawan terakhir sebelum pergerakan kuat.` : 'Order Block aktif belum teridentifikasi.', timestamp: orderBlock?.timestamp });
    reasons.push({ text: fvg ? `${fvg.type} teridentifikasi dari gap tiga candle dengan status ${fvg.status.toLowerCase()}.` : 'FVG aktif belum teridentifikasi.', timestamp: fvg?.timestamp });
    reasons.push({ text: break ? `${break.type} mengonfirmasi perubahan atau kelanjutan struktur melalui penutupan candle.` : 'BOS/CHoCH/MSS belum memberi konfirmasi penuh.', timestamp: break?.timestamp });
    reasons.push({ text: `Entry mengikuti penutupan candle terbaru pada ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(latestCandle))}.`, timestamp: latestCandle });
    reasons.push({ text: `SL ditempatkan di luar area struktur/zona lawan untuk membatasi invalidasi setup.`, timestamp: orderBlock?.timestamp ?? htf?.timestamp ?? latestCandle });
    reasons.push({ text: `TP1 dan TP2 dihitung dari risiko berbasis candle dengan target bertahap; tidak ada target yang menjamin profit.`, timestamp: latestCandle });
  }
  const lessons = [
    ['BOS', 'BOS · Break of Structure', 'BOS terjadi ketika candle menutup melewati swing high atau swing low sebelumnya. Biasanya ini dibaca sebagai kelanjutan arah yang sedang berjalan, tetapi tetap perlu dilihat bersama konteks timeframe yang lebih tinggi.'],
    ['CHoCH', 'CHoCH · Change of Character', 'CHoCH adalah tanda awal bahwa karakter pergerakan berubah. Contohnya, setelah rangkaian lower high/lower low, harga menutup di atas swing high penting.'],
    ['FVG', 'FVG · Fair Value Gap', 'FVG adalah ruang yang terbentuk oleh tiga candle ketika harga bergerak cepat sehingga ada area yang belum banyak diperdagangkan. Status fresh, mitigated, atau invalidated berasal dari candle setelahnya.'],
    ['OB', 'OB · Order Block', 'Order Block adalah candle berlawanan terakhir sebelum displacement yang memecahkan struktur. Zona pada chart berasal dari high-low candle tersebut.'],
    ['Liquidity Sweep', 'Liquidity Sweep', 'Sweep terjadi ketika wick menembus swing high/low atau level likuiditas lalu close kembali. Ini bukan jaminan reversal; tunggu konfirmasi struktur.'],
    ['HH/HL/LH/LL', 'HH · HL · LH · LL', 'HH dan HL menggambarkan struktur bullish. LH dan LL menggambarkan struktur bearish. Label selalu diturunkan dari pivot candle aktual.'],
    ['SNR', 'SNR · Support & Resistance', 'Support adalah area harga yang sebelumnya menahan penurunan; resistance menahan kenaikan. Di sini level berasal dari swing dan high-low periode yang selesai.'],
  ];
  return <Panel className="mb-6" title="Why this setup? · Belajar SMC" subtitle="Penjelasan sederhana berdasarkan candle yang benar-benar diterima dari live OHLC"><div className="p-5 md:p-6"><div className="grid gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(260px,.7fr)]"><div><div className="flex items-center gap-3"><SignalBadge action={signal.action} /><span className="text-sm font-semibold">{signal.action === 'WAIT' ? 'WAIT — NO VALID SETUP' : `${signal.action} setup terdeteksi`}</span></div><ol className="mt-4 space-y-3">{reasons.map((reason, index) => <li key={`${reason.text}-${index}`} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="font-mono text-[10px] text-primary">{String(index + 1).padStart(2, '0')}</span><span>{reason.text}{reason.timestamp ? <span className="mt-0.5 block font-mono text-[10px] text-primary/80">{timestamp({ timestamp: reason.timestamp } as TradingSignal['detections'][number]).replace(' · ', '')}</span> : null}</span></li>)}</ol></div><div className="rounded-xl border border-primary/15 bg-primary/[.05] p-4 text-xs leading-5 text-muted-foreground"><div className="font-mono text-[10px] uppercase tracking-[.14em] text-primary">Cara membaca skor</div><p className="mt-2">Skor {signal.score}/100 merangkum confluence struktur, likuiditas, imbalance, OB, zona, dan displacement. Skor bukan jaminan profit.</p><div className="mt-4 space-y-2">{signal.factors.slice(0, 5).map((factor) => <div key={factor.name} className="flex items-center justify-between gap-3"><span>{factor.name}</span><span className="font-mono text-foreground">{factor.score}/{factor.maxScore}</span></div>)}</div></div></div><div className="mt-6 border-t border-border/70 pt-5"><div className="mb-3 flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.14em] text-primary">Belajar SMC</div><p className="mt-1 text-xs text-muted-foreground">Tap istilah untuk melihat arti sederhananya.</p></div></div><div className="grid gap-2 sm:grid-cols-2">{lessons.map(([key, title, explanation]) => <div key={key} className="rounded-xl border border-border/70 bg-secondary/30"><button type="button" onClick={() => setExpandedLesson((current) => current === key ? null : key)} className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-xs font-semibold" aria-expanded={expandedLesson === key}><span>{title}</span><span className="font-mono text-primary">{expandedLesson === key ? '−' : '+'}</span></button>{expandedLesson === key && <div className="border-t border-border/70 px-3 py-3 text-xs leading-5 text-muted-foreground">{explanation}</div>}</div>)}</div></div></div></Panel>;
}

function ShieldIcon() {
  return <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><span className="text-[11px]">i</span></span>;
}

function DashboardSkeleton() {
  return <div className="space-y-6"><div className="space-y-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-9 w-80" /><Skeleton className="h-4 w-96 max-w-full" /></div><div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(330px,.85fr)]"><Skeleton className="h-[450px]" /><Skeleton className="h-[450px]" /></div></div>;
}