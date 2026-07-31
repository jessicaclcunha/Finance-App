import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

/* ── Marca: usa o logo.png real do projeto (public/logo.png) ── */
const LogoMark = () => (
  <img className="auth-mark" src="/logo.png" alt="PureProsper" />
);

/* ── Sparkline: elemento de assinatura — cresce ao carregar a página ── */
const Sparkline = () => (
  <svg className="auth-sparkline" width="132" height="34" viewBox="0 0 132 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      className="auth-spark-line"
      d="M3 27 L24 21 L42 25 L63 13 L84 17 L105 6 L123 4"
      stroke="var(--success)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle className="auth-spark-dot" cx="123" cy="4" r="3" fill="var(--success)" />
  </svg>
);

/* ── Ícone Google (cores oficiais) ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l2.99-2.34z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l2.99 2.34C4.66 5.17 6.65 3.58 9 3.58z" />
  </svg>
);

const Auth = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);

    const { error } = mode === "login"
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (mode === "signup") {
      setInfo("Conta criada! Verifica o teu email para confirmar.");
    }
  };

  const handleGoogle = async () => {
    setError(""); setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-mark">
          <LogoMark />
          <div className="auth-wordmark">PureProsper</div>
          <div className="auth-tagline">Gestão de Finanças Pessoal</div>
        </div>

        <Sparkline />

        <p className="auth-heading">
          {mode === "login" ? "Entra para continuares a poupar" : "Cria a tua conta em segundos"}
        </p>

        {/* Alternância Entrar / Criar conta — mesmo padrão visual do resto da app */}
        <div className="view-mode-toggle" style={{ marginBottom: "22px" }}>
          <button
            type="button"
            className={mode === "login" ? "view-btn active" : "view-btn"}
            onClick={() => switchMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === "signup" ? "view-btn active" : "view-btn"}
            onClick={() => switchMode("signup")}
          >
            Criar Conta
          </button>
        </div>

        {error && <div className="auth-alert error">{error}</div>}
        {info && <div className="auth-alert info">{info}</div>}

        <button
          type="button"
          onClick={handleGoogle}
          className="google-btn"
          disabled={googleLoading}
        >
          <GoogleIcon />
          {googleLoading ? "A ligar..." : "Continuar com Google"}
        </button>

        <div className="auth-divider"><span>ou com email</span></div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@exemplo.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Palavra-passe</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="auth-footer-note">
          {mode === "login"
            ? "Os teus dados ficam guardados de forma segura e privada."
            : "Ao criar conta, os teus dados passam a sincronizar entre dispositivos."}
        </p>
      </div>
    </div>
  );
};

export default Auth;