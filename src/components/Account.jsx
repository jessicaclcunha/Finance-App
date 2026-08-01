import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import useGamification from "../hooks/useGamification";
import { useCurrency } from "../contexts/CurrencyContext";
import { CURRENCIES } from "../lib/currency";
import GamificationPanel, { AchievementsGrid } from "./GamificationPanel";

/* ── Mensagens simpáticas ao sair — mudam consoante a hora, só por diversão ── */
const getSignOutMessage = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "A esta hora? Descansa bem 🌙";
  if (hour < 12) return "Já vais? Bom dia de poupanças 👋";
  if (hour < 20) return "Volta sempre que quiseres ver as tuas contas 🌿";
  return "Boa noite! As tuas finanças ficam guardadas até amanhã 🌙";
};

/* ── Popover de confirmação de logout ── */
const SignOutConfirm = ({ onConfirm, onCancel }) => (
  <div className="signout-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
    <div className="signout-popover fade-in">
      <div className="signout-icon">👋</div>
      <p className="signout-message">{getSignOutMessage()}</p>
      <p className="signout-submessage">Tens a certeza que queres terminar a sessão?</p>
      <div className="signout-actions">
        <button onClick={onCancel} className="btn btn-secondary btn-small" style={{ flex: 1 }}>
          Ficar
        </button>
        <button onClick={onConfirm} className="btn btn-primary btn-small" style={{ flex: 1 }}>
          Sair
        </button>
      </div>
    </div>
  </div>
);

