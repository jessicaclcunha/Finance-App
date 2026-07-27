import { useState } from "react";

const LogoMark = () => (
  <svg width="26" height="26" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="50" cy="50" r="48" stroke="var(--burgundy-600)" strokeWidth="1" />
    <path d="M50 20V80" stroke="var(--beige-200)" strokeWidth="3" strokeLinecap="square" />
    <path
      d="M50 22C65 22 78 28 78 42C78 56 65 62 50 62"
      stroke="var(--beige-100)" strokeWidth="5" strokeLinecap="round"
    />
    <path
      d="M42 54C34 54 26 48 26 38C26 28 34 22 50 22"
      stroke="var(--burgundy-400)" strokeWidth="3" strokeLinecap="round"
    />
    <circle cx="50" cy="22" r="3" fill="var(--burgundy-300)" />
  </svg>
);

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

const Header = ({ view, setView, onSignOut, userEmail }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const handleNavClick = (newView) => {
    setView(newView);
    setIsMenuOpen(false);
  };

  const handleSignOutClick = () => {
    setIsMenuOpen(false);
    setConfirmingSignOut(true);
  };

  const initials = userEmail ? userEmail[0].toUpperCase() : "?";

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="logo-section">
          <LogoMark />
          <div className="logo-text-block">
            <h1>PureProsper</h1>
            <span className="tagline">Gestão de Finanças Pessoal</span>
          </div>
        </div>

        <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
          <button onClick={() => handleNavClick("dashboard")} className={`nav-link ${view === "dashboard" ? "active" : ""}`}>
            <span className="nav-text">Dashboard</span>
          </button>
          <button onClick={() => handleNavClick("transactions")} className={`nav-link ${view === "transactions" ? "active" : ""}`}>
            <span className="nav-text">Transações</span>
          </button>
          <button onClick={() => handleNavClick("analysis")} className={`nav-link ${view === "analysis" ? "active" : ""}`}>
            <span className="nav-text">Análise</span>
          </button>
          <button onClick={() => handleNavClick("goals")} className={`nav-link ${view === "goals" ? "active" : ""}`}>
            <span className="nav-text">Metas</span>
          </button>
          <button onClick={() => handleNavClick("categories")} className={`nav-link ${view === "categories" ? "active" : ""}`}>
            <span className="nav-text">Categorias</span>
          </button>

          <div className="nav-footer">
            {userEmail && (
              <div className="nav-user">
                <span className="nav-user-avatar">{initials}</span>
                <span className="nav-user-email">{userEmail}</span>
              </div>
            )}
            <button onClick={handleSignOutClick} className="nav-link nav-signout">
              <span className="nav-text">Sair</span>
            </button>
          </div>
        </nav>
      </div>

      {isMenuOpen && <div className="nav-overlay" onClick={() => setIsMenuOpen(false)} />}

      {confirmingSignOut && (
        <SignOutConfirm
          onConfirm={onSignOut}
          onCancel={() => setConfirmingSignOut(false)}
        />
      )}
    </header>
  );
};

export default Header;