const ExportData = ({ transactions, categories }) => {
  
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
  
      const csv = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
  
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `financas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    const exportToJSON = () => {
      const data = {
        exportDate: new Date().toISOString(),
        transactions,
        categories,
        stats: {
          totalTransactions: transactions.length,
          totalIncome: transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
          totalExpenses: transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
        }
      };
  
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `financas_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    const createBackup = () => {
      const backup = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        transactions: localStorage.getItem("transactions"),
        categories: localStorage.getItem("categories"),
        savingsGoals: localStorage.getItem("savingsGoals"),
        recurringTransactions: localStorage.getItem("recurringTransactions"),
        tags: localStorage.getItem("tags")
      };
  
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `backup_financas_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    const restoreBackup = (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const backup = JSON.parse(event.target.result);
          
          if (window.confirm("Isto vai substituir todos os dados atuais. Continuar?")) {
            if (backup.transactions) localStorage.setItem("transactions", backup.transactions);
            if (backup.categories) localStorage.setItem("categories", backup.categories);
            if (backup.savingsGoals) localStorage.setItem("savingsGoals", backup.savingsGoals);
            if (backup.recurringTransactions) localStorage.setItem("recurringTransactions", backup.recurringTransactions);
            if (backup.tags) localStorage.setItem("tags", backup.tags);
            
            alert("Backup restaurado com sucesso! A página será recarregada.");
            window.location.reload();
          }
        } catch (error) {
          alert("Erro ao restaurar backup. Ficheiro inválido.");
        }
      };
      reader.readAsText(file);
    };
  
    return (
      <div className="export-section">
        <h3 className="section-title" style={{ marginBottom: '20px' }}>
          Exportar & Backup
        </h3>
  
        <div className="export-grid">
          <div className="export-card">
            <h4 className="export-title">Exportar CSV</h4>
            <p className="export-description">
              Tabela para Excel ou Google Sheets
            </p>
            <button onClick={exportToCSV} className="btn btn-primary btn-small">
              Descarregar CSV
            </button>
          </div>

          <div className="export-card">
            <h4 className="export-title">Criar Backup</h4>
            <p className="export-description">
              Backup completo de todos os dados
            </p>
            <button onClick={createBackup} className="btn btn-success btn-small">
              Criar Backup
            </button>
          </div>
  
          <div className="export-card">
            <h4 className="export-title">Restaurar Backup</h4>
            <p className="export-description">
              Importar backup anterior
            </p>
            <label className="btn btn-secondary btn-small" style={{ cursor: 'pointer' }}>
              Escolher Ficheiro
              <input
                type="file"
                accept=".json"
                onChange={restoreBackup}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
  
        <div className="card" style={{ marginTop: '24px', background: 'var(--warning-light)' }}>
          <p style={{ fontSize: '13px', color: 'var(--burgundy-900)' }}>
            ⚠️ <strong>Importante:</strong> Crie backups regulares dos seus dados. 
            Ao restaurar um backup, todos os dados atuais serão substituídos.
          </p>
        </div>
      </div>
    );
  };
  
  export default ExportData;