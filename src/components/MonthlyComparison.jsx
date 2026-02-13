import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const MonthlyComparison = ({ allTransactions }) => {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const currentYear = new Date().getFullYear();

  const dataByMonth = months.map((_, index) => {
    const monthTransactions = allTransactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === index && date.getFullYear() === currentYear;
    });

    return {
      income: monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
      expenses: monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    };
  });

  const data = {
    labels: months,
    datasets: [
      {
        label: "Receitas",
        data: dataByMonth.map((d) => d.income),
        fill: true,
        borderColor: "#6B9B6B", // var(--success)
        backgroundColor: "rgba(107, 155, 107, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#6B9B6B",
        borderWidth: 1,
      },
      {
        label: "Despesas",
        data: dataByMonth.map((d) => d.expenses),
        fill: true,
        borderColor: "#A85252", // var(--burgundy-600)
        backgroundColor: "rgba(168, 82, 82, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#A85252",
        borderWidth:1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          pointStyle: "circle",
          font: { family: "Inter", size: 12, weight: "500" },
          color: "#4A1D1D", // var(--burgundy-900)
        },
      },
      tooltip: {
        backgroundColor: "#4A1D1D",
        titleFont: { family: "Crimson Pro", size: 14 },
        bodyFont: { family: "Inter", size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y.toFixed(2)}€`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#8A7866", font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#F0EBE0", drawBorder: false },
        ticks: {
          color: "#8A7866",
          font: { size: 11 },
          callback: (value) => value + "€",
        },
      },
    },
  };

  return (
    <section className="section">
      <div className="chart-container">
        <div className="chart-header">
          <h2 className="section-title">Evolução Mensal ({currentYear})</h2>
        </div>
        <div className="chart-canvas" style={{ height: "250px" }}>
          <Line data={data} options={options} />
        </div>
      </div>
    </section>
  );
};

export default MonthlyComparison;