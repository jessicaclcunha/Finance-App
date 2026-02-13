const Dashboard = ({ transactions }) => {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;

  return (
    <div className="dashboard-grid">
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-label">Receitas</div>
          <div className="stat-value positive">
            +{income.toFixed(2)}€
          </div>
          <div className="stat-detail">
            {transactions.filter(t => t.type === "income").length} entradas
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Despesas</div>
          <div className="stat-value negative">
            −{expenses.toFixed(2)}€
          </div>
          <div className="stat-detail">
            {transactions.filter(t => t.type === "expense").length} saídas
          </div>
        </div>
      </div>

      <div 
        className="balance-card"
        style={{
          background: balance >= 0 
            ? 'linear-gradient(135deg, rgba(107, 155, 107, 0.15) 0%, white 100%)'
            : 'linear-gradient(135deg, var(--burgundy-100) 0%, white 100%)',
          borderColor: balance >= 0 ? 'rgba(107, 155, 107, 0.3)' : 'var(--burgundy-200)'
        }}
      >
        <div 
          className="balance-label"
          style={{ color: balance >= 0 ? 'var(--success)' : 'var(--burgundy-700)' }}
        >
          Saldo do Mês
        </div>
        <div className={`balance-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
          {balance >= 0 ? '+' : ''}{balance.toFixed(2)}€
        </div>
      </div>
    </div>
  );
};

export default Dashboard;