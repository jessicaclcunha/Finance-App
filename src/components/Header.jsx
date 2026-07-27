import { useState } from "react";

const Header = ({ view, setView, onSignOut, userEmail }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (newView) => {
    setView(newView);
    setIsMenuOpen(false);
  };

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="logo-section">
          <h1>PureProsper</h1>
          <span className="tagline">Gestão de Finanças Pessoal</span>
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

          <div style={{ marginTop: "auto", padding: "16px 24px", borderTop: "1px solid var(--burgundy-700)" }}>
            {userEmail && (
              <div style={{ fontSize: "12px", color: "var(--beige-500)", marginBottom: "8px", wordBreak: "break-all" }}>
                {userEmail}
              </div>
            )}
            <button onClick={onSignOut} className="nav-link" style={{ color: "var(--burgundy-300)" }}>
              <span className="nav-text">Sair</span>
            </button>
          </div>
        </nav>
      </div>

      {isMenuOpen && <div className="nav-overlay" onClick={() => setIsMenuOpen(false)} />}
    </header>
  );
};

export default Header;