import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const ExportData = ({ transactions, categories }) => {
  const { user } = useAuth();

  const exportToCSV = () => {
    const headers = ["Data", "Descrição", "Tipo", "Categoria", "Valor"];
    const rows = transactions.map(t => {
      const category = categories.find(c => c.id === t.categoryId);
      return [
        new Date(t.date).toLocaleDateString('pt-PT'),
        t.description,
        t.type === "income" ? "Receita" : "Despesa",
        category?.name || "Sem categoria",
        t.amount.toFixed(2)
      ];
    });
    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `financas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      transactions, categories,
      stats: {
        totalTransactions: transactions.length,
        totalIncome: transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        totalExpenses: transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `financas_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const createBackup = async () => {
    const [{ data: goals }, { data: recurring }] = await Promise.all([
      supabase.from("savings_goals").select("*").eq("user_id", user.id),
      supabase.from("recurring_transactions").select("*").eq("user_id", user.id),
    ]);

    const backup = {
      version: "2.0", exportDate: new Date().toISOString(),
      transactions, categories, savingsGoals: goals || [], recurringTransactions: recurring || [],
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `backup_financas_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const restoreBackup = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const backup = JSON.parse(event.target.result);
      if (!window.confirm("Isto vai adicionar os dados do backup à tua conta atual. Continuar?")) return;

      const categoryIdMap = {};

      if (backup.categories?.length) {
        const { data: insertedCategories, error: catError } = await supabase
          .from("categories")
          .insert(backup.categories.map(({ id, ...c }) => ({ ...c, user_id: user.id })))
          .select();

        if (catError) {
          console.error(catError);
          alert("Erro ao restaurar categorias.");
          return;
        }

        backup.categories.forEach(oldCat => {
          const match = insertedCategories.find(
            newCat => newCat.name === oldCat.name && newCat.type === (oldCat.type || "expense")
          );
          if (match) categoryIdMap[oldCat.id] = match.id;
        });
      }

      if (backup.transactions?.length) {
        const { error: txError } = await supabase.from("transactions").insert(
          backup.transactions.map(({ id, categoryId, isRecurring, recurringKey, ...t }) => ({
            ...t,
            category_id: categoryId != null ? (categoryIdMap[categoryId] ?? null) : null,
            is_recurring: isRecurring ?? false,
            recurring_key: recurringKey ?? null,
            date: new Date(t.date).toISOString(),
            user_id: user.id,
          }))
        );
        if (txError) {
          console.error(txError);
          alert("Erro ao restaurar transações.");
          return;
        }
      }

      if (backup.savingsGoals?.length) {
        const { error: goalsError } = await supabase.from("savings_goals").insert(
          backup.savingsGoals.map(({ id, createdAt, ...g }) => ({ ...g, user_id: user.id }))
        );
        if (goalsError) {
          console.error(goalsError);
          alert("Erro ao restaurar metas.");
          return;
        }
      }

      if (backup.recurringTransactions?.length) {
        const { error: recError } = await supabase.from("recurring_transactions").insert(
          backup.recurringTransactions.map(({ id, categoryId, dayOfMonth, ...r }) => ({
            ...r,
            category_id: categoryId != null ? (categoryIdMap[categoryId] ?? null) : null,
            day_of_month: dayOfMonth,
            user_id: user.id,
          }))
        );
        if (recError) {
          console.error(recError);
          alert("Erro ao restaurar transações recorrentes.");
          return;
        }
      }

      alert("Backup restaurado com sucesso! A página será recarregada.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Erro ao restaurar backup. Ficheiro inválido.");
    }
  };
  reader.readAsText(file);
};
  return (
    <div className="export-section">
      <h3 className="section-title" style={{ marginBottom: '20px' }}>Exportar & Backup</h3>
      <div className="export-grid">
        <div className="export-card">
          <h4 className="export-title">Exportar CSV</h4>
          <p className="export-description">Tabela para Excel ou Google Sheets</p>
          <button onClick={exportToCSV} className="btn btn-primary btn-small">Descarregar CSV</button>
        </div>
        <div className="export-card">
          <h4 className="export-title">Exportar JSON</h4>
          <p className="export-description">Dados em formato estruturado</p>
          <button onClick={exportToJSON} className="btn btn-secondary btn-small">Descarregar JSON</button>
        </div>
        <div className="export-card">
          <h4 className="export-title">Criar Backup</h4>
          <p className="export-description">Backup completo de todos os dados</p>
          <button onClick={createBackup} className="btn btn-success btn-small">Criar Backup</button>
        </div>
        <div className="export-card">
          <h4 className="export-title">Restaurar Backup</h4>
          <p className="export-description">Importar backup anterior</p>
          <label className="btn btn-secondary btn-small" style={{ cursor: 'pointer' }}>
            Escolher Ficheiro
            <input type="file" accept=".json" onChange={restoreBackup} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
      <div className="card" style={{ marginTop: '24px', background: 'var(--warning-light)' }}>
        <p style={{ fontSize: '13px', color: 'var(--burgundy-900)' }}>
          ⚠️ <strong>Importante:</strong> Ao restaurar, os dados do backup são <em>adicionados</em> aos atuais (não substituem). Elimina manualmente duplicados se necessário.
        </p>
      </div>
    </div>
  );
};

export default ExportData;