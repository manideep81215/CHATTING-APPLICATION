import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import ChatContactPage from "./pages/ChatContactPage";
import { api } from "./lib/api";
import { getToken } from "./lib/auth";

export default function App() {
  useEffect(() => {
    const heartbeat = async () => {
      if (!getToken()) return;
      try {
        await api.post("/api/users/presence/heartbeat");
      } catch {
        // best-effort presence update
      }
    };
    heartbeat();
    const timer = setInterval(heartbeat, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/auth" element={!getToken() ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:tab"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:friendUserId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:friendUserId/contact"
          element={
            <ProtectedRoute>
              <ChatContactPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:friendUserId/contact/*"
          element={
            <ProtectedRoute>
              <ChatContactPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={getToken() ? "/dashboard" : "/auth"} replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
}
