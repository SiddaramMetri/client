import { NuqsAdapter } from "nuqs/adapters/react";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import QueryProvider from "./context/query-provider.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <Toaster position="top-center" />
      <NuqsAdapter>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <App />
        </Suspense>
      </NuqsAdapter>
    </QueryProvider>
  </StrictMode>
);
