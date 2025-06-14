import { NuqsAdapter } from "nuqs/adapters/react";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from 'react-toastify';

import App from "./App.tsx";
import QueryProvider from "./context/query-provider.tsx";
import "./index.css";
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <NuqsAdapter>
          <App />
      </NuqsAdapter>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="toast-custom"
        bodyClassName="toast-body-custom"
        progressClassName="toast-progress-custom"
      />
    </QueryProvider>
  </StrictMode>
);