/*
  stats (opcional) — passa de App.jsx algo como:
  { transactionsCount, categoriesCount, memberSince }
  transactions / categories — passa também de App.jsx; usados para calcular
  streak, score e conquistas através do useGamification.
*/
const Account = ({ user, onSignOut, stats, transactions = [], categories = [] }) => {
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const { currency, setCurrency, symbol, formatCurrency } = useCurrency();

  /* ── Nome editável ── */
  const displayName = (user?.user_metadata?.full_name || "").trim();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  const handleStartEditName = () => {
    setNameInput(displayName);
    setNameError("");
    setIsEditingName(true);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) { setNameError("O nome não pode ficar vazio"); return; }
    setSavingName(true); setNameError("");
    const { error } = await supabase.auth.updateUser({ data: { full_name: nameInput.trim() } });
    setSavingName(false);
    if (error) { setNameError("Não foi possível guardar. Tenta novamente."); return; }
    setIsEditingName(false);
  };

  /* ── Metas de poupança (para as estatísticas e gamificação) ── */
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setGoals([]); setGoalsLoading(false); return; }
    setGoalsLoading(true);
    supabase.from("savings_goals").select("*").eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!error) {
          setGoals((data || []).map(g => ({
            id: g.id, name: g.name, target: Number(g.target), saved: Number(g.saved), deadline: g.deadline,
          })));
        }
        setGoalsLoading(false);
      });
  }, [user]);

  const now = new Date();
  const selectedDate = { month: now.getMonth(), year: now.getFullYear() };
  const { streak, achievements, score } = useGamification(transactions, categories, goals, selectedDate, symbol);

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const completedGoals = goals.filter(g => g.saved >= g.target).length;

  /* ── Preferências de notificação (guardadas no user_metadata do Supabase) ── */
  const [weeklyDigest, setWeeklyDigest] = useState(user?.user_metadata?.pref_weekly_digest ?? true);
  const [budgetAlerts, setBudgetAlerts] = useState(user?.user_metadata?.pref_budget_alerts ?? true);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const savePreferences = async (updates) => {
    setPrefsSaved(false);
    const { error } = await supabase.auth.updateUser({ data: updates });
    if (!error) { setPrefsSaved(true); setTimeout(() => setPrefsSaved(false), 2000); }
  };

  const handleCurrencyChange = async (code) => {
    await setCurrency(code);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2000);
  };

  const handleToggleDigest = () => {
    const next = !weeklyDigest;
    setWeeklyDigest(next);
    savePreferences({ pref_weekly_digest: next });
  };

  const handleToggleBudgetAlerts = () => {
    const next = !budgetAlerts;
    setBudgetAlerts(next);
    savePreferences({ pref_budget_alerts: next });
  };

  const email = user?.email ?? "";
  const initials = displayName ? displayName[0].toUpperCase() : email ? email[0].toUpperCase() : "?";

  const memberSince = stats?.memberSince || user?.created_at
    ? new Date(stats?.memberSince || user.created_at).toLocaleDateString("pt-PT", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const emailConfirmed = Boolean(user?.email_confirmed_at || user?.confirmed_at);

  return (
    <section className="section">
      <h2 className="section-title" style={{ marginBottom: "20px" }}>Minha Conta</h2>

      <div className="card account-profile-card">
        <div className="account-avatar">{initials}</div>
        <div className="account-info" style={{ flex: 1, minWidth: 0 }}>
          {!isEditingName ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "17px", fontWeight: 500, color: "var(--burgundy-900)" }}>
                {displayName || "Sem nome definido"}
              </div>
              <button onClick={handleStartEditName} title="Editar nome" style={{
                background: "none", border: "none", cursor: "pointer", fontSize: "14px",
                color: "var(--beige-600)", padding: "2px 4px", borderRadius: "4px",
              }}>
                ✎
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveName} style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="form-input"
                style={{ maxWidth: "220px", minHeight: "38px", padding: "8px 12px" }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-small" disabled={savingName}>
                {savingName ? "..." : "Guardar"}
              </button>
              <button type="button" onClick={() => setIsEditingName(false)} className="btn btn-secondary btn-small">
                Cancelar
              </button>
            </form>
          )}
          {nameError && <p style={{ fontSize: "12px", color: "var(--error)", marginTop: "4px" }}>{nameError}</p>}
          <div className="account-email" style={{ marginTop: "4px" }}>{email}</div>
          {memberSince && (
            <div className="account-member-since">Conta criada a {memberSince}</div>
          )}
        </div>
      </div>

      {!emailConfirmed && (
        <div className="card" style={{ marginTop: "12px", background: "var(--warning-light)", borderColor: "var(--warning)" }}>
          <p style={{ fontSize: "13px", color: "var(--burgundy-900)" }}>
            ✉️ <strong>Email por confirmar.</strong> Verifica a tua caixa de entrada e clica no link de confirmação.
          </p>
        </div>
      )}

      {/* Estatísticas base */}
      <div className="stats-compact" style={{ marginTop: "16px" }}>
        {typeof stats?.transactionsCount === "number" && (
          <div className="stat-compact">
            <div className="stat-compact-header"><span className="stat-compact-label">Transações</span></div>
            <div className="stat-compact-value">{stats.transactionsCount}</div>
            <div className="stat-compact-detail">registadas no total</div>
          </div>
        )}
        {typeof stats?.categoriesCount === "number" && (
          <div className="stat-compact">
            <div className="stat-compact-header"><span className="stat-compact-label">Categorias</span></div>
            <div className="stat-compact-value">{stats.categoriesCount}</div>
            <div className="stat-compact-detail">criadas por ti</div>
          </div>
        )}
        <div className="stat-compact">
          <div className="stat-compact-header"><span className="stat-compact-label">Streak atual</span></div>
          <div className="stat-compact-value">{streak} {streak === 1 ? "dia" : "dias"}</div>
          <div className="stat-compact-detail">a registar sem parar</div>
        </div>
        <div className="stat-compact">
          <div className="stat-compact-header"><span className="stat-compact-label">Score do mês</span></div>
          <div className="stat-compact-value positive">{score}/100</div>
          <div className="stat-compact-detail">saúde financeira</div>
        </div>
      </div>

      {/* Estatísticas de metas de poupança */}
      {!goalsLoading && goals.length > 0 && (
        <div className="stats-compact" style={{ marginTop: "12px" }}>
          <div className="stat-compact">
            <div className="stat-compact-header"><span className="stat-compact-label">Poupança total</span></div>
            <div className="stat-compact-value positive">{formatCurrency(totalSaved, { decimals: 0 })}</div>
            <div className="stat-compact-detail">em {goals.length} meta{goals.length > 1 ? "s" : ""}</div>
          </div>
          <div className="stat-compact">
            <div className="stat-compact-header"><span className="stat-compact-label">Metas concluídas</span></div>
            <div className="stat-compact-value">{completedGoals}/{goals.length}</div>
            <div className="stat-compact-detail">
              {totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(0)}% do objetivo total` : "\u00A0"}
            </div>
          </div>
        </div>
      )}

      {/* Conquistas */}
      <div className="card" style={{ marginTop: "16px" }}>
        <AchievementsGrid achievements={achievements} />
      </div>

      {/* Preferências */}
      <div className="card" style={{ marginTop: "16px" }}>
        <h3 className="section-title" style={{ fontSize: "16px", marginBottom: "4px" }}>Preferências</h3>
        <p style={{ fontSize: "12px", color: "var(--beige-600)", marginBottom: "16px" }}>
          Ficam guardadas na tua conta.
        </p>

        <div className="form-group">
          <label className="form-label">Moeda</label>
          <select
            value={currency}
            onChange={e => handleCurrencyChange(e.target.value)}
            className="form-select"
            style={{ maxWidth: "280px" }}
          >
            {Object.entries(CURRENCIES).map(([code, c]) => <option key={code} value={code}>{c.label}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "6px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--burgundy-900)", cursor: "pointer" }}>
            <input type="checkbox" checked={weeklyDigest} onChange={handleToggleDigest} className="form-checkbox"/>
            Resumo semanal por email
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--burgundy-900)", cursor: "pointer" }}>
            <input type="checkbox" checked={budgetAlerts} onChange={handleToggleBudgetAlerts} className="form-checkbox"/>
            Avisar quando exceder orçamento
          </label>
        </div>

        {prefsSaved && <p style={{ fontSize: "12px", color: "var(--success)", marginTop: "10px" }}>✓ Preferências guardadas</p>}
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <h3 className="section-title" style={{ fontSize: "16px", marginBottom: "12px" }}>Sessão</h3>
        <p style={{ fontSize: "13px", color: "var(--beige-700)", marginBottom: "16px" }}>
          Termina a sessão neste dispositivo. Os teus dados continuam guardados de forma segura.
        </p>
        <button
          onClick={() => setConfirmingSignOut(true)}
          className="btn btn-secondary"
          style={{ color: "var(--error)", borderColor: "var(--error)" }}
        >
          Terminar Sessão
        </button>
      </div>

      {confirmingSignOut && (
        <SignOutConfirm
          onConfirm={onSignOut}
          onCancel={() => setConfirmingSignOut(false)}
        />
      )}
    </section>
  );
};

export default Account;