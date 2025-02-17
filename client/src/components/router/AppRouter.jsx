import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Lazy load the page components
const CheckEmailPage = React.lazy(() => import("../pages/CheckEmailPage"));
const CheckPasswordPage = React.lazy(() =>
  import("../pages/CheckPasswordPage")
);
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const HomePage = React.lazy(() => import("../pages/HomePage"));
const GroupPage = React.lazy(() => import("../pages/GroupPage"));
const ChatPage = React.lazy(() => import("../pages/ChatPage"));
const MainLayout = React.lazy(() => import("../layouts/MainLayout"));
const VerifyEmailPage = React.lazy(() => import("../pages/VerifyEmailPage"));
const ForgotPasswordPage = React.lazy(() =>
  import("../pages/ForgotPasswordPage")
);
const VerifyOtpPage = React.lazy(() => import("../pages/VerifyOtpPage"));
const ResetPasswordPage = React.lazy(() =>
  import("../pages/ResetPasswordPage")
);
const Loader = React.lazy(() => import("../../components/Loader"));
const Chats = React.lazy(() => import("../../components/Chats"));
const Groups = React.lazy(() => import("../../components/Groups"));

export default function AppRouter() {
  return (
    <>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Navigate to="/chats" />} />
        <Route
          path="/"
          element={
            <Suspense
              fallback={
                <div className="w-screen h-screen bg-background flex flex-row justify-center items-center">
                  <Loader color="accent" />
                </div>
              }
            >
              <HomePage />
            </Suspense>
          }
        >
          {/* Nested route for chats */}
          <Route
            path="chats"
            element={
              <Suspense
                fallback={
                  <div className="w-full h-full bg-background flex flex-row justify-center items-center">
                    <Loader color="accent" />
                  </div>
                }
              >
                <Chats />
              </Suspense>
            }
          >
            <Route
              path=":chatId"
              element={
                <Suspense
                  fallback={
                    <div className="w-full h-full bg-background flex flex-row justify-center items-center">
                      <Loader color="accent" />
                    </div>
                  }
                >
                  <ChatPage />
                </Suspense>
              }
            />
          </Route>
          {/* Nested route for chats */}
          <Route
            path="groups"
            element={
              <Suspense
                fallback={
                  <div className="w-full h-full bg-background flex flex-row justify-center items-center">
                    <Loader color="accent" />
                  </div>
                }
              >
                <Groups />
              </Suspense>
            }
          >
            <Route
              path=":groupId"
              element={
                <Suspense
                  fallback={
                    <div className="w-full h-full bg-background flex flex-row justify-center items-center">
                      <Loader color="accent" />
                    </div>
                  }
                >
                  <GroupPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/email" element={<CheckEmailPage />} />
          <Route
            path="/password"
            element={
              <Suspense
                fallback={
                  <div className="w-full h-full bg-background flex flex-row justify-center items-center">
                    <Loader color="accent" />
                  </div>
                }
              >
                <CheckPasswordPage />
              </Suspense>
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Catch-all route for Not Found page */}
        <Route
          path="*"
          element={
            <div className="w-screen h-screen bg-background border-8 flex flex-row justify-center items-center text-center text-text-primary">
              <h1>404 - Page Not Found</h1>
            </div>
          }
        />
      </Routes>
    </>
  );
}
