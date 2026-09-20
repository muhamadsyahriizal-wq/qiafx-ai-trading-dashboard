import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthSession, Candle, Dashboard, ErrorResponse, GetMarketChartParams, HealthStatus, ListTradesParams, Market, PaperTradeInput, Portfolio, TelegramAuthInput, Trade, TradingSignal } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAuthSessionUrl: () => string;
/**
 * @summary Get the current Telegram session
 */
export declare const getAuthSession: (options?: Parameters<typeof customFetch>[1]) => Promise<AuthSession>;
export declare const getGetAuthSessionQueryKey: () => readonly ["/api/auth/session"];
export declare const getGetAuthSessionQueryOptions: <TData = Awaited<ReturnType<typeof getAuthSession>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAuthSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAuthSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAuthSessionQueryResult = NonNullable<Awaited<ReturnType<typeof getAuthSession>>>;
export type GetAuthSessionQueryError = ErrorType<unknown>;
/**
 * @summary Get the current Telegram session
 */
export declare function useGetAuthSession<TData = Awaited<ReturnType<typeof getAuthSession>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAuthSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAuthenticateTelegramUrl: () => string;
/**
 * @summary Authenticate or create a Telegram Mini App user session
 */
export declare const authenticateTelegram: (telegramAuthInput: TelegramAuthInput, options?: Parameters<typeof customFetch>[1]) => Promise<AuthSession>;
export declare const getAuthenticateTelegramMutationKey: () => readonly ["authenticateTelegram"];
export declare const getAuthenticateTelegramMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof authenticateTelegram>>, TError, AuthenticateTelegramMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof authenticateTelegram>>, TError, AuthenticateTelegramMutationVariables, TContext>;
export type AuthenticateTelegramMutationResult = NonNullable<Awaited<ReturnType<typeof authenticateTelegram>>>;
export type AuthenticateTelegramMutationBody = BodyType<TelegramAuthInput>;
export type AuthenticateTelegramMutationError = ErrorType<ErrorResponse>;
export type AuthenticateTelegramMutationVariables = {
    data: BodyType<TelegramAuthInput>;
};
/**
* @summary Authenticate or create a Telegram Mini App user session
*/
export declare const useAuthenticateTelegram: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof authenticateTelegram>>, TError, AuthenticateTelegramMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof authenticateTelegram>>, TError, AuthenticateTelegramMutationVariables, TContext>;
export declare const getGetDashboardUrl: () => string;
/**
 * @summary Get the dashboard summary for the current user
 */
export declare const getDashboard: (options?: Parameters<typeof customFetch>[1]) => Promise<Dashboard>;
export declare const getGetDashboardQueryKey: () => readonly ["/api/dashboard"];
export declare const getGetDashboardQueryOptions: <TData = Awaited<ReturnType<typeof getDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboard>>>;
export type GetDashboardQueryError = ErrorType<unknown>;
/**
 * @summary Get the dashboard summary for the current user
 */
export declare function useGetDashboard<TData = Awaited<ReturnType<typeof getDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListMarketsUrl: () => string;
/**
 * @summary List tracked crypto market prices
 */
export declare const listMarkets: (options?: Parameters<typeof customFetch>[1]) => Promise<Market[]>;
export declare const getListMarketsQueryKey: () => readonly ["/api/markets"];
export declare const getListMarketsQueryOptions: <TData = Awaited<ReturnType<typeof listMarkets>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMarkets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMarkets>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMarketsQueryResult = NonNullable<Awaited<ReturnType<typeof listMarkets>>>;
export type ListMarketsQueryError = ErrorType<unknown>;
/**
 * @summary List tracked crypto market prices
 */
export declare function useListMarkets<TData = Awaited<ReturnType<typeof listMarkets>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMarkets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMarketChartUrl: (symbol: string, params?: GetMarketChartParams) => string;
/**
 * @summary Get chart candles for a market
 */
