import { useState } from "react";

const AnnualView = ({ allTransactions, selectedYear, compact = false }) => {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

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

  const monthsWithData = monthlyData.filter(m => m.count > 0);
  const bestMonth = monthsWithData.length > 0
    ? monthsWithData.reduce((best, current) => current.balance > best.balance ? current : best)
    : null;
  const worstMonth = monthsWithData.length > 0
    ? monthsWithData.reduce((worst, current) => current.balance < worst.balance ? current : worst)
    : null;

  const maxVal = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)), 1);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  if (compact) {
    return (
      <section className="section">
        <h2 className="section-title" style={{ marginBottom: '16px' }}>
          Resumo de {selectedYear}
        </h2>

        {/* Totais rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div className="stat-compact">
            <div className="stat-compact-label">Receitas</div>
            <div className="stat-compact-value positive">+{yearTotals.income.toFixed(0)}€</div>
          </div>
          <div className="stat-compact">
            <div className="stat-compact-label">Despesas</div>
            <div className="stat-compact-value negative">−{yearTotals.expenses.toFixed(0)}€</div>
          </div>
          <div className="stat-compact">
            <div className="stat-compact-label">Saldo</div>
            <div className={`stat-compact-value ${yearTotals.balance >= 0 ? 'positive' : 'negative'}`}>
              {yearTotals.balance >= 0 ? '+' : ''}{yearTotals.balance.toFixed(0)}€
            </div>
          </div>
        </div>

        {/* Gráfico de barras compacto */}
        <div className="annual-chart-section">
          <div className="annual-chart-legend">
            <span className="chart-legend-dot income-dot"></span>
            <span>Receitas</span>
            <span className="chart-legend-dot expenses-dot" style={{marginLeft: '8px'}}></span>
            <span>Despesas</span>
          </div>
          <div className="annual-bar-chart" style={{ height: '120px' }}>
            {monthlyData.map((data, index) => {
              const isCurrent = index === currentMonth && selectedYear === currentYear;
              const isHovered = hoveredMonth === index;
              const hasData = data.count > 0;
              const incomeH = (data.income / maxVal) * 100;
              const expensesH = (data.expenses / maxVal) * 100;

              return (
                <div
                  key={index}
                  className={`annual-bar-col ${isCurrent ? "current-month" : ""} ${!hasData ? "no-data" : ""}`}
                  onMouseEnter={() => setHoveredMonth(index)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {isHovered && hasData && (
                    <div className="bar-tooltip">
                      <strong>{data.month}</strong>
                      <div className="bar-tooltip-row">
                        <span style={{ color: 'var(--success)' }}>↑</span>
                        <span>{data.income.toFixed(0)}€</span>
                      </div>
                      <div className="bar-tooltip-row">
                        <span style={{ color: 'var(--error)' }}>↓</span>
                        <span>{data.expenses.toFixed(0)}€</span>
                      </div>
                    </div>
                  )}
                  <div className="annual-bars">
                    <div className="annual-bar income-bar" style={{ height: hasData ? `${incomeH}%` : '0%' }} />
                    <div className="annual-bar expenses-bar" style={{ height: hasData ? `${expensesH}%` : '0%' }} />
                  </div>
                  <div className={`annual-bar-label ${isCurrent ? "current-label" : ""}`}>
                    {data.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <h2 className="section-title" style={{ marginBottom: '20px' }}>
        Análise Anual
      </h2>

      {/* Totais anuais */}
      <div className="annual-header">
        <div className="annual-total-card">
          <div className="annual-total-content">
            <div className="annual-total-label">Saldo Anual</div>
            <div className={`annual-total-value ${yearTotals.balance >= 0 ? 'positive' : 'negative'}`}>
              {yearTotals.balance >= 0 ? '+' : ''}{yearTotals.balance.toFixed(2)}€
            </div>
            <div className="annual-total-detail">
              {yearTotals.transactions} transações • Média: {averageMonthly.balance.toFixed(2)}€/mês
            </div>
          </div>
        </div>

        <div className="annual-stats-mini">
          <div className="annual-stat-mini">
            <div className="annual-stat-mini-label">Receitas</div>
            <div className="annual-stat-mini-value positive">+{yearTotals.income.toFixed(2)}€</div>
          </div>
          <div className="annual-stat-mini">
            <div className="annual-stat-mini-label">Despesas</div>
            <div className="annual-stat-mini-value negative">−{yearTotals.expenses.toFixed(2)}€</div>
          </div>
          {bestMonth && (
            <div className="annual-stat-mini">
              <div className="annual-stat-mini-label">Melhor</div>
              <div className="annual-stat-mini-value">{bestMonth.month}</div>
            </div>
          )}
          {worstMonth && (
            <div className="annual-stat-mini">
              <div className="annual-stat-mini-label">Pior</div>
              <div className="annual-stat-mini-value">{worstMonth.month}</div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de barras visual */}
      <div className="annual-chart-section">
        <div className="annual-chart-legend">
          <span className="chart-legend-dot income-dot"></span>
          <span>Receitas</span>
          <span className="chart-legend-dot expenses-dot" style={{marginLeft: '8px'}}></span>
          <span>Despesas</span>
        </div>

        <div className="annual-bar-chart">
          {monthlyData.map((data, index) => {
            const isCurrent = index === currentMonth && selectedYear === currentYear;
            const isHovered = hoveredMonth === index;
            const hasData = data.count > 0;
            const incomeH = (data.income / maxVal) * 100;
            const expensesH = (data.expenses / maxVal) * 100;

            return (
              <div
                key={index}
                className={`annual-bar-col ${isCurrent ? "current-month" : ""} ${!hasData ? "no-data" : ""}`}
                onMouseEnter={() => setHoveredMonth(index)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {isHovered && hasData && (
                  <div className="bar-tooltip">
                    <strong>{data.month}</strong>
                    <div className="bar-tooltip-row">
                      <span style={{ color: 'var(--success)' }}>↑</span>
                      <span>{data.income.toFixed(0)}€</span>
                    </div>
                    <div className="bar-tooltip-row">
                      <span style={{ color: 'var(--error)' }}>↓</span>
                      <span>{data.expenses.toFixed(0)}€</span>
                    </div>
                    <div className="bar-tooltip-row" style={{ borderTop: '1px solid var(--beige-300)', paddingTop: '4px', marginTop: '2px' }}>
                      <span style={{ color: data.balance >= 0 ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                        {data.balance >= 0 ? '+' : ''}{data.balance.toFixed(0)}€
                      </span>
                    </div>
                  </div>
                )}

                <div className="annual-bars">
                  <div
                    className="annual-bar income-bar"
                    style={{ height: hasData ? `${incomeH}%` : '0%', animationDelay: `${index * 40}ms` }}
                  />
                  <div
                    className="annual-bar expenses-bar"
                    style={{ height: hasData ? `${expensesH}%` : '0%', animationDelay: `${index * 40 + 20}ms` }}
                  />
                </div>

                {hasData && (
                  <div
                    className="annual-bar-balance"
                    style={{ color: data.balance >= 0 ? 'var(--success)' : 'var(--error)' }}
                  >
                    <div className={`balance-dot ${data.balance >= 0 ? 'positive-dot' : 'negative-dot'}`} />
                  </div>
                )}

                <div className={`annual-bar-label ${isCurrent ? "current-label" : ""}`}>
                  {data.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabela resumo - com scroll horizontal no mobile */}
      <div className="annual-table-container">
        <table className="annual-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Receitas</th>
              <th>Despesas</th>
              <th>Saldo</th>
              <th>N°</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((data, index) => (
              <tr
                key={index}
                className={`${data.count === 0 ? 'empty-month' : ''} ${index === currentMonth && selectedYear === currentYear ? 'current-month-row' : ''}`}
              >
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