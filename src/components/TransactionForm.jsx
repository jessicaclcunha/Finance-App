import { useState, useContext } from "react";
import { CategoriesContext } from "../contexts/CategoriesContext";

const TransactionForm = ({ onAddTransaction }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { categories } = useContext(CategoriesContext);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Categorias disponíveis para cada tipo.
  // Se a categoria não tem tipo definido (criada antes da atualização),
  // mostra-a para ambos os tipos.
  const availableCategories = categories.filter(cat => {
    if (!cat.type || cat.type === "both") return true;
    return cat.type === type;
  });

  const handleTypeChange = (newType) => {
    setType(newType);
    // Resetar categoria para a primeira disponível do novo tipo
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

    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setCategoryId(categories[0]?.id || "");
    setIsFormVisible(false);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
  };

  if (!isFormVisible) {
    return (
      <button
        onClick={() => setIsFormVisible(true)}
        className="btn btn-primary"
        style={{ marginBottom: '24px', width: '100%' }}
      >
        + Nova Transação
      </button>
    );
  }

  return (
    <div className="card fade-in" style={{ marginBottom: '24px' }}>
      <div className="modal-header">
        <h3 className="modal-title">Nova Transação</h3>
        <button onClick={handleCancel} className="modal-close">×</button>
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

        {/* Categoria — aparece para qualquer tipo se houver categorias disponíveis */}
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
            {availableCategories.length === 0 && (
              <p style={{ fontSize: '12px', color: 'var(--beige-600)', marginTop: '6px' }}>
                Crie categorias do tipo "{type === "income" ? "Receita" : "Despesa"}" ou "Ambos" para as ver aqui.
              </p>
            )}
          </div>
        )}

        {/* Descrição — sem autoFocus para não abrir teclado automaticamente */}
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
          <button type="button" onClick={handleCancel} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;