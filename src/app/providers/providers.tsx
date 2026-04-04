import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {queryClient} from "@/app/providers/queryClient.tsx";
import type { ReactNode } from "react";


export const AppProviders = ({children}: {children: ReactNode}) => {
    return (
        <QueryClientProvider client={queryClient}>
                {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
        )

}