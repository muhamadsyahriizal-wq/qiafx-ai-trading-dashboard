import { type ReactNode, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  getGetAuthSessionQueryKey,
  useAuthenticateTelegram,
  useGetAuthSession,
  useHealthCheck,
} from '@workspace/api-client-react';
import { Activity, BrandLockup, Shell } from '@/components/trading-ui';
import { DashboardPage } from '@/pages/dashboard';
import { HistoryPage } from '@/pages/history';
import NotFound from '@/pages/not-found';
import { PortfolioPage } from '@/pages/portfolio';
import { SettingsPage } from '@/pages/settings';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/portfolio" component={PortfolioPage} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function AuthGate() {
  const client = useQueryClient();
  const sessionQuery = useGetAuthSession();
  const healthQuery = useHealthCheck();
  const authenticate = useAuthenticateTelegram();
  const attempted = useRef(false);

  const bootstrap = () => {
    attempted.current = true;
    const webApp = (window as Window & {
      Telegram?: {
        WebApp?: {
          initData?: string;
          initDataUnsafe?: {
            user?: { id: number; first_name?: string; last_name?: string; username?: string };
          };
        };
      };
    }).Telegram?.WebApp;
    const telegramUser = webApp?.initDataUnsafe?.user;
    authenticate.mutate({
      data: {
        initData: webApp?.initData ?? '',
        user: {
          id: telegramUser?.id ?? 10001,
          firstName: telegramUser?.first_name ?? 'Demo',
          lastName: telegramUser?.last_name ?? 'Trader',
          username: telegramUser?.username ?? 'demo_trader',
        },
      },
    }, {
      onSuccess: (session) => {
        client.setQueryData(getGetAuthSessionQueryKey(), session);
      },
    });
  };

  useEffect(() => {
    if (!attempted.current && ((sessionQuery.isSuccess && !sessionQuery.data?.authenticated) || sessionQuery.isError)) bootstrap();
  }, [sessionQuery.data?.authenticated, sessionQuery.isError, sessionQuery.isSuccess]);

  if (sessionQuery.isLoading || authenticate.isPending || (!sessionQuery.data?.authenticated && !authenticate.isError)) {
    return <StartupScreen status={authenticate.isPending ? 'Setting up your paper workspace…' : 'Connecting your Telegram session…'} />;
  }

  if (authenticate.isError || sessionQuery.isError) {
    return <StartupScreen status="The paper workspace could not connect." retry={bootstrap} />;
  }

  return <Shell user={sessionQuery.data?.user} health={healthQuery.data?.status}><Router /></Shell>;
}

function StartupScreen({ status, retry }: { status: string; retry?: () => void }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-5 text-foreground">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[.07] blur-3xl" />
      <div className="relative w-full max-w-sm text-center">
        <div className="mb-9 flex justify-center"><BrandLockup /></div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary"><Activity className={`size-5 ${retry ? '' : 'animate-pulse'}`} /></div>
          <h1 className="text-xl font-bold tracking-[-.04em]">{retry ? 'Connection paused' : 'Preparing your cockpit'}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{status}</p>
          {retry && <button type="button" onClick={retry} className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110" data-testid="button-retry-auth">Try connection again</button>}
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground/70">Paper environment · no live execution</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthGate />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
