import { useState, useEffect, useRef } from "react";
import { useCurrency } from "../contexts/CurrencyContext";

const AnimatedCounter = ({ value, showSign = false, decimals = 2 }) => {
  const { formatCurrency } = useCurrency();
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const duration = 600;
    const startTime = performance.now();

    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(start + (end - start) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <span>{formatCurrency(displayed, { decimals, showSign })}</span>;
};

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
              <AnimatedCounter value={balance} showSign decimals={2} />
            </div>
          </div>
        </div>
      </div>

      <div className="stats-compact">
        <div className="stat-compact income">
          <div className="stat-compact-header">
            <span className="stat-compact-label">Receitas</span>
          </div>
          <div className="stat-compact-value positive">
            <AnimatedCounter value={income} showSign decimals={2} />
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
            <AnimatedCounter value={-expenses} showSign decimals={2} />
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