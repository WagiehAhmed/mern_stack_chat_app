import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AppRouter from "./components/router/AppRouter";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import Notifications from "./components/Notifications";
import DataContextProvider from "./context/DataContextProvider";
import AxiosInterceptors from "./components/AxiosInterceptors";
import { BrowserRouter } from "react-router-dom";

function FallbackErrorComponent({ error }) {
  return (
    <div className="min-h-screen min-w-screen bg-background-primary text-text-primary flex flex-row justify-center items-center p-5">
      <div className="bg-accent/50 rounded-lg shadow-lg w-full max-w-[800px] p-5">
        <h1 className="text-3xl font-semibold text-center mb-4">
          Something went wrong!
        </h1>
        <div className="bg-background p-4 rounded-lg mb-4">
          <div className="text-lg font-bold mb-2">Error Message:</div>
          <div className="text-sm text-text-secondary whitespace-pre-wrap break-words">
            {error.message}
          </div>
        </div>
        <div className="bg-background p-4 rounded-lg mb-4">
          <div className="text-lg font-bold mb-2">Stack Trace:</div>
          <pre className="text-sm text-text-secondary whitespace-pre-wrap break-words">
            {error.stack}
          </pre>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDarkMode) {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir();
  }, [i18n.language]);

  const queryClient = new QueryClient();

  return (
    <ErrorBoundary FallbackComponent={FallbackErrorComponent}>
      <BrowserRouter>
        <DataContextProvider>
          <AxiosInterceptors>
            <QueryClientProvider client={queryClient}>
              <AppRouter />
              <Notifications />
            </QueryClientProvider>
          </AxiosInterceptors>
        </DataContextProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
