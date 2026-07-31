import { useState } from "react";

/* ── Mensagens simpáticas ao sair — mudam consoante a hora, só por diversão ── */
const getSignOutMessage = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "A esta hora? Descansa bem 🌙";
  if (hour < 12) return "Já vais? Bom dia de poupanças 👋";
  if (hour < 20) return "Volta sempre que quiseres ver as tuas contas 🌿";
  return "Boa noite! As tuas finanças ficam guardadas até amanhã 🌙";
};

/* ── Popover de confirmação de logout ── */
const SignOutConfirm = ({ onConfirm, onCancel }) => (
  <div className="signout-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
    <div className="signout-popover fade-in">
      <div className="signout-icon">👋</div>
      <p className="signout-message">{getSignOutMessage()}</p>
      <p className="signout-submessage">Tens a certeza que queres terminar a sessão?</p>
      <div className="signout-actions">
        <button onClick={onCancel} className="btn btn-secondary btn-small" style={{ flex: 1 }}>
          Ficar
        </button>
        <button onClick={onConfirm} className="btn btn-primary btn-small" style={{ flex: 1 }}>
          Sair
        </button>
      </div>
    </div>
  </div>
);

/*
  stats (opcional) — passa de App.jsx algo como:
  { transactionsCount, categoriesCount, streak, memberSince }
  Se não passares nada, a secção de estatísticas simplesmente não aparece.
*/
const Account = ({ user, onSignOut, stats }) => {
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const email = user?.email ?? "";
  const initials = email ? email[0].toUpperCase() : "?";

  const memberSince = stats?.memberSince || user?.created_at
    ? new Date(stats?.memberSince || user.created_at).toLocaleDateString("pt-PT", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <section className="section">
      <h2 className="section-title" style={{ marginBottom: "20px" }}>Minha Conta</h2>

      <div className="card account-profile-card">
        <div className="account-avatar">{initials}</div>
        <div className="account-info">
          <div className="account-email">{email}</div>
          {memberSince && (
            <div className="account-member-since">Conta criada a {memberSince}</div>
          )}
        </div>
      </div>

      {stats && (
        <div className="stats-compact" style={{ marginTop: "16px" }}>
          {typeof stats.transactionsCount === "number" && (
            <div className="stat-compact">
              <div className="stat-compact-header"><span className="stat-compact-label">Transações</span></div>
              <div className="stat-compact-value">{stats.transactionsCount}</div>
              <div className="stat-compact-detail">registadas no total</div>
            </div>
          )}
          {typeof stats.categoriesCount === "number" && (
            <div className="stat-compact">
              <div className="stat-compact-header"><span className="stat-compact-label">Categorias</span></div>
              <div className="stat-compact-value">{stats.categoriesCount}</div>
              <div className="stat-compact-detail">criadas por ti</div>
            </div>
          )}
          {typeof stats.streak === "number" && (
            <div className="stat-compact">
              <div className="stat-compact-header"><span className="stat-compact-label">Streak atual</span></div>
              <div className="stat-compact-value">{stats.streak} {stats.streak === 1 ? "dia" : "dias"}</div>
              <div className="stat-compact-detail">a registar sem parar</div>
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: "16px" }}>
        <h3 className="section-title" style={{ fontSize: "16px", marginBottom: "12px" }}>Sessão</h3>
        <p style={{ fontSize: "13px", color: "var(--beige-700)", marginBottom: "16px" }}>
          Termina a sessão neste dispositivo. Os teus dados continuam guardados de forma segura.
        </p>
        <button
          onClick={() => setConfirmingSignOut(true)}
          className="btn btn-secondary"
          style={{ color: "var(--error)", borderColor: "var(--error)" }}
        >
          Terminar Sessão
        </button>
      </div>

      {confirmingSignOut && (
        <SignOutConfirm
          onConfirm={onSignOut}
          onCancel={() => setConfirmingSignOut(false)}
        />
      )}
    </section>
  );
};

export default Account;