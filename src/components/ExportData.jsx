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

  /* ── Importar transações de um ficheiro CSV ──
     Aceita o mesmo formato produzido por "Exportar CSV":
     Data,Descrição,Tipo,Categoria,Valor
     31/12/2025,Supermercado,Despesa,Alimentação,45.30

     Também aceita ficheiros de outras origens desde que sigam
     estas 5 colunas, com data em dd/mm/aaaa ou aaaa-mm-dd,
     tipo "Receita"/"Despesa" (ou "income"/"expense"), e valor
     com ponto ou vírgula decimal. */
  const parseCSVLine = (line) => {
    // Suporta campos entre aspas com vírgulas dentro (ex: "Renda, Casa")
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map(v => v.trim());
  };

  const parseCSVDate = (raw) => {
    if (!raw) return null;
    // dd/mm/aaaa (formato pt-PT usado na exportação)
    const ptMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ptMatch) {
      const [, day, month, year] = ptMatch;
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return isNaN(d.getTime()) ? null : d;
    }
    // aaaa-mm-dd (ISO) ou outros formatos que o Date consiga interpretar
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };

  const parseCSVAmount = (raw) => {
    if (!raw) return NaN;
    // aceita "45.30" ou "45,30"
    const normalized = raw.replace(/\s/g, "").replace(",", ".");
    return parseFloat(normalized);
  };

  const parseCSVType = (raw) => {
    const v = (raw || "").trim().toLowerCase();
    if (v === "receita" || v === "income") return "income";
    if (v === "despesa" || v === "expense") return "expense";
    return null;
  };

  const importFromCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          alert("O ficheiro CSV não tem transações para importar.");
          e.target.value = "";
          return;
        }

        // Ignora a linha de cabeçalho
        const dataLines = lines.slice(1);
        const parsedRows = [];
        const errors = [];

        dataLines.forEach((line, idx) => {
          const cols = parseCSVLine(line);
          const [dateRaw, description, typeRaw, categoryName, amountRaw] = cols;

          const date = parseCSVDate(dateRaw);
          const type = parseCSVType(typeRaw);
          const amount = parseCSVAmount(amountRaw);

          if (!date || !type || isNaN(amount) || amount <= 0) {
            errors.push(idx + 2); // +2: conta com o cabeçalho e índice 0-based
            return;
          }

          const category = type === "expense"
            ? categories.find(c => c.name.toLowerCase() === (categoryName || "").trim().toLowerCase())
            : null;

          parsedRows.push({
            user_id: user.id,
            category_id: category ? category.id : null,
            description: description?.trim() || (type === "income" ? "Receita" : "Despesa"),
            amount,
            type,
            date: date.toISOString(),
            is_recurring: false,
            recurring_key: null,
            recurring_id: null,
          });
        });

        if (parsedRows.length === 0) {
          alert("Não foi possível ler nenhuma transação válida do ficheiro.");
          e.target.value = "";
          return;
        }

        const confirmMsg = errors.length > 0
          ? `Foram encontradas ${parsedRows.length} transações válidas (${errors.length} linha(s) inválida(s) serão ignoradas: ${errors.join(", ")}). Importar?`
          : `Foram encontradas ${parsedRows.length} transações. Importar?`;

        if (!window.confirm(confirmMsg)) { e.target.value = ""; return; }

        const { error } = await supabase.from("transactions").insert(parsedRows);

        if (error) {
          console.error(error);
          alert("Erro ao importar as transações.");
          e.target.value = "";
          return;
        }

        alert(`${parsedRows.length} transação(ões) importada(s) com sucesso! A página será recarregada.`);
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Erro ao ler o ficheiro CSV. Verifica se o formato está correto.");
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="export-section">
      <h3 className="section-title" style={{ marginBottom: '20px' }}>Exportar & Backup</h3>
      <div className="export-grid">

        {/* ── Cartão 1: Transações (CSV) ── */}
        <div className="export-card">
          <h4 className="export-title">Transações (CSV)</h4>
          <p className="export-description">
            Exporta para Excel/Sheets ou importa transações a partir de um ficheiro CSV
          </p>
          <div className="export-actions">
            <button onClick={exportToCSV} className="btn btn-primary btn-small">
              Exportar CSV
            </button>
            <label className="btn btn-secondary btn-small" style={{ cursor: 'pointer' }}>
              Importar CSV
              <input type="file" accept=".csv,text/csv" onChange={importFromCSV} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* ── Cartão 2: Backup Completo (JSON) ── */}
        <div className="export-card">
          <h4 className="export-title">Backup Completo (JSON)</h4>
          <p className="export-description">
            Exporta os teus dados, cria um backup completo (inclui metas e recorrências) ou restaura um anterior
          </p>
          <div className="export-actions">
            <button onClick={exportToJSON} className="btn btn-secondary btn-small">
              Exportar JSON
            </button>
            <button onClick={createBackup} className="btn btn-success btn-small">
              Criar Backup
            </button>
            <label className="btn btn-secondary btn-small" style={{ cursor: 'pointer' }}>
              Restaurar
              <input type="file" accept=".json" onChange={restoreBackup} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

      </div>
      <div className="card" style={{ marginTop: '24px', background: 'var(--warning-light)' }}>
        <p style={{ fontSize: '13px', color: 'var(--burgundy-900)' }}>
          ⚠️ <strong>Importante:</strong> Ao importar ou restaurar, os dados são <em>adicionados</em> aos atuais (não substituem). Elimina manualmente duplicados se necessário. Na importação de CSV, categorias sem correspondência exata pelo nome ficam como "Sem categoria".
        </p>
      </div>
    </div>
  );
};

export default ExportData;