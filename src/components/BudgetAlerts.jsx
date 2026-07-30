import { useCurrency } from "../contexts/CurrencyContext";

const BudgetAlerts = ({ transactions, categories }) => {
  const { formatCurrency } = useCurrency();

  const expenseCategories = categories.filter(
    cat => (cat.type === "expense" || !cat.type || cat.type === "both") && cat.budget > 0
  );

  if (expenseCategories.length === 0) return null;

  const categoryData = expenseCategories.map(cat => {
    const spent = transactions
      .filter(t => t.type === "expense" && t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const pct = Math.min((spent / cat.budget) * 100, 100);
    const remaining = cat.budget - spent;
    const isOver = spent > cat.budget;
    const isWarning = pct >= 80 && !isOver;

    return { ...cat, spent, pct, remaining, isOver, isWarning };
  });

  // Só mostra categorias com algum gasto ou próximas do limite
  const relevant = categoryData.filter(c => c.spent > 0 || c.pct >= 50);
  if (relevant.length === 0) return null;

  const getBarColor = (c) => {
    if (c.isOver) return "var(--error)";
    if (c.isWarning) return "var(--warning)";
    return c.color;
  };

  const alerts = relevant.filter(c => c.isOver || c.isWarning);

  return (
    <div className="card" style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 className="section-title" style={{ margin: 0 }}>Orçamentos</h3>
        {alerts.length > 0 && (
          <span style={{
            fontSize: "12px",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "20px",
            background: alerts.some(a => a.isOver) ? "var(--burgundy-100)" : "var(--warning-light)",
            color: alerts.some(a => a.isOver) ? "var(--error)" : "var(--burgundy-700)",
          }}>
            {alerts.filter(a => a.isOver).length > 0
              ? `${alerts.filter(a => a.isOver).length} excedido${alerts.filter(a => a.isOver).length > 1 ? "s" : ""}`
              : `${alerts.length} próximo${alerts.length > 1 ? "s" : ""} do limite`}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {relevant.map(cat => (
          <div key={cat.id}>
            {/* Header da categoria */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  fontSize: "18px",
                  width: "28px",
                  height: "28px",
                  background: `${cat.color}20`,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {cat.icon}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--burgundy-900)" }}>
                  {cat.name}
                </span>
                {cat.isOver && (
                  <span style={{ fontSize: "11px", color: "var(--error)", fontWeight: 600 }}>
                    ⚠ Excedido
                  </span>
                )}
                {cat.isWarning && (
                  <span style={{ fontSize: "11px", color: "var(--warning)", fontWeight: 600 }}>
                    ⚠ Quase no limite
                  </span>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{
                  fontSize: "13px",
                  fontFamily: "var(--font-serif)",
                  fontWeight: 500,
                  color: cat.isOver ? "var(--error)" : "var(--burgundy-900)",
                }}>
                  {formatCurrency(cat.spent, { decimals: 0 })}
                </span>
                <span style={{ fontSize: "12px", color: "var(--beige-600)" }}>
                  /{formatCurrency(cat.budget, { decimals: 0 })}
                </span>
              </div>
            </div>

            {/* Barra de progresso */}
            <div style={{
              height: "8px",
              background: "var(--beige-200)",
              borderRadius: "999px",
              overflow: "hidden",
              position: "relative",
            }}>
              <div style={{
                height: "100%",
                width: `${cat.pct}%`,
                background: getBarColor(cat),
                borderRadius: "999px",
                transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }} />
            </div>

            {/* Legenda inferior */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--beige-600)" }}>
                {cat.pct.toFixed(0)}% usado
              </span>
              <span style={{
                fontSize: "11px",
                color: cat.isOver ? "var(--error)" : "var(--beige-600)",
                fontWeight: cat.isOver ? 600 : 400,
              }}>
                {cat.isOver
                  ? `${formatCurrency(Math.abs(cat.remaining), { decimals: 0 })} excedido`
                  : `${formatCurrency(cat.remaining, { decimals: 0 })} restante`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetAlerts;