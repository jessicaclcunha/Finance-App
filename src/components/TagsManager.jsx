import { useState } from "react";

const TagsManager = () => {
  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem("tags");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Essencial", color: "#A85252" },
      { id: 2, name: "Lazer", color: "#7FA87F" },
      { id: 3, name: "Investimento", color: "#8A7866" }
    ];
  });

  const [newTagName, setNewTagName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const colorOptions = [
    "#A85252", "#8A7866", "#7FA87F", "#D4A574", 
    "#8B3D3D", "#C46B6B", "#6B2D2D", "#A89787"
  ];

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const newTag = {
      id: Date.now(),
      name: newTagName,
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)]
    };

    const updated = [...tags, newTag];
    setTags(updated);
    localStorage.setItem("tags", JSON.stringify(updated));
    setNewTagName("");
    setIsAdding(false);
  };

  const handleDeleteTag = (id) => {
    if (window.confirm("Eliminar esta etiqueta?")) {
      const updated = tags.filter(t => t.id !== id);
      setTags(updated);
      localStorage.setItem("tags", JSON.stringify(updated));
    }
  };

  return (
    <div className="tags-manager">
      <div className="section-header">
        <h3 className="section-title">Etiquetas</h3>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary btn-small">
            + Nova Etiqueta
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddTag} className="tag-form">
          <input
            type="text"
            placeholder="Nome da etiqueta..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="form-input"
            autoFocus
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary btn-small">Criar</button>
          <button 
            type="button" 
            onClick={() => {
              setIsAdding(false);
              setNewTagName("");
            }} 
            className="btn btn-secondary btn-small"
          >
            Cancelar
          </button>
        </form>
      )}

      <div className="tags-list">
        {tags.map(tag => (
          <div key={tag.id} className="tag-chip">
            <span 
              className="tag-dot" 
              style={{ background: tag.color }}
            />
            <span className="tag-name">{tag.name}</span>
            <button
              onClick={() => handleDeleteTag(tag.id)}
              className="tag-delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsManager;