import { useState, useEffect, useRef } from "react";

const AnimatedProgressBar = ({ progress, isCompleted, isOverdue }) => {
  const [displayed, setDisplayed] = useState(0);
  const [particles, setParticles] = useState([]);
  const [shine, setShine] = useState(false);
  const prevProgress = useRef(0);
  const barRef = useRef(null);

  useEffect(() => {
    const target = Math.min(progress, 100);
    const start = prevProgress.current;
    const diff = target - start;
    if (diff === 0) return;

    const duration = 900;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(start + diff * eased);
      if (t < 1) requestAnimationFrame(animate);
      else {
        prevProgress.current = target;
        if (target >= 100) {
          setShine(true);
          setParticles(Array.from({ length: 8 }, (_, i) => ({
            id: Date.now() + i,
            angle: (i / 8) * 360,
            emoji: ["🎉", "⭐", "✨", "🎊"][i % 4]
          })));
          setTimeout(() => setParticles([]), 1200);
        }
      }
    };
    requestAnimationFrame(animate);
  }, [progress]);

  const getBarColor = () => {
    if (isCompleted) return "linear-gradient(90deg, #6B9B6B, #8BC48B)";
    if (isOverdue) return "linear-gradient(90deg, #C07878, #D89090)";
    if (displayed > 75) return "linear-gradient(90deg, #A85252, #C46B6B, #D4A574)";
    if (displayed > 40) return "linear-gradient(90deg, #A85252, #C46B6B)";
    return "linear-gradient(90deg, #8B3D3D, #A85252)";
  };

  return (
    <div className="goal-progress-wrapper" ref={barRef}>
      <div className="goal-progress-bar">
        <div
          className={`goal-progress-fill ${shine ? "goal-shine" : ""}`}
          style={{ width: `${displayed}%`, background: getBarColor() }}
        />
        {displayed > 2 && displayed < 100 && (
          <div className="goal-progress-tip" style={{ left: `${displayed}%` }} />
        )}
      </div>
      {particles.map(p => (
        <span key={p.id} className="goal-particle" style={{ "--angle": `${p.angle}deg` }}>
          {p.emoji}
        </span>
      ))}
      <div className="goal-milestones">
        {[25, 50, 75].map(m => (
          <div
            key={m}
            className={`goal-milestone ${displayed >= m ? "reached" : ""}`}
            style={{ left: `${m}%` }}
            title={`${m}%`}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Modal de edição de meta ── */
const GoalEditModal = ({ goal, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: goal.name,
    target: goal.target,
    deadline: goal.deadline,
    saved: goal.saved,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      target: parseFloat(formData.target),
      saved: parseFloat(formData.saved),
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Editar Meta</h3>
          <button onClick={onCancel} className="modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome da Meta</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valor Alvo (€)</label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="form-input"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data Alvo</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Valor Poupado (€)</label>
            <input
              type="number"
              value={formData.saved}
              onChange={(e) => setFormData({ ...formData, saved: e.target.value })}
              className="form-input"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Componente principal ── */
const SavingsGoals = ({ transactions, selectedDate }) => {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("savingsGoals");
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [newGoal, setNewGoal] = useState({ name: "", target: "", deadline: "" });

  const saveGoals = (updated) => {
    setGoals(updated);
    localStorage.setItem("savingsGoals", JSON.stringify(updated));
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    const goal = {
      id: Date.now(),
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      deadline: newGoal.deadline,
      saved: 0,
      createdAt: Date.now(),
    };
    saveGoals([...goals, goal]);
    setNewGoal({ name: "", target: "", deadline: "" });
    setIsAddingGoal(false);
  };

  const handleEditGoal = (id, updated) => {
    saveGoals(goals.map(g => g.id === id ? { ...g, ...updated } : g));
    setEditingGoalId(null);
  };

  const handleDeleteGoal = (id) => {
    if (window.confirm("Eliminar esta meta?")) {
      saveGoals(goals.filter(g => g.id !== id));
    }
  };

  const handleUpdateSaved = (id, amount) => {
    saveGoals(goals.map(g =>
      g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g
    ));
  };

  const handleCustomAmount = (id) => {
    const amount = prompt("Adicionar valor customizado (€):");
    if (amount && !isNaN(parseFloat(amount))) {
      handleUpdateSaved(id, parseFloat(amount));
    }
  };

  const editingGoal = goals.find(g => g.id === editingGoalId);

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Metas de Poupança</h2>
        {!isAddingGoal && (
          <button onClick={() => setIsAddingGoal(true)} className="btn btn-primary">
            + Nova Meta
          </button>
        )}
      </div>

      {/* Formulário nova meta */}
      {isAddingGoal && (
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleAddGoal}>
            <div className="form-group">
              <label className="form-label">Nome da Meta</label>
              <input
                type="text"
                placeholder="Ex: Férias, Carro novo..."
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="form-input"
                required
                autoFocus
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Valor Alvo (€)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="form-input"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Data Alvo</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Criar Meta</button>
              <button type="button" onClick={() => { setIsAddingGoal(false); setNewGoal({ name: "", target: "", deadline: "" }); }} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de metas */}
      {goals.length === 0 && !isAddingGoal ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <div className="empty-title">Nenhuma meta definida</div>
          <div className="empty-description">Crie metas de poupança para alcançar os seus objetivos</div>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => {
            const progress = (goal.saved / goal.target) * 100;
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;
            const isCompleted = goal.saved >= goal.target;

            return (
              <div key={goal.id} className={`goal-card ${isCompleted ? "goal-completed" : ""}`}>
                <div className="goal-header">
                  <h3 className="goal-name">
                    {isCompleted && <span className="goal-trophy">🏆 </span>}
                    {goal.name}
                  </h3>
                  <div className="goal-header-actions">
                    <button
                      onClick={() => setEditingGoalId(goal.id)}
                      className="goal-edit"
                      title="Editar meta"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="goal-delete"
                      title="Eliminar meta"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <AnimatedProgressBar progress={progress} isCompleted={isCompleted} isOverdue={isOverdue} />

                <div className="goal-stats">
                  <div>
                    <span className="goal-amount">{goal.saved.toFixed(2)}€</span>
                    <span className="goal-target"> / {goal.target.toFixed(2)}€</span>
                  </div>
                  <div className="goal-percentage">{Math.min(progress, 100).toFixed(0)}%</div>
                </div>

                <div className="goal-deadline" style={{
                  color: isOverdue ? 'var(--error)' : isCompleted ? 'var(--success)' : 'var(--beige-700)'
                }}>
                  {isCompleted ? '✓ Meta atingida! Parabéns! 🎉' :
                   isOverdue ? `⚠ Prazo expirou há ${Math.abs(daysLeft)} dias` :
                   `${daysLeft} dias restantes`}
                </div>

                {!isCompleted && (
                  <div className="goal-actions">
                    <button onClick={() => handleUpdateSaved(goal.id, 10)} className="btn btn-secondary btn-small">+10€</button>
                    <button onClick={() => handleUpdateSaved(goal.id, 50)} className="btn btn-secondary btn-small">+50€</button>
                    <button onClick={() => handleUpdateSaved(goal.id, 100)} className="btn btn-secondary btn-small">+100€</button>
                    <button onClick={() => handleCustomAmount(goal.id)} className="btn btn-primary btn-small">Outro...</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de edição */}
      {editingGoal && (
        <GoalEditModal
          goal={editingGoal}
          onSave={(updated) => handleEditGoal(editingGoal.id, updated)}
          onCancel={() => setEditingGoalId(null)}
        />
      )}
    </section>
  );
};

export default SavingsGoals;