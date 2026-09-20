import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Command,
  ExternalLink,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react';

export const money = (value: number | null | undefined, digits = 2) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value ?? 0);

export const compactMoney = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value ?? 0);

export const number = (value: number | null | undefined, digits = 2) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value ?? 0);

export const relativeTime = (value?: string | null) => {
  if (!value) return '—';
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export function LogoMark() {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_7px_18px_-10px_hsl(var(--primary))]" aria-hidden="true">
      <span className="relative block size-4">
        <span className="absolute bottom-0 left-0 h-2.5 w-1.5 rounded-sm bg-current" />
        <span className="absolute bottom-0 left-2.5 h-4 w-1.5 rounded-sm bg-current opacity-75" />
        <span className="absolute bottom-0 left-5 h-3 w-1.5 rounded-sm bg-current opacity-50" />
      </span>
    </span>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      {!compact && (
        <div>
          <div className="font-extrabold tracking-[-0.03em] text-foreground">Signalroom</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">paper cockpit</div>
        </div>
      )}
    </div>
  );
}

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: WalletCards },
  { href: '/history', label: 'Trade history', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings2 },
];

export function Shell({
  children,
  user,
  health,
}: {
  children: ReactNode;
  user?: { firstName?: string; lastName?: string | null; username?: string | null } | null;
  health?: string;
}) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const displayName = user?.firstName || 'Trader';
  const initials = `${user?.firstName?.[0] ?? 'T'}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60 [background-image:radial-gradient(circle_at_15%_15%,hsl(var(--primary)/.07),transparent_28%),radial-gradient(circle_at_90%_5%,hsl(var(--accent)/.05),transparent_24%)]" />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 transition-transform duration-200 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'md:w-[82px]' : ''}`}>
        <div className={`mb-10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2`}>
          <BrandLockup compact={collapsed} />
          {!collapsed && (
            <button type="button" onClick={() => setCollapsed(true)} className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground md:block" aria-label="Collapse navigation" data-testid="button-collapse-navigation">
              <PanelLeftClose className="size-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button type="button" onClick={() => setCollapsed(false)} className="mb-8 hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground md:block" aria-label="Expand navigation" data-testid="button-expand-navigation">
            <PanelLeftOpen className="mx-auto size-4" />
          </button>
        )}
        {!collapsed && <div className="px-3 pb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Workspace</div>}
        <nav className="space-y-1" aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${active ? 'bg-primary/12 text-primary shadow-[inset_3px_0_0_hsl(var(--primary))]' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'} ${collapsed ? 'justify-center px-2' : ''}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
                <Icon className={`size-[18px] shrink-0 ${active ? 'text-primary' : 'text-muted-foreground transition-colors group-hover:text-foreground'}`} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
        {!collapsed && (
          <div className="mt-auto space-y-4">
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.06] p-4">
              <div className="mb-3 flex items-center gap-2 text-primary"><ShieldCheck className="size-4" /><span className="font-mono text-[10px] uppercase tracking-[0.15em]">Safe mode</span></div>
              <p className="text-xs leading-5 text-muted-foreground">Paper orders only. No exchange connection, no real funds.</p>
            </div>
            <div className="flex items-center gap-3 border-t border-sidebar-border px-2 pt-4">
              <span className="grid size-8 place-items-center rounded-full bg-secondary font-mono text-xs font-medium text-primary" data-testid="avatar-user">{initials}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{displayName}</div>
                <div className="truncate text-[11px] text-muted-foreground">{user?.username ? `@${user.username}` : 'Telegram session'}</div>
              </div>
              <div className="size-2 rounded-full bg-accent" title={health === 'ok' ? 'Connected' : 'Connection pending'} />
            </div>
          </div>
        )}
      </aside>
      <div className={`relative z-10 transition-[padding] duration-200 md:pl-[252px] ${collapsed ? 'md:pl-[82px]' : ''}`}>
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl md:px-8">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden" aria-label="Open navigation" data-testid="button-open-navigation">
            <Menu className="size-5" />
          </button>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className="size-1.5 rounded-full bg-accent" />
            <span>Paper environment</span>
            <span className="text-border">/</span>
            <span className="font-mono text-[11px]">{health === 'ok' ? 'SYSTEMS NOMINAL' : 'CONNECTING'}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setNoticeOpen((open) => !open)} className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Notifications" aria-expanded={noticeOpen} data-testid="button-notifications">
              <Bell className="size-[18px]" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
            </button>
            {noticeOpen && <div className="absolute right-4 top-14 w-64 rounded-xl border border-border bg-card p-4 text-left shadow-xl md:right-8" role="status"><div className="flex items-center justify-between"><span className="text-sm font-bold">Workspace notice</span><button type="button" onClick={() => setNoticeOpen(false)} className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Close notification" data-testid="button-close-notification"><X className="size-3.5" /></button></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Your account is in paper mode. There are no live execution alerts.</p></div>}
            <Link href="/settings" className="grid size-8 place-items-center rounded-full border border-border bg-card font-mono text-[11px] font-medium text-primary md:hidden" data-testid="link-mobile-profile">{initials}</Link>
          </div>
        </header>
        {mobileOpen && <button type="button" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm md:hidden" aria-label="Close navigation" data-testid="button-close-navigation"><X className="sr-only" /></button>}
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary"><span className="size-1.5 rounded-full bg-primary" />{eyebrow}</div>
        <h1 className="text-2xl font-extrabold tracking-[-0.04em] text-foreground md:text-[32px]">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = '', title, subtitle, action }: { children: ReactNode; className?: string; title?: string; subtitle?: string; action?: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-card-border bg-card shadow-sm ${className}`}>
      {(title || action) && <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4 md:px-6"><div>{title && <h2 className="text-sm font-bold tracking-[-0.01em]">{title}</h2>}{subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}</div>{action}</div>}
      {children}
    </section>
  );
}

export function MetricTile({ label, value, note, tone = 'default', icon: Icon }: { label: string; value: string; note?: string; tone?: 'default' | 'positive' | 'negative'; icon?: typeof Activity }) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>{Icon && <Icon className="size-4 text-muted-foreground/80" />}</div>
      <div className="text-xl font-bold tracking-[-0.04em] md:text-2xl" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</div>
      {note && <div className={`mt-2 text-xs font-medium ${tone === 'positive' ? 'text-accent' : tone === 'negative' ? 'text-destructive' : 'text-muted-foreground'}`}>{note}</div>}
    </div>
  );
}

export function StatusPill({ status, label }: { status: 'positive' | 'negative' | 'neutral' | 'open' | 'closed'; label: string }) {
  const styles = {
    positive: 'border-accent/25 bg-accent/10 text-accent',
    negative: 'border-destructive/25 bg-destructive/10 text-destructive',
    neutral: 'border-border bg-secondary text-muted-foreground',
    open: 'border-primary/25 bg-primary/10 text-primary',
    closed: 'border-border bg-secondary text-muted-foreground',
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${styles[status]}`}><span className="size-1.5 rounded-full bg-current" />{label}</span>;
}

