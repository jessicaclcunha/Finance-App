import { useState } from "react";

const SavingsGoals = ({ transactions, selectedDate }) => {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("savingsGoals");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", target: "", deadline: "" });

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = income - expenses;

  const handleAddGoal = (e) => {
    e.preventDefault();
    const goal = {
      id: Date.now(),
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      deadline: newGoal.deadline,
      saved: 0,
      createdAt: Date.now()
    };
    
    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    localStorage.setItem("savingsGoals", JSON.stringify(updatedGoals));
    
    setNewGoal({ name: "", target: "", deadline: "" });
    setIsAddingGoal(false);
  };

  const handleDeleteGoal = (id) => {
    if (window.confirm("Eliminar esta meta?")) {
      const updatedGoals = goals.filter(g => g.id !== id);
      setGoals(updatedGoals);
      localStorage.setItem("savingsGoals", JSON.stringify(updatedGoals));
    }
  };

  const handleUpdateSaved = (id, amount) => {
    const updatedGoals = goals.map(g => 
      g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g
    );
    setGoals(updatedGoals);
    localStorage.setItem("savingsGoals", JSON.stringify(updatedGoals));
  };

  const handleCustomAmount = (id) => {
    const amount = prompt("Adicionar valor customizado (€):");
    if (amount && !isNaN(parseFloat(amount))) {
      handleUpdateSaved(id, parseFloat(amount));
    }
  };

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
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Criar Meta
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setIsAddingGoal(false);
                  setNewGoal({ name: "", target: "", deadline: "" });
                }} 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de metas */}
      {goals.length === 0 && !isAddingGoal ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <div className="empty-title">Nenhuma meta definida</div>
          <div className="empty-description">
            Crie metas de poupança para alcançar os seus objetivos
          </div>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => {
            const progress = (goal.saved / goal.target) * 100;
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;
            const isCompleted = goal.saved >= goal.target;

            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <h3 className="goal-name">{goal.name}</h3>
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="goal-delete"
                  >
                    ×
                  </button>
                </div>

                <div className="goal-progress-bar">
                  <div 
                    className="goal-progress-fill"
                    style={{ 
                      width: `${Math.min(progress, 100)}%`,
                      background: isCompleted ? 'var(--success)' : 'var(--burgundy-600)'
                    }}
                  />
                </div>

                <div className="goal-stats">
                  <div>
                    <span className="goal-amount">{goal.saved.toFixed(2)}€</span>
                    <span className="goal-target"> / {goal.target.toFixed(2)}€</span>
                  </div>
                  <div className="goal-percentage">{progress.toFixed(0)}%</div>
                </div>

                <div className="goal-deadline" style={{ 
                  color: isOverdue ? 'var(--error)' : isCompleted ? 'var(--success)' : 'var(--beige-700)' 
                }}>
                  {isCompleted ? '✓ Meta atingida!' : 
                   isOverdue ? `⚠ Prazo expirou` : 
                   `${daysLeft} dias restantes`}
                </div>

                {!isCompleted && (
                  <div className="goal-actions">
                    <button 
                      onClick={() => handleUpdateSaved(goal.id, 10)}
                      className="btn btn-secondary btn-small"
                    >
                      +10€
                    </button>
                    <button 
                      onClick={() => handleUpdateSaved(goal.id, 50)}
                      className="btn btn-secondary btn-small"
                    >
                      +50€
                    </button>
                    <button 
                      onClick={() => handleUpdateSaved(goal.id, 100)}
                      className="btn btn-secondary btn-small"
                    >
                      +100€
                    </button>
                    <button 
                      onClick={() => handleCustomAmount(goal.id)}
                      className="btn btn-primary btn-small"
                    >
                      Outro...
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SavingsGoals;