import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import { App } from "./App.tsx";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/query.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Suspense>
          <App />
        </Suspense>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
