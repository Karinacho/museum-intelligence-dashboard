import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import {queryClient} from "@/app/providers/queryClient.tsx";
import { router } from "@/app/providers/router.tsx";
import type { ReactNode } from "react";


export const AppProviders = ({children}: {children: ReactNode}) => {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
                {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
        )

}