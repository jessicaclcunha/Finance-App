const AnnualView = ({ allTransactions, selectedYear }) => {
    const months = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
  
    // Agrupar por mês do ano selecionado
    const monthlyData = months.map((month, index) => {
      const monthTransactions = allTransactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === index && date.getFullYear() === selectedYear;
      });
  
      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
  
      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
  
      return {
        month,
        income,
        expenses,
        balance: income - expenses,
        count: monthTransactions.length
      };
    });
  
    const yearTotals = {
      income: monthlyData.reduce((sum, m) => sum + m.income, 0),
      expenses: monthlyData.reduce((sum, m) => sum + m.expenses, 0),
      balance: monthlyData.reduce((sum, m) => sum + m.balance, 0),
      transactions: monthlyData.reduce((sum, m) => sum + m.count, 0)
    };
  
    const averageMonthly = {
      income: yearTotals.income / 12,
      expenses: yearTotals.expenses / 12,
      balance: yearTotals.balance / 12
    };
  
    return (
      <section className="section">
        <h2 className="section-title" style={{ marginBottom: '24px' }}>
          Vista Anual - {selectedYear}
        </h2>
  
        {/* Totais do ano */}
        <div className="annual-totals">
          <div className="stat-card">
            <div className="stat-label">Total Receitas</div>
            <div className="stat-value positive">
              +{yearTotals.income.toFixed(2)}€
            </div>
            <div className="stat-detail">Média: {averageMonthly.income.toFixed(2)}€/mês</div>
          </div>
  
          <div className="stat-card">
            <div className="stat-label">Total Despesas</div>
            <div className="stat-value negative">
              −{yearTotals.expenses.toFixed(2)}€
            </div>
            <div className="stat-detail">Média: {averageMonthly.expenses.toFixed(2)}€/mês</div>
          </div>
  
          <div className="stat-card">
            <div className="stat-label">Saldo Anual</div>
            <div className={`stat-value ${yearTotals.balance >= 0 ? 'positive' : 'negative'}`}>
              {yearTotals.balance >= 0 ? '+' : ''}{yearTotals.balance.toFixed(2)}€
            </div>
            <div className="stat-detail">{yearTotals.transactions} transações</div>
          </div>
        </div>
  
        {/* Tabela mensal */}
        <div className="annual-table-container">
          <table className="annual-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Receitas</th>
                <th>Despesas</th>
                <th>Saldo</th>
                <th>Trans.</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr key={index} className={data.count === 0 ? 'empty-month' : ''}>
                  <td className="month-name">{data.month}</td>
                  <td className="amount-positive">
                    {data.income > 0 ? `+${data.income.toFixed(2)}€` : '—'}
                  </td>
                  <td className="amount-negative">
                    {data.expenses > 0 ? `−${data.expenses.toFixed(2)}€` : '—'}
                  </td>
                  <td className={data.balance >= 0 ? 'amount-positive' : 'amount-negative'}>
                    <strong>
                      {data.balance !== 0 
                        ? `${data.balance >= 0 ? '+' : ''}${data.balance.toFixed(2)}€` 
                        : '—'}
                    </strong>
                  </td>
                  <td className="transaction-count">{data.count || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td><strong>TOTAL</strong></td>
                <td className="amount-positive"><strong>+{yearTotals.income.toFixed(2)}€</strong></td>
                <td className="amount-negative"><strong>−{yearTotals.expenses.toFixed(2)}€</strong></td>
                <td className={yearTotals.balance >= 0 ? 'amount-positive' : 'amount-negative'}>
                  <strong>{yearTotals.balance >= 0 ? '+' : ''}{yearTotals.balance.toFixed(2)}€</strong>
                </td>
                <td className="transaction-count"><strong>{yearTotals.transactions}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    );
  };
  
  export default AnnualView;