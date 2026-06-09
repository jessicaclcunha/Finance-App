import { useState, useContext, useRef, useEffect } from "react";
import TransactionForm from "./TransactionForm";
import { CategoriesContext } from "../contexts/CategoriesContext";

const SwipeableItem = ({ children, onRemove }) => {
  const ref = useRef(null);
  const startX = useRef(null);
  const currentX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const THRESHOLD = 80;

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const triggerRemove = () => {
    setLeaving(true);
    setTimeout(onRemove, 300);
  };

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx > 0) return;
    currentX.current = dx;
    setOffset(Math.max(dx, -120));
  };

  const onTouchEnd = () => {
    if (Math.abs(currentX.current) >= THRESHOLD) {
      setOffset(-window.innerWidth);
      setTimeout(triggerRemove, 250);
    } else {
      setOffset(0);
    }
    startX.current = null;
    currentX.current = 0;
  };

  const outerStyle = {
    opacity: leaving ? 0 : mounted ? 1 : 0,
    transform: leaving
      ? "translateX(-40px) scaleY(0.85)"
      : mounted ? "translateX(0)" : "translateX(24px)",
    maxHeight: leaving ? "0px" : "160px",
    overflow: "hidden",
    transition: leaving
      ? "opacity 0.28s ease, transform 0.28s ease, max-height 0.3s ease"
      : "opacity 0.25s ease, transform 0.25s ease",
    marginBottom: leaving ? "0px" : "8px",
  };

  const innerStyle = {
    transform: `translateX(${offset}px)`,
    transition: startX.current ? "none" : "transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)",
    position: "relative",
    zIndex: 1,
  };

  const swipeBackground = (
    <div style={{
      position: "absolute",
      inset: 0,
      background: "var(--error)",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingRight: "20px",
      opacity: Math.min(Math.abs(offset) / THRESHOLD, 1),
    }}>
      <span style={{ color: "white", fontSize: "20px" }}>🗑</span>
    </div>
  );

  return (
    <div style={{ ...outerStyle, position: "relative" }}>
      {swipeBackground}
      <div
        ref={ref}
        style={innerStyle}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children(triggerRemove)}
      </div>
    </div>
  );
};

const TransactionList = ({ transactions, onAddTransaction, onDeleteTransaction, onEditTransaction }) => {
  const { categories } = useContext(CategoriesContext);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === "all" || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "date") return b.date - a.date;
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "description") return a.description.localeCompare(b.description);
    return 0;
  });

  const getCategoryInfo = (categoryId) =>
    categories.find(cat => cat.id === categoryId) || {
      name: "Sem categoria", icon: "📁", color: "var(--beige-700)",
    };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
  };

  const editingTransaction = transactions.find(t => t.id === editingId);

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Transações</h2>
        <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
          + Nova Transação
        </button>
      </div>

      <div className="view-mode-toggle" style={{ marginBottom: "16px" }}>
        {["all", "income", "expense"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={filter === f ? "view-btn active" : "view-btn"}>
            {f === "all" ? "Todas" : f === "income" ? "Receitas" : "Despesas"}
          </button>
        ))}
      </div>

      <div className="transaction-controls">
        <input type="text" placeholder="🔍 Pesquisar transações..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="search-input" />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
          <option value="date">Ordenar por data</option>
          <option value="amount">Ordenar por valor</option>
          <option value="description">Ordenar por nome</option>
        </select>
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAddTransaction={t => { onAddTransaction(t); setIsFormOpen(false); }}
      />

      {sortedTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">Nenhuma transação</div>
          <div className="empty-description">
            {searchTerm ? "Nenhuma transação encontrada com esse termo"
              : filter === "all" ? "Adicione a sua primeira transação acima"
              : "Tente alterar o filtro"}
          </div>
        </div>
      ) : (
        <div className="transaction-list">
          {sortedTransactions.map(transaction => {
            const category = transaction.type === "expense"
              ? getCategoryInfo(transaction.categoryId) : null;

            return (
              <SwipeableItem key={transaction.id}
                onRemove={() => onDeleteTransaction(transaction.id)}>
                {(triggerRemove) => (
                  <div className="transaction-item" style={{
                    borderLeft: transaction.isRecurring
                      ? "3px solid var(--beige-400)" : undefined,
                  }}>
                    <div className="transaction-icon" style={{
                      background: transaction.type === "income"
                        ? "rgba(107, 155, 107, 0.15)"
                        : category?.color ? `${category.color}20`
                        : "rgba(212, 165, 116, 0.15)",
                    }}>
                      {transaction.isRecurring ? "🔄"
                        : transaction.type === "income" ? "💰"
                        : category ? category.icon : "📁"}
                    </div>

                    <div className="transaction-info">
                      <div className="transaction-description">{transaction.description}</div>
                      <div className="transaction-meta">
                        <span>{formatDate(transaction.date)}</span>
                        {transaction.type === "expense" && category && (
                          <><span>•</span><span>{category.name}</span></>
                        )}
                        {transaction.type === "income" && (
                          <><span>•</span><span>Receita</span></>
                        )}
                        {transaction.isRecurring && (
                          <><span>•</span>
                          <span style={{ color: "var(--beige-600)", fontSize: "11px" }}>recorrente</span></>
                        )}
                      </div>
                    </div>

                    <div className="transaction-amount" style={{
                      color: transaction.type === "income" ? "var(--success)" : "var(--warning)",
                    }}>
                      {transaction.type === "income" ? "+" : "−"}{transaction.amount.toFixed(2)}€
                    </div>

                    <div className="transaction-actions">
                      <button onClick={() => setEditingId(transaction.id)}
                        className="transaction-edit" title="Editar">✎</button>
                      <button onClick={triggerRemove}
                        className="transaction-delete" title="Eliminar">×</button>
                    </div>
                  </div>
                )}
              </SwipeableItem>
            );
          })}
        </div>
      )}

      {editingTransaction && (
        <TransactionForm
          isOpen={Boolean(editingId)}
          onClose={() => setEditingId(null)}
          transaction={editingTransaction}
          onSave={updated => { onEditTransaction(editingId, updated); setEditingId(null); }}
        />
      )}
    </section>
  );
};

export default TransactionList;