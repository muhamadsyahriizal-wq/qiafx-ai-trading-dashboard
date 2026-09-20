import { useState } from 'react';
import { Check, ChevronRight, CircleHelp, ExternalLink, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useGetAuthSession, useHealthCheck } from '@workspace/api-client-react';
import { Panel, PageHeading, StatusPill } from '@/components/trading-ui';

export function SettingsPage() {
  const sessionQuery = useGetAuthSession();
  const healthQuery = useHealthCheck();
  const [expanded, setExpanded] = useState<string | null>('paper');
  const user = sessionQuery.data?.user;
  const rules = [
    { id: 'paper', title: 'Paper orders only', body: 'Every order created in Signalroom is written to a simulated ledger. There is no exchange key, wallet connection, or live execution path.' },
    { id: 'data', title: 'Reference data is not financial advice', body: 'Signals summarize market conditions using the available reference feed. Use them as a decision aid, not as a promise of outcome.' },
    { id: 'privacy', title: 'Telegram session privacy', body: 'Your Telegram identity is used to scope your personal paper portfolio. Signalroom does not need access to your chats or contacts.' },
  ];

  return (
    <>
      <PageHeading eyebrow="Workspace controls" title="Settings." description="A transparent home for your session and the rules behind this cockpit." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
        <Panel title="Telegram session" subtitle="Identity used for this paper workspace">
          <div className="flex items-center gap-4 px-5 py-6 md:px-6"><span className="grid size-14 place-items-center rounded-2xl bg-primary/10 font-mono text-lg font-medium text-primary">{`${user?.firstName?.[0] ?? 'T'}${user?.lastName?.[0] ?? ''}`.toUpperCase()}</span><div className="min-w-0 flex-1"><div className="text-lg font-bold">{user?.firstName ?? 'Telegram user'} {user?.lastName ?? ''}</div><div className="mt-1 text-sm text-muted-foreground">{user?.username ? `@${user.username}` : 'Telegram Mini App session'}</div><div className="mt-3 flex items-center gap-2"><StatusPill status={sessionQuery.data?.authenticated ? 'positive' : 'neutral'} label={sessionQuery.data?.authenticated ? 'Authenticated' : 'Session pending'} /><span className="font-mono text-[10px] text-muted-foreground">ID {user?.id ?? '—'}</span></div></div></div>
          <div className="grid gap-3 border-t border-border/70 px-5 py-5 sm:grid-cols-2 md:px-6"><div className="rounded-xl border border-border bg-secondary/50 p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold"><span className="size-1.5 rounded-full bg-accent" />Telegram auth</div><div className="font-mono text-[11px] text-muted-foreground">Session scoped</div></div><div className="rounded-xl border border-border bg-secondary/50 p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold"><span className={`size-1.5 rounded-full ${healthQuery.data?.status === 'ok' ? 'bg-accent' : 'bg-primary'}`} />API health</div><div className="font-mono text-[11px] text-muted-foreground">{healthQuery.data?.status ?? 'checking'}</div></div></div>
        </Panel>
        <Panel title="Safety by default" subtitle="The important part, made visible">
          <div className="p-5 md:p-6"><div className="mb-5 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/[.06] p-4"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"><ShieldCheck className="size-4" /></span><div><div className="text-sm font-bold">No real trades execute</div><p className="mt-1 text-xs leading-5 text-muted-foreground">This app is intentionally a paper-trading simulator. You can test a thesis, but you cannot place a live order here.</p></div></div><div className="space-y-1">{rules.map((rule) => <div key={rule.id} className="border-b border-border/70 last:border-0"><button type="button" onClick={() => setExpanded(expanded === rule.id ? null : rule.id)} className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-semibold" aria-expanded={expanded === rule.id} data-testid={`button-safety-${rule.id}`}><span className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-md bg-secondary font-mono text-[10px] text-primary"><Check className="size-3" /></span>{rule.title}</span><ChevronRight className={`size-4 text-muted-foreground transition-transform ${expanded === rule.id ? 'rotate-90' : ''}`} /></button>{expanded === rule.id && <p className="pb-4 pl-9 text-xs leading-5 text-muted-foreground">{rule.body}</p>}</div>)}</div></div>
        </Panel>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Panel title="About Signalroom" subtitle="A focused crypto decision surface"><div className="px-5 py-5 md:px-6"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><CircleHelp className="size-4" /></span><p className="text-sm leading-6 text-muted-foreground">Signalroom narrows the crypto experience to one useful question: what does the market look like right now, and what would happen if you tested the idea with paper capital?</p></div></div></Panel>
        <Panel title="System status" subtitle="Quietly keeping the cockpit ready"><div className="space-y-3 px-5 py-5 md:px-6"><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><span className="size-1.5 rounded-full bg-accent" />API service</span><span className="font-mono text-xs text-accent">{healthQuery.data?.status === 'ok' ? 'Operational' : 'Checking'}</span></div><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><LockKeyhole className="size-3.5" />Execution layer</span><span className="font-mono text-xs text-primary">Disabled</span></div><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><ExternalLink className="size-3.5" />Exchange connection</span><span className="font-mono text-xs text-muted-foreground">None</span></div></div></Panel>
      </div>
    </>
  );
}