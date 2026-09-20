import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetDashboardQueryKey, getGetPortfolioQueryKey, getListTradesQueryKey, useClosePaperTrade, useListTrades } from '@workspace/api-client-react';
import { ArrowDownRight, ArrowUpRight, EmptyState, ErrorState, PageHeading, Panel, RefreshCw, StatusPill, Toast, money, number, relativeTime } from '@/components/trading-ui';

type Filter = 'all' | 'open' | 'closed';

export function HistoryPage() {
  const client = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');
  const tradesQuery = useListTrades({ status: filter });
  const closeTrade = useClosePaperTrade();
  const [toast, setToast] = useState('');
  const trades = tradesQuery.data ?? [];

  const closePosition = (id: number) => {
    if (!window.confirm('Close this paper position at the current reference price?')) return;
    closeTrade.mutate({ id }, {
      onSuccess: () => {
        setToast('Paper position closed');
        void client.invalidateQueries({ queryKey: getListTradesQueryKey() });
        void client.invalidateQueries({ queryKey: getGetPortfolioQueryKey() });
        void client.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
    });
  };

  return (
    <>
      <PageHeading eyebrow="Decision log" title="Trade history." description="Every paper decision, kept clear enough to learn from." action={<div className="font-mono text-xs text-muted-foreground">{trades.length} records</div>} />
      <Panel>
        <div className="flex flex-col justify-between gap-4 border-b border-border/70 px-5 py-4 md:flex-row md:items-center md:px-6"><div><h2 className="text-sm font-bold">Paper trades</h2><p className="mt-1 text-xs text-muted-foreground">Open and closed positions from this session.</p></div><div className="flex w-full rounded-xl bg-secondary p-1 md:w-auto">{(['all', 'open', 'closed'] as Filter[]).map((value) => <button type="button" key={value} onClick={() => setFilter(value)} className={`flex-1 rounded-lg px-4 py-2 font-mono text-[10px] uppercase tracking-[.12em] transition-colors md:flex-none ${filter === value ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} data-testid={`button-filter-${value}`}>{value}</button>)}</div></div>
        {tradesQuery.isLoading ? <div className="space-y-3 p-5">{[1, 2, 3, 4].map((item) => <div className="h-16 animate-pulse rounded-xl bg-secondary" key={item} />)}</div> : tradesQuery.isError ? <ErrorState message="Your trade history could not be loaded." retry={() => void tradesQuery.refetch()} /> : trades.length === 0 ? <EmptyState title={`No ${filter === 'all' ? '' : filter + ' '}trades yet`} description={filter === 'open' ? 'Open a paper position from the overview to see it here.' : 'Your paper decisions will stay here as a private, reviewable log.'} /> : <div className="divide-y divide-border/70"><div className="hidden grid-cols-[1.4fr_.8fr_.8fr_.8fr_.8fr_auto] gap-4 px-6 py-3 font-mono text-[10px] uppercase tracking-[.13em] text-muted-foreground md:grid"><span>Market</span><span>Side / size</span><span>Entry</span><span>Exit</span><span>Result</span><span /></div>{trades.map((trade) => <div key={trade.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.4fr_.8fr_.8fr_.8fr_.8fr_auto] md:items-center md:gap-4 md:px-6"><div className="flex items-center gap-3"><span className={`grid size-9 place-items-center rounded-lg ${trade.side === 'BUY' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>{trade.side === 'BUY' ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}</span><div><div className="text-sm font-bold">{trade.symbol}</div><div className="text-xs text-muted-foreground">{relativeTime(trade.createdAt)} · ID {trade.id}</div></div></div><div className="flex items-center justify-between text-xs md:block"><span className="text-muted-foreground md:hidden">Side / size</span><span className="font-mono">{trade.side} · {number(trade.quantity, 4)}</span></div><div className="flex items-center justify-between text-xs md:block"><span className="text-muted-foreground md:hidden">Entry</span><span className="font-mono">{money(trade.entryPrice)}</span></div><div className="flex items-center justify-between text-xs md:block"><span className="text-muted-foreground md:hidden">Exit</span><span className="font-mono">{trade.exitPrice ? money(trade.exitPrice) : '—'}</span></div><div className="flex items-center justify-between text-xs md:block"><span className="text-muted-foreground md:hidden">Result</span><span className={`font-mono font-medium ${(trade.pnl ?? 0) >= 0 ? 'text-accent' : 'text-destructive'}`}>{trade.pnl === null || trade.pnl === undefined ? '—' : `${trade.pnl >= 0 ? '+' : ''}${money(trade.pnl)}`}</span></div><div className="flex items-center justify-between gap-3 md:justify-end">{trade.status === 'open' ? <button type="button" onClick={() => closePosition(trade.id)} disabled={closeTrade.isPending} className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-bold transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50" data-testid={`button-history-close-${trade.id}`}>{closeTrade.isPending && <RefreshCw className="size-3 animate-spin" />}Close</button> : null}<StatusPill status={trade.status === 'open' ? 'open' : 'closed'} label={trade.status} /></div></div>)}</div>}
      </Panel>
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-secondary/35 px-5 py-4 text-xs leading-5 text-muted-foreground"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-[11px] text-primary">i</span>Use history to review process, not just outcome. Past paper performance is not a promise of future results.</div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  );
}