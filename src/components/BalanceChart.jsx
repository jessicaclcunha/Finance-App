import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement);

const BalanceChart = ({ transactions = [], categories = [] }) => {
  // Verificação de segurança
  if (!categories || categories.length === 0) {
    return <p className="text-gray-500">Nenhuma categoria disponível</p>;
  }
  
    const categoryData = (categories || []).map((cat) => ({
      name: cat.name,
      total: transactions
        .filter((t) => t.type === "expense" && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0),
      color: cat.color,
    }));
  
    const data = {
      labels: categoryData.map((cat) => cat.name),
      datasets: [
        {
          label: "Despesas por Categoria",
          data: categoryData.map((cat) => cat.total),
          backgroundColor: categoryData.map((cat) => cat.color),
        },
      ],
    };
  
    return <Bar data={data} />;
  };
  
export default BalanceChart;