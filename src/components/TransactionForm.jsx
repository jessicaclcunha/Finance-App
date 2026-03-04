import { useState, useContext } from "react";
import { CategoriesContext } from "../contexts/CategoriesContext";

const TransactionForm = ({ onAddTransaction, isOpen, onClose }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { categories } = useContext(CategoriesContext);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");

  const availableCategories = categories.filter(cat => {
    if (!cat.type || cat.type === "both") return true;
    return cat.type === type;
  });

  const handleTypeChange = (newType) => {
    setType(newType);
    const filtered = categories.filter(cat => {
      if (!cat.type || cat.type === "expense") return newType === "expense";
      if (cat.type === "income") return newType === "income";
      if (cat.type === "both") return true;
      return false;
    });
    if (filtered.length > 0) setCategoryId(filtered[0].id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !date) return;

    const selectedCategory = availableCategories.find(c => c.id === parseInt(categoryId));

    const newTransaction = {
      id: Date.now(),
      date: new Date(date).getTime(),
      description: description || selectedCategory?.name || (type === "income" ? "Receita" : "Despesa"),
      amount: parseFloat(amount),
      type,
      categoryId: availableCategories.length > 0 ? parseInt(categoryId) : null,
    };

    onAddTransaction(newTransaction);
    resetForm();
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setCategoryId(categories[0]?.id || "");
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="card fade-in" style={{ marginBottom: '24px' }}>
      <div className="modal-header">
        <h3 className="modal-title">Nova Transação</h3>
        <button onClick={resetForm} className="modal-close">×</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tipo */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={type === "expense" ? "btn btn-warning" : "btn btn-secondary"}
            style={{ flex: 1 }}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={type === "income" ? "btn btn-success" : "btn btn-secondary"}
            style={{ flex: 1 }}
          >
            Receita
          </button>
        </div>

        {/* Categoria */}
        {availableCategories.length > 0 && (
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value))}
              className="form-select"
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Descrição */}
        <div className="form-group">
          <label className="form-label">Descrição (opcional)</label>
          <input
            type="text"
            placeholder="Ex: Supermercado Continente"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
          />
          <p style={{ fontSize: '12px', color: 'var(--beige-600)', marginTop: '6px' }}>
            Se deixar vazio, usa o nome da categoria
          </p>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Valor (€)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            Adicionar
          </button>
          <button type="button" onClick={resetForm} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;