export function SignalBadge({ action }: { action?: string }) {
  const normalized = action ?? 'WAIT';
  return <StatusPill status={normalized === 'BUY' ? 'positive' : normalized === 'SELL' ? 'negative' : 'neutral'} label={normalized === 'BUY' ? 'Buy bias' : normalized === 'SELL' ? 'Sell bias' : 'Wait'} />;
}

export function MiniSparkline({ values, tone = 'cyan' }: { values: number[]; tone?: 'cyan' | 'green' | 'red' }) {
  const points = useMemo(() => {
    const safe = values.length > 1 ? values : [0, 1];
    const min = Math.min(...safe);
    const max = Math.max(...safe);
    const span = max - min || 1;
    return safe.map((v, i) => `${(i / (safe.length - 1)) * 100},${34 - ((v - min) / span) * 28}`).join(' ');
  }, [values]);
  const stroke = tone === 'green' ? 'hsl(var(--accent))' : tone === 'red' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
  return <svg viewBox="0 0 100 36" preserveAspectRatio="none" className="h-10 w-full overflow-visible" aria-hidden="true"><polyline fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" points={points} /></svg>;
}

export function MarketIcon({ symbol, accent }: { symbol: string; accent?: string }) {
  return <span className="grid size-9 place-items-center rounded-xl font-mono text-[11px] font-bold" style={{ color: accent || 'hsl(var(--primary))', backgroundColor: `${accent || 'hsl(var(--primary))'}1a` }}>{symbol.replace('/USDT', '').slice(0, 3)}</span>;
}

