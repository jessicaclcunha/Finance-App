import { useState } from "react";

const Header = ({ view, setView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (newView) => {
    setView(newView);
    setIsMenuOpen(false);
  };

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="logo-section">
          <h1>Finanças</h1>
          <span className="tagline">Gestão Pessoal</span>
        </div>
        
        {/* Botão Hamburger - só visível em mobile */}
        <button 
          className="hamburger-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Menu de Navegação */}
        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
          <button
            onClick={() => handleNavClick("dashboard")}
            className={`nav-link ${view === "dashboard" ? "active" : ""}`}
            title="Dashboard"
          >
            <span className="nav-text">Dashboard</span>
          </button>
          <button
            onClick={() => handleNavClick("transactions")}
            className={`nav-link ${view === "transactions" ? "active" : ""}`}
            title="Transações"
          >
            <span className="nav-text">Transações</span>
          </button>
          <button
            onClick={() => handleNavClick("analysis")}
            className={`nav-link ${view === "analysis" ? "active" : ""}`}
            title="Análise"
          >
            <span className="nav-text">Análise</span>
          </button>
          <button
            onClick={() => handleNavClick("goals")}
            className={`nav-link ${view === "goals" ? "active" : ""}`}
            title="Metas"
          >
            <span className="nav-text">Metas</span>
          </button>
          <button
            onClick={() => handleNavClick("categories")}
            className={`nav-link ${view === "categories" ? "active" : ""}`}
            title="Categorias"
          >
            <span className="nav-text">Categorias</span>
          </button>
        </nav>
      </div>

      {isMenuOpen && (
        <div 
          className="nav-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;