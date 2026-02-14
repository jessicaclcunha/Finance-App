import { useState, useContext } from "react";
import { CategoriesContext } from "../contexts/CategoriesContext";

const CategoryManager = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useContext(CategoriesContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#A85252",
    icon: "📁",
    budget: 0
  });

  const iconSuggestions = [
    "🍽", "🚗", "💊", "🎭", "📚", "🏠", "✈️", "👕", 
    "🎬", "💡", "🎵", "💳", "🏋️", "🐕", "🎮", "☕",
    "🛒", "📱", "💄", "🔧", "🎨", "🏥", "🚌", "🍕"
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
    setFormData({ name: "", color: "#A85252", icon: "📁", budget: 0 });
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      budget: category.budget
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Eliminar a categoria "${name}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Categorias</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn btn-primary"
        >
          + Nova Categoria
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <div className="empty-title">Nenhuma categoria criada</div>
          <div className="empty-description">
            Crie categorias para organizar melhor as suas despesas
          </div>
        </div>
      ) : (
        <div className="category-grid">
          {categories.map(category => (
            <div key={category.id} className="category-card">
              <div 
                className="accent-bar" 
                style={{ background: category.color }}
              ></div>

              <div className="category-header">
                <div 
                  style={{ 
                    fontSize: '32px',
                    width: '56px',
                    height: '56px',
                    background: `${category.color}20`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {category.icon}
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <div className="category-budget" style={{ color: category.color }}>
                    {category.budget.toFixed(2)}€/mês
                  </div>
                </div>
              </div>
              
              <div className="category-actions">
                <button
                  onClick={() => handleEdit(category)}
                  className="btn btn-secondary btn-small"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="btn btn-secondary btn-small"
                  style={{ color: 'var(--error)' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) resetForm();
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </h3>
              <button onClick={resetForm} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome da Categoria</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Ex: Alimentação, Transporte..."
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
                
                {/* Color picker + preview */}
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
                  required
                />
              </div>

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