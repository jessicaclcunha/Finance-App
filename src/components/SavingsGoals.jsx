import { useState, useEffect, useRef } from "react";

const AnimatedProgressBar = ({ progress, isCompleted, isOverdue }) => {
  const [displayed, setDisplayed] = useState(0);
  const [particles, setParticles] = useState([]);
  const [shine, setShine] = useState(false);
  const prevProgress = useRef(0);

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
          setParticles(Array.from({ length: 10 }, (_, i) => ({
            id: Date.now() + i,
            angle: (i / 10) * 360,
            emoji: ["🎉", "⭐", "✨", "🎊", "💰", "🏆"][i % 6]
          })));
          setTimeout(() => setParticles([]), 1400);
        }
      }
    };
    requestAnimationFrame(animate);
  }, [progress]);

  const getBarColor = () => {
    if (isCompleted) return "linear-gradient(90deg, #5a8f5a, #6B9B6B, #8BC48B)";
    if (isOverdue) return "linear-gradient(90deg, #C07878, #D89090)";
    if (displayed > 75) return "linear-gradient(90deg, #6B2D2D, #A85252, #C46B6B, #D4A574)";
    if (displayed > 40) return "linear-gradient(90deg, #8B3D3D, #A85252, #C46B6B)";
    return "linear-gradient(90deg, #8B3D3D, #A85252)";
  };

  return (
    <div className="goal-progress-wrapper" style={{ position: 'relative' }}>
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

/* ── Animated counter ── */
const AnimatedValue = ({ value, decimals = 2, prefix = "", suffix = "€" }) => {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    const duration = 600;
    const startTime = performance.now();
    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(start + (end - start) * eased);
      if (t < 1) requestAnimationFrame(animate);
      else prevRef.current = end;
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{displayed.toFixed(decimals)}{suffix}</span>;
};

/* ── Modal de edição — sem autoFocus para não abrir teclado ── */
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
            {/* Sem autoFocus — evita abertura automática do teclado no mobile */}
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
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
  const [celebratingId, setCelebratingId] = useState(null);
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
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newSaved = Math.max(0, goal.saved + amount);
    const wasComplete = goal.saved >= goal.target;
    const nowComplete = newSaved >= goal.target;
    
    saveGoals(goals.map(g =>
      g.id === id ? { ...g, saved: newSaved } : g
    ));

    // Celebrar se acabou de completar
    if (!wasComplete && nowComplete) {
      setCelebratingId(id);
      setTimeout(() => setCelebratingId(null), 3000);
    }
  };

  const handleCustomAmount = (id) => {
    const amount = prompt("Adicionar valor (€) — use negativo para remover:");
    if (amount && !isNaN(parseFloat(amount))) {
      handleUpdateSaved(id, parseFloat(amount));
    }
  };

  const editingGoal = goals.find(g => g.id === editingGoalId);

  // Totais globais
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const completedCount = goals.filter(g => g.saved >= g.target).length;

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Metas de Poupança</h2>
          {goals.length > 0 && (
            <p style={{ fontSize: '13px', color: 'var(--beige-700)', marginTop: '4px' }}>
              {completedCount}/{goals.length} concluídas • {totalSaved.toFixed(0)}€ / {totalTarget.toFixed(0)}€
            </p>
          )}
        </div>
        {!isAddingGoal && (
          <button onClick={() => setIsAddingGoal(true)} className="btn btn-primary">
            + Nova Meta
          </button>
        )}
      </div>

      {/* Barra de progresso global */}
      {goals.length > 1 && (
        <div style={{ marginBottom: '24px', background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid var(--beige-300)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--beige-700)', fontWeight: 600 }}>
            <span>Progresso Global</span>
            <span>{totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%</span>
          </div>
          <AnimatedProgressBar
            progress={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}
            isCompleted={totalSaved >= totalTarget && totalTarget > 0}
            isOverdue={false}
          />
        </div>
      )}

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
            const isCelebrating = celebratingId === goal.id;
            const remaining = goal.target - goal.saved;
            const monthlyNeeded = daysLeft > 0 ? (remaining / (daysLeft / 30)).toFixed(0) : null;

            return (
              <div
                key={goal.id}
                className={`goal-card ${isCompleted ? "goal-completed" : ""} ${isCelebrating ? "goal-celebrating" : ""}`}
                style={{ transition: 'transform 0.3s, box-shadow 0.3s', transform: isCelebrating ? 'scale(1.02)' : 'scale(1)' }}
              >
                {/* Confetti no card quando celebra */}
                {isCelebrating && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: '8px', zIndex: 10 }}>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span key={i} style={{
                        position: 'absolute',
                        left: `${Math.random() * 100}%`,
                        top: '-20px',
                        fontSize: '18px',
                        animation: `confetti-fall ${0.8 + Math.random() * 1.2}s ease-in forwards`,
                        animationDelay: `${Math.random() * 0.5}s`
                      }}>
                        {["🎉", "⭐", "✨", "🎊", "💰", "🏆"][i % 6]}
                      </span>
                    ))}
                  </div>
                )}

                <div className="goal-header">
                  <h3 className="goal-name">
                    {isCompleted && <span className="goal-trophy">🏆 </span>}
                    {goal.name}
                  </h3>
                  <div className="goal-header-actions">
                    <button onClick={() => setEditingGoalId(goal.id)} className="goal-edit" title="Editar meta">✎</button>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="goal-delete" title="Eliminar meta">×</button>
                  </div>
                </div>

                <AnimatedProgressBar progress={progress} isCompleted={isCompleted} isOverdue={isOverdue} />

                <div className="goal-stats">
                  <div>
                    <span className="goal-amount">
                      <AnimatedValue value={goal.saved} />
                    </span>
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

                {/* Info adicional: falta quanto e média mensal */}
                {!isCompleted && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, background: 'var(--beige-50)', borderRadius: '6px', padding: '8px', border: '1px solid var(--beige-200)', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--beige-700)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Falta</div>
                      <div style={{ fontSize: '15px', fontFamily: 'var(--font-serif)', color: 'var(--burgundy-700)' }}>{remaining.toFixed(0)}€</div>
                    </div>
                    {monthlyNeeded && (
                      <div style={{ flex: 1, background: 'var(--beige-50)', borderRadius: '6px', padding: '8px', border: '1px solid var(--beige-200)', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'var(--beige-700)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Por mês</div>
                        <div style={{ fontSize: '15px', fontFamily: 'var(--font-serif)', color: 'var(--burgundy-700)' }}>{monthlyNeeded}€</div>
                      </div>
                    )}
                  </div>
                )}

                {!isCompleted && (
                  <div className="goal-actions">
                    <button onClick={() => handleUpdateSaved(goal.id, 5)} className="btn btn-secondary btn-small">+5€</button>
                    <button onClick={() => handleUpdateSaved(goal.id, 10)} className="btn btn-secondary btn-small">+10€</button>
                    <button onClick={() => handleUpdateSaved(goal.id, 20)} className="btn btn-secondary btn-small">+20€</button>
                    <button onClick={() => handleCustomAmount(goal.id)} className="btn btn-primary btn-small">Outro…</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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