import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-xl">
        <div className="mb-5 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive"><AlertCircle className="size-5" /></span><div className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Signalroom / 404</div></div>
        <h1 className="text-2xl font-extrabold tracking-[-.04em]">This view drifted off chart.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">The page you requested is not part of this focused cockpit.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110" data-testid="link-back-overview"><ArrowLeft className="size-4" />Back to overview</Link>
      </div>
    </div>
  );
}
