const Dashboard = ({ transactions }) => {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;

  return (
    <div className="dashboard-container">
      <div 
        className="balance-card-main"
        style={{
          background: balance >= 0 
            ? 'linear-gradient(135deg, rgba(107, 155, 107, 0.15) 0%, white 100%)'
            : 'linear-gradient(135deg, var(--burgundy-100) 0%, white 100%)',
          borderColor: balance >= 0 ? 'rgba(107, 155, 107, 0.3)' : 'var(--burgundy-200)'
        }}
      >
        <div className="balance-header">

          <div className="balance-info">
            <div 
              className="balance-label-main"
              style={{ color: balance >= 0 ? 'var(--success)' : 'var(--burgundy-700)' }}
            >
              Saldo do Mês
            </div>
            <div className={`balance-amount-main ${balance >= 0 ? 'positive' : 'negative'}`}>
              {balance >= 0 ? '+' : ''}{balance.toFixed(2)}€
            </div>
          </div>
        </div>
      </div>

      {/* Cards compactos - Receitas e Despesas */}
      <div className="stats-compact">
        <div className="stat-compact income">
          <div className="stat-compact-header">
            <span className="stat-compact-label">Receitas</span>
          </div>
          <div className="stat-compact-value positive">
            +{income.toFixed(2)}€
          </div>
          <div className="stat-compact-detail">
            {transactions.filter(t => t.type === "income").length} entradas
          </div>
        </div>

        <div className="stat-compact expense">
          <div className="stat-compact-header">
            <span className="stat-compact-label">Despesas</span>
          </div>
          <div className="stat-compact-value negative">
            −{expenses.toFixed(2)}€
          </div>
          <div className="stat-compact-detail">
            {transactions.filter(t => t.type === "expense").length} saídas
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;