export declare const getMarketChart: (symbol: string, params?: GetMarketChartParams, options?: Parameters<typeof customFetch>[1]) => Promise<Candle[]>;
export declare const getGetMarketChartQueryKey: (symbol: string, params?: GetMarketChartParams) => readonly [`/api/markets/${string}/chart`, ...GetMarketChartParams[]];
export declare const getGetMarketChartQueryOptions: <TData = Awaited<ReturnType<typeof getMarketChart>>, TError = ErrorType<unknown>>(symbol: string, params?: GetMarketChartParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMarketChart>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMarketChart>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMarketChartQueryResult = NonNullable<Awaited<ReturnType<typeof getMarketChart>>>;
export type GetMarketChartQueryError = ErrorType<unknown>;
/**
 * @summary Get chart candles for a market
 */
export declare function useGetMarketChart<TData = Awaited<ReturnType<typeof getMarketChart>>, TError = ErrorType<unknown>>(symbol: string, params?: GetMarketChartParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMarketChart>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTradingSignalUrl: (symbol: string) => string;
/**
 * @summary Get the current AI trading signal
 */
export declare const getTradingSignal: (symbol: string, options?: Parameters<typeof customFetch>[1]) => Promise<TradingSignal>;
export declare const getGetTradingSignalQueryKey: (symbol: string) => readonly [`/api/signals/${string}`];
export declare const getGetTradingSignalQueryOptions: <TData = Awaited<ReturnType<typeof getTradingSignal>>, TError = ErrorType<unknown>>(symbol: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTradingSignal>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTradingSignal>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTradingSignalQueryResult = NonNullable<Awaited<ReturnType<typeof getTradingSignal>>>;
export type GetTradingSignalQueryError = ErrorType<unknown>;
/**
 * @summary Get the current AI trading signal
 */
export declare function useGetTradingSignal<TData = Awaited<ReturnType<typeof getTradingSignal>>, TError = ErrorType<unknown>>(symbol: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTradingSignal>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPortfolioUrl: () => string;
/**
 * @summary Get the current paper portfolio
 */
export declare const getPortfolio: (options?: Parameters<typeof customFetch>[1]) => Promise<Portfolio>;
export declare const getGetPortfolioQueryKey: () => readonly ["/api/portfolio"];
export declare const getGetPortfolioQueryOptions: <TData = Awaited<ReturnType<typeof getPortfolio>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPortfolio>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPortfolio>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPortfolioQueryResult = NonNullable<Awaited<ReturnType<typeof getPortfolio>>>;
export type GetPortfolioQueryError = ErrorType<unknown>;
/**
 * @summary Get the current paper portfolio
 */
export declare function useGetPortfolio<TData = Awaited<ReturnType<typeof getPortfolio>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPortfolio>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListTradesUrl: (params?: ListTradesParams) => string;
/**
 * @summary List paper trades for the current user
 */
export declare const listTrades: (params?: ListTradesParams, options?: Parameters<typeof customFetch>[1]) => Promise<Trade[]>;
export declare const getListTradesQueryKey: (params?: ListTradesParams) => readonly ["/api/trades", ...ListTradesParams[]];
export declare const getListTradesQueryOptions: <TData = Awaited<ReturnType<typeof listTrades>>, TError = ErrorType<unknown>>(params?: ListTradesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTrades>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTrades>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTradesQueryResult = NonNullable<Awaited<ReturnType<typeof listTrades>>>;
export type ListTradesQueryError = ErrorType<unknown>;
/**
 * @summary List paper trades for the current user
 */
export declare function useListTrades<TData = Awaited<ReturnType<typeof listTrades>>, TError = ErrorType<unknown>>(params?: ListTradesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTrades>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreatePaperTradeUrl: () => string;
/**
 * @summary Create a paper trade
 */
export declare const createPaperTrade: (paperTradeInput: PaperTradeInput, options?: Parameters<typeof customFetch>[1]) => Promise<Trade>;
export declare const getCreatePaperTradeMutationKey: () => readonly ["createPaperTrade"];
export declare const getCreatePaperTradeMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPaperTrade>>, TError, CreatePaperTradeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPaperTrade>>, TError, CreatePaperTradeMutationVariables, TContext>;
export type CreatePaperTradeMutationResult = NonNullable<Awaited<ReturnType<typeof createPaperTrade>>>;
export type CreatePaperTradeMutationBody = BodyType<PaperTradeInput>;
export type CreatePaperTradeMutationError = ErrorType<ErrorResponse>;
export type CreatePaperTradeMutationVariables = {
    data: BodyType<PaperTradeInput>;
};
/**
* @summary Create a paper trade
*/
export declare const useCreatePaperTrade: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPaperTrade>>, TError, CreatePaperTradeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPaperTrade>>, TError, CreatePaperTradeMutationVariables, TContext>;
export declare const getClosePaperTradeUrl: (id: number) => string;
/**
 * @summary Close an open paper trade
 */
export declare const closePaperTrade: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<Trade>;
export declare const getClosePaperTradeMutationKey: () => readonly ["closePaperTrade"];
export declare const getClosePaperTradeMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof closePaperTrade>>, TError, ClosePaperTradeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof closePaperTrade>>, TError, ClosePaperTradeMutationVariables, TContext>;
export type ClosePaperTradeMutationResult = NonNullable<Awaited<ReturnType<typeof closePaperTrade>>>;
export type ClosePaperTradeMutationError = ErrorType<ErrorResponse>;
export type ClosePaperTradeMutationVariables = {
    id: number;
};
/**
* @summary Close an open paper trade
*/
export declare const useClosePaperTrade: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof closePaperTrade>>, TError, ClosePaperTradeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof closePaperTrade>>, TError, ClosePaperTradeMutationVariables, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map