import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import { getToken, setAuth } from "../lib/auth";

const initialRegister = {
  username: "",
  password: "",
  displayName: "",
};

const initialLogin = {
  username: "",
  password: "",
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function redirectToDashboard() {
    const isNativeWebView =
      typeof window !== "undefined" &&
      (window.location.protocol === "capacitor:" ||
        window.location.protocol === "file:" ||
        (window.location.hostname === "localhost" && !window.location.port));

    if (isNativeWebView) {
      window.location.hash = "#/dashboard";
      return;
    }
    navigate("/dashboard", { replace: true });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? loginForm : registerForm;
      const { data } = await api.post(endpoint, payload);
      setAuth(data);
      if (!getToken()) {
        toast.error("Login response did not include a token.");
        return;
      }
      toast.success(isLogin ? "Login successful" : "Account created");
      redirectToDashboard();
    } catch (error) {
      const data = error.response?.data;
      const status = error?.response?.status;
      const message =
        data?.message ||
        (typeof data === "string" && data) ||
        data?.error ||
        (status
          ? `Authentication failed (${status})`
          : "Authentication failed (network/CORS).");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell-green">
      <div className="auth-split-layout">
        <section className="auth-video-pane">
          <video className="auth-bg-video" autoPlay muted loop playsInline>
            <source src="/login-bg.mp4" type="video/mp4" />
          </video>
          <div className="auth-video-overlay" />
          <div className="auth-noise-layer" />
        </section>

        <section className="auth-form-pane">
          <div className="auth-phone-card">
            <div className="auth-notch" />
            <div className="auth-card-inner">
              <div className="auth-lock-badge" aria-hidden="true">
                *
              </div>
              <h1 className="auth-title-main">{isLogin ? "Sign In to Chat" : "Create Account"}</h1>
              <p className="auth-subtitle-main">
                {isLogin ? "Use your account to continue chatting." : "Register to start real-time messaging."}
              </p>

              <form onSubmit={handleSubmit} className="auth-form-stack">
                {!isLogin && (
                  <input
                    className="auth-input-green"
                    placeholder="Display Name"
                    value={registerForm.displayName}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    required
                  />
                )}
                <input
                  className="auth-input-green"
                  placeholder="Username"
                  value={isLogin ? loginForm.username : registerForm.username}
                  onChange={(e) =>
                    isLogin
                      ? setLoginForm((prev) => ({ ...prev, username: e.target.value }))
                      : setRegisterForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                  required
                />
                <div className="auth-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input-green auth-input-has-icon"
                    placeholder="Password"
                    value={isLogin ? loginForm.password : registerForm.password}
                    onChange={(e) =>
                      isLogin
                        ? setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                        : setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                <button className="auth-submit-green" disabled={loading}>
                  {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                </button>
              </form>

              <button
                className="auth-switch-green"
                onClick={() => setIsLogin((v) => !v)}
                type="button"
              >
                {isLogin ? "Create New Account" : "I Already Have Account"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
