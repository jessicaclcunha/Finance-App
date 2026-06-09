import { useState, useEffect, useContext } from "react";
import TransactionList from "./components/TransactionList";
import Header from "./components/Header";
import Charts from "./components/Charts";
import MonthPicker from "./components/MonthPicker";
import Dashboard from "./components/Dashboard";
import CategoryManager from "./components/CategoryManager";
import MonthlyComparison from "./components/MonthlyComparison";
import MonthInsights from "./components/MonthInsights";
import SavingsGoals from "./components/SavingsGoals";
import ExportData from "./components/ExportData";
import AnnualView from "./components/AnnualView";
import RecurringTransactions from "./components/RecurringTransactions";
import BudgetAlerts from "./components/BudgetAlerts";
import GamificationPanel from "./components/GamificationPanel";
import useRecurringInjector from "./hooks/useRecurringInjector";
import useGamification from "./hooks/useGamification";
import { CategoriesContext, CategoriesProvider } from "./contexts/CategoriesContext";

const AppWrapper = () => (
  <CategoriesProvider>
    <App />
  </CategoriesProvider>
);

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [goals] = useState(() => {
    const saved = localStorage.getItem("savingsGoals");
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState("dashboard");
  const [viewMode, setViewMode] = useState("month");
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  useRecurringInjector(transactions, setTransactions);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const { categories } = useContext(CategoriesContext);

  const { streak, achievements, score, breakdown, challenges } =
    useGamification(transactions, categories, goals, selectedDate);

  const handleAddTransaction    = (t)        => setTransactions(prev => [...prev, t]);
  const handleDeleteTransaction = (id)       => {
    if (window.confirm("Eliminar esta transação?"))
      setTransactions(prev => prev.filter(t => t.id !== id));
  };
  const handleEditTransaction   = (id, data) =>
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date || Date.now());
    return d.getMonth() === selectedDate.month && d.getFullYear() === selectedDate.year;
  });

  return (
    <div className="app-container">
      <Header view={view} setView={setView} />

      <div className="content-wrapper">

        {view === "dashboard" && (
          <>
            <MonthPicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            {viewMode === "month" ? (
              <>
                <Dashboard transactions={filteredTransactions} />
                <GamificationPanel
                  score={score}
                  breakdown={breakdown}
                  streak={streak}
                  achievements={achievements}
                  challenges={challenges}
                />
                <BudgetAlerts
                  transactions={filteredTransactions}
                  categories={categories}
                />
                <MonthInsights
                  transactions={filteredTransactions}
                  selectedDate={selectedDate}
                />
              </>
            ) : (
              <AnnualView
                allTransactions={transactions}
                selectedYear={selectedDate.year}
                compact={true}
              />
            )}
          </>
        )}

        {view === "transactions" && (
          <TransactionList
            transactions={filteredTransactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {view === "analysis" && (
          <>
            <MonthPicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            {viewMode === "month" ? (
              <>
                <MonthlyComparison allTransactions={transactions} />
                <Charts transactions={filteredTransactions} categories={categories} />
              </>
            ) : (
              <AnnualView
                allTransactions={transactions}
                selectedYear={selectedDate.year}
                compact={false}
              />
            )}
            <ExportData transactions={transactions} categories={categories} />
          </>
        )}

        {view === "goals" && (
          <SavingsGoals
            transactions={filteredTransactions}
            selectedDate={selectedDate}
          />
        )}

        {view === "categories" && (
          <>
            <CategoryManager />
            <RecurringTransactions />
          </>
        )}

      </div>
    </div>
  );
}

export default AppWrapper;