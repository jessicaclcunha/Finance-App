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
import { CategoriesContext, CategoriesProvider } from "./contexts/CategoriesContext";

const AppWrapper = () => {
  return (
    <CategoriesProvider>
      <App />
    </CategoriesProvider>
  );
};

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState("dashboard");
  const [viewMode, setViewMode] = useState("month"); // "month" ou "year"

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const { categories } = useContext(CategoriesContext);

  const handleAddTransaction = (newTransaction) => {
    setTransactions([...transactions, newTransaction]);
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm("Eliminar esta transação?")) {
      setTransactions(transactions.filter((transaction) => transaction.id !== id));
    }
  };

  const handleEditTransaction = (id, updatedData) => {
    setTransactions(transactions.map(t =>
      t.id === id ? { ...t, ...updatedData } : t
    ));
  };

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const getFilteredTransactions = (transactions, selectedDate) => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date || Date.now());
      return (
        transactionDate.getMonth() === selectedDate.month &&
        transactionDate.getFullYear() === selectedDate.year
      );
    });
  };

  const filteredTransactions = getFilteredTransactions(transactions, selectedDate);

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
                <Charts
                  transactions={filteredTransactions}
                  categories={categories}
                />
              </>
            ) : (
              <AnnualView
                allTransactions={transactions}
                selectedYear={selectedDate.year}
                compact={false}
              />
            )}

            <ExportData
              transactions={transactions}
              categories={categories}
            />
          </>
        )}

        {view === "goals" && (
          <SavingsGoals
            transactions={filteredTransactions}
            selectedDate={selectedDate}
          />
        )}

        {view === "categories" && (
          <CategoryManager />
        )}
      </div>
    </div>
  );
}

export default AppWrapper;