import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetDashboardQueryKey, getGetPortfolioQueryKey, getListTradesQueryKey, useClosePaperTrade, useGetPortfolio, useListTrades } from '@workspace/api-client-react';
import { ArrowDownRight, ArrowUpRight, BarChart3, EmptyState, ErrorState, MetricTile, PageHeading, Panel, RefreshCw, StatusPill, Toast, money, number, relativeTime } from '@/components/trading-ui';

export function PortfolioPage() {
  const client = useQueryClient();
  const portfolioQuery = useGetPortfolio();
  const tradesQuery = useListTrades({ status: 'all' });
  const closeTrade = useClosePaperTrade();
  const [toast, setToast] = useState('');
  const portfolio = portfolioQuery.data;
  const trades = tradesQuery.data ?? [];
  const openPositions = trades.filter((trade) => trade.status === 'open');
  const recentClosed = trades.filter((trade) => trade.status === 'closed').slice(0, 5);
  const busy = portfolioQuery.isLoading || tradesQuery.isLoading;

  const closePosition = (id: number) => {
    if (!window.confirm('Close this paper position at the current reference price?')) return;
    closeTrade.mutate({ id }, {
      onSuccess: () => {
        setToast('Paper position closed');
        void client.invalidateQueries({ queryKey: getGetPortfolioQueryKey() });
        void client.invalidateQueries({ queryKey: getListTradesQueryKey() });
        void client.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
    });
  };

  if (busy) return <PortfolioSkeleton />;
  if (portfolioQuery.isError || tradesQuery.isError) return <ErrorState message="Your paper portfolio could not be loaded." retry={() => { void portfolioQuery.refetch(); void tradesQuery.refetch(); }} />;

  return (
    <>
      <PageHeading eyebrow="Paper portfolio" title="Your sandbox, in one view." description="Track exposure and decision quality without the pressure of live execution." action={<div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/[.06] px-3 py-2 text-xs font-semibold text-primary"><BarChart3 className="size-3.5" />Simulation ledger</div>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Total equity" value={money(portfolio?.equity)} note={`${portfolio?.pnlPercent && portfolio.pnlPercent >= 0 ? '+' : ''}${number(portfolio?.pnlPercent)}% all time`} tone={(portfolio?.pnlPercent ?? 0) >= 0 ? 'positive' : 'negative'} icon={BarChart3} />
        <MetricTile label="Available balance" value={money(portfolio?.balance)} note="Ready for new positions" icon={RefreshCw} />
        <MetricTile label="Net PnL" value={`${(portfolio?.pnl ?? 0) >= 0 ? '+' : ''}${money(portfolio?.pnl)}`} note="Closed + open positions" tone={(portfolio?.pnl ?? 0) >= 0 ? 'positive' : 'negative'} icon={(portfolio?.pnl ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight} />
        <MetricTile label="Win rate" value={`${number(portfolio?.winRate, 1)}%`} note={`${portfolio?.totalTrades ?? 0} decisions recorded`} tone="positive" icon={BarChart3} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
        <Panel title="Open positions" subtitle="Nothing here is sent to an exchange" action={<StatusPill status="open" label={`${openPositions.length} active`} />}>
          {openPositions.length ? <div className="divide-y divide-border/70">{openPositions.map((trade) => <div key={trade.id} className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:px-6"><div className={`grid size-10 shrink-0 place-items-center rounded-xl ${trade.side === 'BUY' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>{trade.side === 'BUY' ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-semibold">{trade.symbol}</span><StatusPill status="open" label={trade.side} /></div><div className="mt-1 text-xs text-muted-foreground">Opened {relativeTime(trade.createdAt)} · {number(trade.quantity, 4)} units</div></div><div className="grid grid-cols-2 gap-x-7 gap-y-1 text-right text-xs"><span className="text-muted-foreground">Entry</span><span className="font-mono">{money(trade.entryPrice)}</span><span className="text-muted-foreground">Notional</span><span className="font-mono">{money(trade.entryPrice * trade.quantity)}</span></div><button type="button" onClick={() => closePosition(trade.id)} disabled={closeTrade.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-bold transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50" data-testid={`button-close-position-${trade.id}`}>{closeTrade.isPending ? <RefreshCw className="size-3.5 animate-spin" /> : null}Close position</button></div>)}</div> : <EmptyState icon={BarChart3} title="No open positions" description="Your paper account is flat. Use the overview signal when you are ready to test an idea." />}
        </Panel>
        <Panel title="Performance pulse" subtitle="A quick look at your recent closes">
          {recentClosed.length ? <div className="p-5 md:p-6"><div className="mb-6 flex h-36 items-end gap-2 border-b border-border/70">{recentClosed.slice().reverse().map((trade, index) => { const pnl = trade.pnl ?? 0; const height = Math.max(10, Math.min(100, Math.abs(pnl) / Math.max(1, Math.abs(portfolio?.pnl ?? 1)) * 100)); return <div key={trade.id} className="group flex h-full flex-1 flex-col justify-end gap-2" title={`${money(pnl)} · ${trade.symbol}`}><div className={`w-full rounded-t-md transition-all group-hover:opacity-75 ${pnl >= 0 ? 'bg-accent/70' : 'bg-destructive/70'}`} style={{ height: `${height}%` }} /><span className="font-mono text-[9px] text-muted-foreground">{index + 1}</span></div>; })}</div><div className="space-y-3">{recentClosed.slice(0, 3).map((trade) => <div key={trade.id} className="flex items-center justify-between text-sm"><div><span className="font-semibold">{trade.symbol}</span><span className="ml-2 text-xs text-muted-foreground">{relativeTime(trade.closedAt)}</span></div><span className={`font-mono text-xs font-medium ${(trade.pnl ?? 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>{(trade.pnl ?? 0) >= 0 ? '+' : ''}{money(trade.pnl)}</span></div>)}</div></div> : <EmptyState title="No performance data" description="Close a paper position to start building your decision log." />}
        </Panel>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  );
}

function PortfolioSkeleton() {
  return <div className="space-y-6"><div className="space-y-3"><div className="h-3 w-28 animate-pulse rounded bg-secondary" /><div className="h-9 w-72 animate-pulse rounded bg-secondary" /><div className="h-4 w-96 max-w-full animate-pulse rounded bg-secondary" /></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div className="h-32 animate-pulse rounded-2xl bg-secondary" key={item} />)}</div><div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><div className="h-80 animate-pulse rounded-2xl bg-secondary" /><div className="h-80 animate-pulse rounded-2xl bg-secondary" /></div></div>;
}