export function Chart({ candles, positive = true }: { candles?: Array<{ close: number; high: number; low: number }>; positive?: boolean }) {
  const points = useMemo(() => {
    const values = candles?.map((c) => c.close) ?? [];
    const fallback = [96, 101, 99, 108, 105, 116, 112, 121, 117, 126, 124, 132, 130, 140, 136, 146, 150, 147, 157, 161, 158, 166];
    const series = values.length > 2 ? values : fallback;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const span = max - min || 1;
    return series.map((v, index) => `${(index / (series.length - 1)) * 100},${92 - ((v - min) / span) * 70}`).join(' ');
  }, [candles]);
  const color = positive ? 'hsl(var(--accent))' : 'hsl(var(--destructive))';
   const area = `${points} 100,100 0,100`;
  return (
    <div className="relative h-[218px] w-full overflow-hidden rounded-xl bg-background/35 md:h-[270px]">
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/.28)_1px,transparent_1px)] bg-[size:25%_33.333%]" />
      <div className="absolute inset-x-0 bottom-3 flex justify-between px-3 font-mono text-[9px] text-muted-foreground/60"><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span><span>Now</span></div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-0 top-3 h-[calc(100%-28px)] w-full px-1">
        <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".2" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        <polygon points={area} fill="url(#chart-fill)" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.25" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute right-3 top-3 rounded bg-card/80 px-2 py-1 font-mono text-[9px] text-muted-foreground">1D / BTCUSDT</div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Activity, title, description, action }: { icon?: typeof Activity; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center px-6 py-14 text-center"><span className="mb-4 grid size-12 place-items-center rounded-2xl border border-border bg-secondary text-muted-foreground"><Icon className="size-5" /></span><h3 className="font-bold">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function ErrorState({ message = 'Something went wrong loading this view.', retry }: { message?: string; retry?: () => void }) {
  return <div className="flex flex-col items-center justify-center px-6 py-14 text-center"><span className="mb-4 grid size-12 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive"><CircleHelp className="size-5" /></span><h3 className="font-bold">Could not load data</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{message}</p>{retry && <button type="button" onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold transition-colors hover:bg-muted" data-testid="button-retry"><RefreshCw className="size-3.5" />Try again</button>}</div>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-secondary ${className}`} aria-hidden="true" />;
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-accent/20 bg-card px-4 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-bottom-2" role="status" data-testid="status-toast"><span className="grid size-5 place-items-center rounded-full bg-accent/15 text-accent"><Check className="size-3" /></span>{message}<button type="button" onClick={onClose} className="ml-1 rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Dismiss notification" data-testid="button-dismiss-toast"><X className="size-3.5" /></button></div>;
}

export function Modal({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-3 backdrop-blur-sm md:items-center" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-3 md:animate-in md:zoom-in-95"><div className="flex items-start justify-between border-b border-border px-5 py-4"><div><h2 className="font-bold">{title}</h2>{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div><button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close dialog" data-testid="button-close-dialog"><X className="size-4" /></button></div>{children}</div></div>;
}

export function TradeForm({ symbol, price, onSubmit, pending }: { symbol: string; price: number; onSubmit: (data: { side: 'BUY' | 'SELL'; quantity: number; entryPrice: number; stopLoss: number | null; takeProfit: number | null }) => void; pending?: boolean }) {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('0.01');
  const [entryPrice, setEntryPrice] = useState(String(price));
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const valid = Number(quantity) > 0 && Number(entryPrice) > 0;
  return <form onSubmit={(event) => { event.preventDefault(); if (valid) onSubmit({ side, quantity: Number(quantity), entryPrice: Number(entryPrice), stopLoss: stopLoss ? Number(stopLoss) : null, takeProfit: takeProfit ? Number(takeProfit) : null }); }} className="space-y-4 p-5">
    <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1"><button type="button" onClick={() => setSide('BUY')} className={`rounded-lg py-2 text-xs font-bold transition-colors ${side === 'BUY' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`} data-testid="button-trade-buy">Buy / long</button><button type="button" onClick={() => setSide('SELL')} className={`rounded-lg py-2 text-xs font-bold transition-colors ${side === 'SELL' ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground hover:text-foreground'}`} data-testid="button-trade-sell">Sell / short</button></div>
    <div className="grid grid-cols-2 gap-3">
      <label className="space-y-2"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Quantity</span><input value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" type="number" min="0.00001" step="any" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none transition-colors focus:border-primary" data-testid="input-trade-quantity" /></label>
      <label className="space-y-2"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Entry price</span><input value={entryPrice} onChange={(event) => setEntryPrice(event.target.value)} inputMode="decimal" type="number" min="0" step="any" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none transition-colors focus:border-primary" data-testid="input-trade-entry" /></label>
      <label className="space-y-2"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Stop loss <span className="normal-case tracking-normal opacity-70">optional</span></span><input value={stopLoss} onChange={(event) => setStopLoss(event.target.value)} inputMode="decimal" type="number" min="0" step="any" placeholder="—" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none transition-colors focus:border-primary" data-testid="input-trade-stop" /></label>
      <label className="space-y-2"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Take profit <span className="normal-case tracking-normal opacity-70">optional</span></span><input value={takeProfit} onChange={(event) => setTakeProfit(event.target.value)} inputMode="decimal" type="number" min="0" step="any" placeholder="—" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none transition-colors focus:border-primary" data-testid="input-trade-target" /></label>
    </div>
    <div className="flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/[.06] p-3 text-xs leading-5 text-muted-foreground"><LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-primary" />This creates a paper position in your sandbox. No funds move and no exchange order is sent.</div>
    <button type="submit" disabled={!valid || pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-submit-trade">{pending ? <><RefreshCw className="size-4 animate-spin" />Submitting paper order</> : <>{side === 'BUY' ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}Place paper {side === 'BUY' ? 'buy' : 'sell'}</>}</button>
  </form>;
}

export function PageLoading() {
  return <div className="space-y-6"><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-80" /><div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div><Skeleton className="h-72" /></div>;
}

export { Activity, ArrowDownRight, ArrowUpRight, BarChart3, ChevronRight, Command, ExternalLink, LineChart, RefreshCw, SlidersHorizontal, Sparkles, TrendingUp, Clock3 };