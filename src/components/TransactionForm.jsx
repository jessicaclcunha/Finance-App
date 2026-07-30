import { useState, useContext } from "react";
import { CategoriesContext } from "../contexts/CategoriesContext";
import { useCurrency } from "../contexts/CurrencyContext";


const TransactionForm = ({
  onAddTransaction,
  onSave,
  isOpen,
  onClose,
  transaction = null,
}) => {
  const isEditing = Boolean(transaction);
  const { categories } = useContext(CategoriesContext);
  const { symbol } = useCurrency();

  const getInitialState = () => {
    if (isEditing) {
      return {
        description: transaction.description,
        amount: transaction.amount,
        date: new Date(transaction.date).toISOString().split("T")[0],
        type: transaction.type,
        categoryId: transaction.categoryId ?? categories[0]?.id ?? "",
      };
    }
    return {
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      type: "expense",
      categoryId: categories[0]?.id ?? "",
    };
  };

  const [form, setForm] = useState(getInitialState);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const availableCategories = categories.filter(cat => {
    if (!cat.type || cat.type === "both") return true;
    return cat.type === form.type;
  });

  const handleTypeChange = (newType) => {
    const filtered = categories.filter(cat => {
      if (cat.type === "both") return true;
      if (!cat.type) return newType === "expense";
      return cat.type === newType;
    });
    setForm(prev => ({
      ...prev,
      type: newType,
      categoryId: filtered[0]?.id ?? prev.categoryId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.date) return;

    const selectedCategory = availableCategories.find(
      c => c.id === parseInt(form.categoryId)
    );

    const payload = {
      date: new Date(form.date).getTime(),
      description:
        form.description ||
        selectedCategory?.name ||
        (form.type === "income" ? "Receita" : "Despesa"),
      amount: parseFloat(form.amount),
      type: form.type,
      categoryId:
        form.type === "expense" && availableCategories.length > 0
          ? parseInt(form.categoryId)
          : null,
    };

    if (isEditing) {
      onSave(payload);
    } else {
      onAddTransaction({ id: Date.now(), ...payload });
    }

    if (!isEditing) setForm(getInitialState());
    onClose();
  };

  const handleClose = () => {
    if (!isEditing) setForm(getInitialState());
    onClose();
  };

  if (!isOpen) return null;

  const maxDate = isEditing
    ? undefined
    : new Date().toISOString().split("T")[0];

  return (
    <div
      className={isEditing ? "modal-overlay" : "card fade-in"}
      style={isEditing ? undefined : { marginBottom: "24px" }}
      onClick={isEditing
        ? (e) => { if (e.target === e.currentTarget) handleClose(); }
        : undefined}
    >
      <div className={isEditing ? "modal-content" : undefined}>
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditing ? "Editar Transação" : "Nova Transação"}
          </h3>
          <button onClick={handleClose} className="modal-close">×</button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={isEditing ? { padding: "20px" } : undefined}
        >
          {/* Tipo */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={form.type === "expense" ? "btn btn-warning" : "btn btn-secondary"}
              style={{ flex: 1 }}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={form.type === "income" ? "btn btn-success" : "btn btn-secondary"}
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
                value={form.categoryId}
                onChange={e => set("categoryId", parseInt(e.target.value))}
                className="form-select"
              >
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Descrição */}
          <div className="form-group">
            <label className="form-label">
              {isEditing ? "Descrição" : "Descrição (opcional)"}
            </label>
            <input
              type="text"
              placeholder="Ex: Supermercado Continente"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              className="form-input"
              required={isEditing}
            />
            {!isEditing && (
              <p style={{ fontSize: "12px", color: "var(--beige-600)", marginTop: "6px" }}>
                Se deixar vazio, usa o nome da categoria
              </p>
            )}
          </div>

          {/* Valor + Data */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valor ({symbol})</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set("amount", e.target.value)}
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
                value={form.date}
                onChange={e => set("date", e.target.value)}
                className="form-input"
                max={maxDate}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {isEditing ? "Guardar" : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;