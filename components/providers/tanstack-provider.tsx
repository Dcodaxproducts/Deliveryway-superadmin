"use client";

import type { ReactNode } from "react";
import type { DehydratedState } from "@tanstack/react-query";
import {
    QueryClient,
    QueryClientProvider,
    HydrationBoundary,
} from "@tanstack/react-query";

export interface ReactQueryProviderProps {
    children: ReactNode;
    dehydratedState?: DehydratedState;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
        },
    },
});

export default function ReactQueryProvider({
    children,
    dehydratedState,
}: ReactQueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={dehydratedState}>
                {children}
            </HydrationBoundary>
        </QueryClientProvider>
    );
}
