import { Bar, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend 
} from "chart.js";
import { useState } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Charts = ({ transactions = [], categories = [] }) => {
  const [chartType, setChartType] = useState("bar");
  const [dataMode, setDataMode] = useState("expenses"); // "expenses" | "income" | "both"

  if (!categories || categories.length === 0) return null;

  // Despesas por categoria
  const categoryExpenseData = categories.map((cat) => {
    const spent = transactions
      .filter((t) => t.type === "expense" && t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      name: `${cat.icon} ${cat.name}`,
      spent,
      budget: cat.budget || 0,
      color: cat.color,
    };
  });

  // Totais globais para doughnut receitas vs despesas
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Gráfico de Barras — Gasto vs Orçamento (por categoria)
  const barData = {
    labels: categoryExpenseData.map((cat) => cat.name),
    datasets: [
      {
        label: "Gasto Real",
        data: categoryExpenseData.map((cat) => cat.spent),
        backgroundColor: categoryExpenseData.map((cat) => cat.color),
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 22,
      },
      {
        label: "Orçamento",
        data: categoryExpenseData.map((cat) => cat.budget),
        backgroundColor: "rgba(229, 221, 206, 0.5)",
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 22,
      }
    ],
  };

  // Doughnut por categoria (só despesas com valor)
  const categoriesWithExpenses = categoryExpenseData.filter(cat => cat.spent > 0);

  // Doughnut receitas vs despesas
  const overviewDoughnutData = {
    labels: ["Receitas", "Despesas"],
    datasets: [{
      data: [totalIncome, totalExpenses],
      backgroundColor: ["#6B9B6B", "#A85252"],
      borderWidth: 2,
      borderColor: "#ffffff",
      hoverOffset: 10,
    }]
  };

  // Doughnut só categorias de despesa
  const categoryDoughnutData = {
    labels: categoriesWithExpenses.map((cat) => cat.name),
    datasets: [{
      data: categoriesWithExpenses.map((cat) => cat.spent),
      backgroundColor: categoriesWithExpenses.map((cat) => cat.color),
      borderWidth: 2,
      borderColor: "#ffffff",
      hoverOffset: 10,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top", labels: { padding: 16, usePointStyle: true, font: { family: "Inter", size: 12 } } },
      tooltip: {
        backgroundColor: "#6B2D2D",
        padding: 12,
        bodyFont: { family: "Inter" },
        titleFont: { family: "Crimson Pro", size: 15 },
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${(context.parsed.y || 0).toFixed(2)}€`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: "#F0EBE0" }, ticks: { callback: (v) => `${v}€` } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: { display: true, position: "bottom", labels: { padding: 20, usePointStyle: true, font: { family: "Inter", size: 12 } } },
      tooltip: {
        backgroundColor: "#6B2D2D",
        padding: 12,
        bodyFont: { family: "Inter" },
        titleFont: { family: "Crimson Pro", size: 15 },
        callbacks: {
          label: (context) => {
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${value.toFixed(2)}€ (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <section className="section fade-in">
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <h2 className="section-title">Distribuição de Gastos</h2>
            <p className="stat-detail">Comparação por categoria e orçamento</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <div className="view-mode-toggle">
              <button className={`view-btn ${chartType === "bar" ? "active" : ""}`} onClick={() => setChartType("bar")}>
                Barras
              </button>
              <button className={`view-btn ${chartType === "doughnut-categories" ? "active" : ""}`} onClick={() => setChartType("doughnut-categories")}>
                Categorias %
              </button>
              <button className={`view-btn ${chartType === "doughnut-overview" ? "active" : ""}`} onClick={() => setChartType("doughnut-overview")}>
                Receitas vs Despesas
              </button>
            </div>
          </div>
        </div>

        {/* Resumo rápido receitas/despesas */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, background: 'rgba(107,155,107,0.1)', borderRadius: '8px', padding: '10px 14px', border: '1px solid rgba(107,155,107,0.2)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--beige-700)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Receitas</div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: 'var(--success)' }}>+{totalIncome.toFixed(2)}€</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(168,82,82,0.08)', borderRadius: '8px', padding: '10px 14px', border: '1px solid rgba(168,82,82,0.15)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--beige-700)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Despesas</div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: 'var(--warning)' }}>−{totalExpenses.toFixed(2)}€</div>
          </div>
          <div style={{ flex: 1, background: 'var(--beige-100)', borderRadius: '8px', padding: '10px 14px', border: '1px solid var(--beige-300)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--beige-700)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saldo</div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', color: (totalIncome - totalExpenses) >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {(totalIncome - totalExpenses) >= 0 ? '+' : ''}{(totalIncome - totalExpenses).toFixed(2)}€
            </div>
          </div>
        </div>

        <div className="chart-canvas" style={{ height: "280px" }}>
          {chartType === "bar" && <Bar data={barData} options={barOptions} />}
          {chartType === "doughnut-categories" && (
            categoriesWithExpenses.length > 0
              ? <Doughnut data={categoryDoughnutData} options={doughnutOptions} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--beige-600)' }}>Sem despesas por categoria neste período</div>
          )}
          {chartType === "doughnut-overview" && (
            (totalIncome + totalExpenses) > 0
              ? <Doughnut data={overviewDoughnutData} options={doughnutOptions} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--beige-600)' }}>Sem dados neste período</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Charts;