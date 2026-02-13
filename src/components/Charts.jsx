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

  if (!categories || categories.length === 0) return null;

  // Processamento de dados
  const categoryData = categories.map((cat) => {
    const spent = transactions
      .filter((t) => t.type === "expense" && t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: cat.name,
      spent: spent,
      budget: cat.budget || 0,
      color: cat.color,
      icon: cat.icon,
    };
  });

  const categoriesWithExpenses = categoryData.filter(cat => cat.spent > 0);

  // Configuração do Gráfico de Barras (Gasto vs Orçamento)
  const barData = {
    labels: categoryData.map((cat) => cat.name),
    datasets: [
      {
        label: "Gasto Real",
        data: categoryData.map((cat) => cat.spent),
        backgroundColor: categoryData.map((cat) => cat.color),
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 25,
      },
      {
        label: "Orçamento",
        data: categoryData.map((cat) => cat.budget),
        backgroundColor: "rgba(229, 221, 206, 0.4)", // var(--beige-300) com transparência
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 25,
      }
    ],
  };

  // Configuração do Gráfico de Rosca (Distribuição %)
  const doughnutData = {
    labels: categoriesWithExpenses.map((cat) => cat.name),
    datasets: [
      {
        data: categoriesWithExpenses.map((cat) => cat.spent),
        backgroundColor: categoriesWithExpenses.map((cat) => cat.color),
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 10,
        cutout: "60%", // Transforma em "Donut" elegante
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartType === "doughnut",
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { family: "Inter", size: 12 }
        }
      },
      tooltip: {
        backgroundColor: "#6B2D2D",
        padding: 12,
        bodyFont: { family: "Inter" },
        titleFont: { family: "Crimson Pro", size: 15 },
        callbacks: {
          label: (context) => {
            const value = context.parsed.y || context.parsed || 0;
            if (chartType === "doughnut") {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return ` ${context.label}: ${value.toFixed(2)}€ (${percentage}%)`;
            }
            return ` ${context.dataset.label}: ${value.toFixed(2)}€`;
          }
        }
      }
    },
    scales: chartType === "bar" ? {
      x: { grid: { display: false } },
      y: { 
        grid: { color: "#F0EBE0" },
        ticks: { callback: (v) => `${v}€` }
      }
    } : {}
  };

  return (
    <section className="section fade-in">
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <h2 className="section-title">Distribuição de Gastos</h2>
            <p className="stat-detail">Comparação por categoria e orçamento</p>
          </div>
          <div className="view-mode-toggle" style={{ margin: 0}}>
            <button 
              className={`view-btn ${chartType === "bar" ? "active" : ""}`}
              onClick={() => setChartType("bar")}
            >
              Orçamento
            </button>
            <button 
              className={`view-btn ${chartType === "doughnut" ? "active" : ""}`}
              onClick={() => setChartType("doughnut")}
            >
              Percentagem
            </button>
          </div>
        </div>

        <div className="chart-canvas" style={{ height: "250px"}}>
          {chartType === "bar" ? (
            <Bar data={barData} options={commonOptions} />
          ) : (
            <Doughnut data={doughnutData} options={commonOptions} />
          )}
        </div>
      </div>
    </section>
  );
};

export default Charts;