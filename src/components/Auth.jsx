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

/* ── Ecrã de confirmação de email pendente ──
   Exportado para poder ser reutilizado no App.jsx quando um utilizador
   com sessão ativa ainda não confirmou o email. */
export const EmailConfirmationPending = ({ email, onResend, onBack, onSignOut }) => {
  const [resendState, setResendState] = useState("idle"); // idle | sending | sent | error

  const handleResend = async () => {
    setResendState("sending");
    const { error } = await onResend(email);
    setResendState(error ? "error" : "sent");
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-logo-mark">
          <LogoMark />
          <div className="auth-wordmark">PureProsper</div>
        </div>

        <div style={{ fontSize: "44px", margin: "18px 0 12px" }}>✉️</div>

        <p style={{ fontFamily: "var(--font-serif)", fontSize: "19px", color: "var(--burgundy-900)", marginBottom: "10px" }}>
          Confirma o teu email
        </p>
        <p style={{ fontSize: "13px", color: "var(--beige-700)", marginBottom: "6px" }}>
          Enviámos um link de confirmação para
        </p>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--burgundy-800)", marginBottom: "20px", wordBreak: "break-all" }}>
          {email}
        </p>
        <p style={{ fontSize: "12px", color: "var(--beige-600)", marginBottom: "22px" }}>
          Clica no link do email para ativar a tua conta. Se não vires nada na caixa de entrada, verifica o spam.
        </p>

        <button onClick={handleResend} className="btn btn-secondary" style={{ width: "100%", marginBottom: "10px" }} disabled={resendState === "sending"}>
          {resendState === "sending" ? "A enviar..." : "Reenviar email"}
        </button>

        {resendState === "sent" && (
          <p style={{ fontSize: "12px", color: "var(--success)", marginBottom: "10px" }}>✓ Email reenviado</p>
        )}
        {resendState === "error" && (
          <p style={{ fontSize: "12px", color: "var(--error)", marginBottom: "10px" }}>Não foi possível reenviar. Tenta mais tarde.</p>
        )}

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="btn btn-secondary"
            style={{ width: "100%", background: "transparent", border: "none", color: "var(--beige-700)" }}
          >
            Terminar sessão
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-secondary"
            style={{ width: "100%", background: "transparent", border: "none", color: "var(--beige-700)" }}
          >
            ← Voltar
          </button>
        )}
      </div>
    </div>
  );
};

const Auth = () => {
  const { signIn, signUp, signInWithGoogle, resendConfirmation } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);

    const { error } = mode === "login"
      ? await signIn(email, password)
      : await signUp(email, password, name.trim());

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (mode === "signup") {
      setPendingEmail(email);
    }
  };

  const handleGoogle = async () => {
    setError(""); setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  if (pendingEmail) {
    return (
      <EmailConfirmationPending
        email={pendingEmail}
        onResend={resendConfirmation}
        onBack={() => { setPendingEmail(null); setMode("login"); setPassword(""); }}
      />
    );
  }

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
          {mode === "signup" && (
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="O teu nome"
                required
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@exemplo.com"
              required
              autoFocus={mode === "login"}
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
            : "Vamos pedir-te para confirmares o email antes de entrares."}
        </p>
      </div>
    </div>
  );
};

export default Auth;