const Header = ({ view, setView }) => {
  return (
    <header className="main-header">
      <div className="header-content">
        <div className="logo-section">
          <h1>Finanças</h1>
          <span className="tagline">Gestão Pessoal</span>
        </div>
        
        <nav className="main-nav">
          <button
            onClick={() => setView("dashboard")}
            className={`nav-link ${view === "dashboard" ? "active" : ""}`}
            title="Dashboard"
          >
            <span className="nav-text">Dashboard</span>
          </button>
          <button
            onClick={() => setView("transactions")}
            className={`nav-link ${view === "transactions" ? "active" : ""}`}
            title="Transações"
          >
            <span className="nav-text">Transações</span>
          </button>
          <button
            onClick={() => setView("analysis")}
            className={`nav-link ${view === "analysis" ? "active" : ""}`}
            title="Análise"
          >
            <span className="nav-text">Análise</span>
          </button>
          <button
            onClick={() => setView("goals")}
            className={`nav-link ${view === "goals" ? "active" : ""}`}
            title="Metas"
          >
            <span className="nav-text">Metas</span>
          </button>
          <button
            onClick={() => setView("categories")}
            className={`nav-link ${view === "categories" ? "active" : ""}`}
            title="Categorias"
          >
            <span className="nav-text">Categorias</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;