const MonthInsights = ({ transactions, selectedDate }) => {
    const today = new Date();
    const currentMonth = selectedDate.month;
    const currentYear = selectedDate.year;
    
    // Calcular dias do mês
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = today.getMonth() === currentMonth && today.getFullYear() === currentYear 
      ? today.getDate() 
      : daysInMonth;
    const daysRemaining = daysInMonth - currentDay;
    const monthProgress = (currentDay / daysInMonth) * 100;
  
    // Calcular gastos
    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  
    // Média diária de gastos
    const dailyAverage = currentDay > 0 ? expenses / currentDay : 0;
    
    // Projeção de gastos até fim do mês
    const projectedExpenses = expenses + (dailyAverage * daysRemaining);
    
    // Gasto médio por dia restante (baseado no que sobra do orçamento)
    const remainingBudget = income - expenses;
    const dailyBudget = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;
  
    // Top 5 maiores despesas
    const topExpenses = [...transactions]
      .filter(t => t.type === "expense")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  
    return (
      <div className="insights-container">
        {/* Widgets do mês */}
        {isCurrentMonth && (
          <div className="widgets-grid">
            <div className="widget-card">
              <div className="widget-content">
                <div className="widget-label">Dias Restantes</div>
                <div className="widget-value">{daysRemaining}</div>
                <div className="widget-detail">{monthProgress.toFixed(0)}% do mês</div>
              </div>
            </div>
  
            <div className="widget-card">
              <div className="widget-content">
                <div className="widget-label">Média Diária</div>
                <div className="widget-value">{dailyAverage.toFixed(2)}€</div>
                <div className="widget-detail">Gasto por dia</div>
              </div>
            </div>
  
            <div className="widget-card">
              <div className="widget-content">
                <div className="widget-label">Orçamento/Dia</div>
                <div className="widget-value" style={{ 
                  color: dailyBudget < 0 ? 'var(--error)' : 'var(--success)' 
                }}>
                  {dailyBudget.toFixed(2)}€
                </div>
                <div className="widget-detail">Disponível por dia</div>
              </div>
            </div>
  
            <div className="widget-card">
              <div className="widget-content">
                <div className="widget-label">Projeção</div>
                <div className="widget-value">{projectedExpenses.toFixed(2)}€</div>
                <div className="widget-detail">Gasto estimado total</div>
              </div>
            </div>
          </div>
        )}
  
        {/* Top 5 maiores despesas */}
        {topExpenses.length > 0 && (
          <div className="card" style={{ marginTop: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '20px' }}>
              Maiores Despesas
            </h3>
            <div className="top-expenses-list">
              {topExpenses.map((transaction, index) => (
                <div key={transaction.id} className="top-expense-item">
                  <div className="expense-rank">#{index + 1}</div>
                  <div className="expense-info">
                    <div className="expense-description">{transaction.description}</div>
                    <div className="expense-date">
                      {new Date(transaction.date).toLocaleDateString('pt-PT', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                  </div>
                  <div className="expense-amount">{transaction.amount.toFixed(2)}€</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default MonthInsights;