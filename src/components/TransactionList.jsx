import { useState, useContext } from "react";
import TransactionForm from "./TransactionForm";
import { CategoriesContext } from "../contexts/CategoriesContext";

const TransactionList = ({ transactions, onAddTransaction, onDeleteTransaction, onEditTransaction }) => {
  const { categories } = useContext(CategoriesContext);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [editingId, setEditingId] = useState(null);

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

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || { 
      name: "Sem categoria", 
      icon: "📁", 
      color: "var(--beige-700)" 
    };
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    }
    
    return date.toLocaleDateString('pt-PT', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Transações</h2>
        <div className="filters">
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "btn btn-primary btn-small" : "btn btn-secondary btn-small"}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("income")}
            className={filter === "income" ? "btn btn-success btn-small" : "btn btn-secondary btn-small"}
          >
            Receitas
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={filter === "expense" ? "btn btn-warning btn-small" : "btn btn-secondary btn-small"}
          >
            Despesas
          </button>
        </div>
      </div>

      {/* Pesquisa e ordenação */}
      <div className="transaction-controls">
        <input
          type="text"
          placeholder="🔍 Pesquisar transações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="date">Ordenar por data</option>
          <option value="amount">Ordenar por valor</option>
          <option value="description">Ordenar por nome</option>
        </select>
      </div>

      <TransactionForm onAddTransaction={onAddTransaction} />

      {sortedTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">Nenhuma transação</div>
          <div className="empty-description">
            {searchTerm 
              ? "Nenhuma transação encontrada com esse termo"
              : filter === "all" 
              ? "Adicione sua primeira transação acima"
              : "Tente alterar o filtro"}
          </div>
        </div>
      ) : (
        <div className="transaction-list">
          {sortedTransactions.map((transaction) => {
            const category = transaction.type === "expense" 
              ? getCategoryInfo(transaction.categoryId)
              : null;
            
            return (
              <div key={transaction.id} className="transaction-item">
                <div 
                  className="transaction-icon"
                  style={{
                    background: transaction.type === "income" 
                      ? 'rgba(107, 155, 107, 0.15)' 
                      : category?.color ? `${category.color}20` : 'rgba(212, 165, 116, 0.15)'
                  }}
                >
                  {transaction.type === "income" ? '💰' : (category ? category.icon : '📁')}
                </div>
                
                <div className="transaction-info">
                  <div className="transaction-description">
                    {transaction.description}
                  </div>
                  <div className="transaction-meta">
                    <span>{formatDate(transaction.date)}</span>
                    {transaction.type === "expense" && category && (
                      <>
                        <span>•</span>
                        <span>{category.name}</span>
                      </>
                    )}
                    {transaction.type === "income" && (
                      <>
                        <span>•</span>
                        <span>Receita</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div 
                  className="transaction-amount"
                  style={{
                    color: transaction.type === "income" ? 'var(--success)' : 'var(--warning)'
                  }}
                >
                  {transaction.type === "income" ? "+" : "−"}{transaction.amount.toFixed(2)}€
                </div>

                <div className="transaction-actions">
                  <button
                    onClick={() => setEditingId(transaction.id)}
                    className="transaction-edit"
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="transaction-delete"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de edição */}
      {editingId && (
        <TransactionEditModal
          transaction={transactions.find(t => t.id === editingId)}
          categories={categories}
          onSave={(updated) => {
            onEditTransaction(editingId, updated);
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
        />
      )}
    </section>
  );
};

const TransactionEditModal = ({ transaction, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    description: transaction.description,
    amount: transaction.amount,
    date: new Date(transaction.date).toISOString().split('T')[0],
    type: transaction.type,
    categoryId: transaction.categoryId || categories[0]?.id
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).getTime(),
      categoryId: formData.type === "expense" ? parseInt(formData.categoryId) : null
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Editar Transação</h3>
          <button onClick={onCancel} className="modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valor (€)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="form-input"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          {formData.type === "expense" && categories.length > 0 && (
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                className="form-select"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Guardar
            </button>
            <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionList;