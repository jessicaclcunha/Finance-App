import { useState, useContext } from "react";
import { CategoriesContext } from "../contexts/CategoriesContext";

const CategoryManager = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useContext(CategoriesContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filterType, setFilterType] = useState("all"); // "all" | "expense" | "income"
  const [formData, setFormData] = useState({
    name: "",
    color: "#A85252",
    icon: "📁",
    budget: 0,
    type: "expense" // "expense" | "income" | "both"
  });

  const iconSuggestions = [
    "🍽", "🚗", "💊", "🎭", "📚", "🏠", "✈️", "👕", 
    "🎬", "💡", "🎵", "💳", "🏋️", "🐕", "🎮", "☕",
    "🛒", "📱", "💄", "🔧", "🎨", "🏥", "🚌", "🍕",
    "💰", "📈", "🏦", "💼", "🎁", "🌿", "⚡", "🧾"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Por favor, insira um nome para a categoria");
      return;
    }
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", color: "#A85252", icon: "📁", budget: 0, type: "expense" });
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      budget: category.budget || 0,
      type: category.type || "expense"
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Eliminar a categoria "${name}"?`)) {
      deleteCategory(id);
    }
  };

  const getTypeLabel = (type) => {
    if (type === "income") return { label: "Receita", color: "var(--success)", bg: "rgba(107,155,107,0.12)" };
    if (type === "both") return { label: "Ambos", color: "var(--beige-700)", bg: "var(--beige-100)" };
    return { label: "Despesa", color: "var(--warning)", bg: "rgba(212,165,116,0.15)" };
  };

  const filteredCategories = categories.filter(cat => {
    if (filterType === "all") return true;
    if (filterType === "income") return cat.type === "income" || cat.type === "both";
    if (filterType === "expense") return !cat.type || cat.type === "expense" || cat.type === "both";
    return true;
  });

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Categorias</h2>
          <p style={{ fontSize: '13px', color: 'var(--beige-700)', marginTop: '4px' }}>
            Para despesas, receitas ou ambos
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          + Nova Categoria
        </button>
      </div>

      {/* Filtro por tipo */}
      <div className="view-mode-toggle" style={{ marginBottom: '20px', width: 'fit-content' }}>
        <button className={`view-btn ${filterType === "all" ? "active" : ""}`} onClick={() => setFilterType("all")}>Todas</button>
        <button className={`view-btn ${filterType === "expense" ? "active" : ""}`} onClick={() => setFilterType("expense")}>Despesas</button>
        <button className={`view-btn ${filterType === "income" ? "active" : ""}`} onClick={() => setFilterType("income")}>Receitas</button>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <div className="empty-title">Nenhuma categoria encontrada</div>
          <div className="empty-description">
            Crie categorias para organizar melhor as suas finanças
          </div>
        </div>
      ) : (
        <div className="category-grid">
          {filteredCategories.map(category => {
            const typeInfo = getTypeLabel(category.type || "expense");
            return (
              <div key={category.id} className="category-card">
                <div className="accent-bar" style={{ background: category.color }}></div>

                <div className="category-header">
                  <div style={{
                    fontSize: '32px',
                    width: '56px',
                    height: '56px',
                    background: `${category.color}20`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {category.icon}
                  </div>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '20px',
                        background: typeInfo.bg,
                        color: typeInfo.color,
                      }}>
                        {typeInfo.label}
                      </span>
                      {(category.type === "expense" || !category.type || category.type === "both") && category.budget > 0 && (
                        <div className="category-budget" style={{ color: category.color }}>
                          {category.budget.toFixed(0)}€/mês
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="category-actions">
                  <button onClick={() => handleEdit(category)} className="btn btn-secondary btn-small">Editar</button>
                  <button onClick={() => handleDelete(category.id, category.name)} className="btn btn-secondary btn-small" style={{ color: 'var(--error)' }}>Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </h3>
              <button onClick={resetForm} className="modal-close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Tipo da categoria */}
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { value: "expense", label: "Despesa" },
                    { value: "income", label: "Receita" },
                    { value: "both", label: "Ambos" }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: opt.value })}
                      className={formData.type === opt.value ? "btn btn-primary btn-small" : "btn btn-secondary btn-small"}
                      style={{ flex: 1 }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nome da Categoria</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Ex: Salário, Freelance, Alimentação..."
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ícone (qualquer emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="form-input"
                  placeholder="Cole qualquer emoji"
                  maxLength="4"
                  style={{ fontSize: '32px', textAlign: 'center', padding: '20px' }}
                />
                <p style={{ fontSize: '12px', color: 'var(--beige-600)', marginTop: '8px', marginBottom: '12px' }}>
                  Sugestões rápidas:
                </p>
                <div className="emoji-grid">
                  {iconSuggestions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className="emoji-btn"
                      style={{
                        background: formData.icon === icon ? 'var(--burgundy-100)' : 'white',
                        borderColor: formData.icon === icon ? 'var(--burgundy-700)' : 'var(--beige-300)'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cor</label>
                <div className="color-picker-row">
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="form-input"
                    placeholder="#A85252"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                  <input
                    className="color-preview"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    title="Seletor de cores"
                  />
                </div>
              </div>

              {/* Orçamento só para despesa/ambos */}
              {(formData.type === "expense" || formData.type === "both") && (
                <div className="form-group">
                  <label className="form-label">Orçamento Mensal (€)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="form-input"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingCategory ? "Atualizar" : "Criar"}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoryManager;