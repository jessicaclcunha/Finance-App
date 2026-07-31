import { useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

/* ── Gauge de saúde financeira ── */
const FinancialHealthGauge = ({ allTransactions }) => {
  const allTimeInc     = allTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const allTimeExp     = allTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const allTimeBalance = allTimeInc - allTimeExp;
  const savingsRate    = allTimeInc > 0 ? Math.max(0, Math.min(100, (allTimeBalance / allTimeInc) * 100)) : 0;
  const healthScore    = Math.round(savingsRate);

  const getHealth = (s) => {
    if (s >= 30) return { label: "Excelente",  color: "#6B9B6B", desc: "Estás a poupar mais de 30% do que recebes" };
    if (s >= 20) return { label: "Muito Bom",  color: "#8BC48B", desc: "Taxa de poupança saudável acima de 20%" };
    if (s >= 10) return { label: "Bom",        color: "#D4A574", desc: "Estás no caminho certo, podes melhorar" };
    if (s >= 0)  return { label: "Atenção",    color: "#C46B6B", desc: "Taxa de poupança baixa — revê as despesas" };
    return             { label: "Défice",      color: "#8B3D3D", desc: "Estás a gastar mais do que recebes" };
  };

  const health = getHealth(healthScore);
  const cx = 110, cy = 100, r = 80;
  const describeArc = (startPct, endPct) => {
    const toRad = d => (d * Math.PI) / 180;
    const a1 = -180 + (startPct / 100) * 180, a2 = -180 + (endPct / 100) * 180;
    const x1 = cx + r * Math.cos(toRad(a1)), y1 = cy + r * Math.sin(toRad(a1));
    const x2 = cx + r * Math.cos(toRad(a2)), y2 = cy + r * Math.sin(toRad(a2));
    return `M ${x1} ${y1} A ${r} ${r} 0 ${endPct - startPct > 50 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  const toRad = d => (d * Math.PI) / 180;
  const needleAngle = -180 + (Math.min(healthScore, 100) / 100) * 180;
  const nx = cx + 68 * Math.cos(toRad(needleAngle));
  const ny = cy + 68 * Math.sin(toRad(needleAngle));

  return (
    <div style={{ background:"white", border:"1px solid var(--beige-300)", borderRadius:"12px", padding:"20px", marginBottom:"16px" }}>
      <div style={{ fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600, color:"var(--beige-700)", marginBottom:"12px" }}>Saúde Financeira Global</div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
        <svg width="220" height="110" style={{ overflow:"visible" }}>
          <path d={describeArc(0,100)} fill="none" stroke="var(--beige-200)" strokeWidth="16" strokeLinecap="butt"/>
          {[{f:0,t:25,c:"#C07878"},{f:25,t:50,c:"#D4A574"},{f:50,t:75,c:"#8BC48B"},{f:75,t:100,c:"#6B9B6B"}].map((z,i)=>(
            <path key={i} d={describeArc(z.f,z.t)} fill="none" stroke={z.c} strokeWidth="16" strokeLinecap="butt" opacity="0.85"/>
          ))}
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--burgundy-900)" strokeWidth="3" strokeLinecap="round"/>
          <circle cx={cx} cy={cy} r="6" fill="var(--burgundy-900)"/>
          <text x="18"  y="108" fontSize="9" fill="var(--beige-600)" textAnchor="middle">Défice</text>
          <text x="198" y="108" fontSize="9" fill="var(--beige-600)" textAnchor="middle">Excelente</text>
        </svg>
        <div style={{ textAlign:"center", marginTop:"-4px" }}>
          <div style={{ fontFamily:"var(--font-serif)", fontSize:"32px", fontWeight:500, color:health.color, lineHeight:1 }}>{healthScore}%</div>
          <div style={{ fontSize:"13px", fontWeight:700, color:health.color, marginTop:"4px" }}>{health.label}</div>
          <div style={{ fontSize:"12px", color:"var(--beige-600)", marginTop:"4px", maxWidth:"200px" }}>{health.desc}</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"16px", borderTop:"1px solid var(--beige-200)", paddingTop:"14px" }}>
        {[
          { label:"Total recebido",  value:`+${allTimeInc.toFixed(0)}€`,     color:"var(--success)" },
          { label:"Total gasto",     value:`−${allTimeExp.toFixed(0)}€`,     color:"var(--warning)" },
          { label:"Saldo acumulado", value:`${allTimeBalance>=0?"+":""}${allTimeBalance.toFixed(0)}€`, color:allTimeBalance>=0?"var(--success)":"var(--error)" },
        ].map((s,i)=>(
          <div key={i} style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"var(--font-serif)", fontSize:"16px", fontWeight:600, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:"10px", color:"var(--beige-600)", marginTop:"2px", fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Gráfico duplo: barras + linha saldo acumulado ── */
const AnnualChart = ({ monthlyData, selectedYear }) => {
  const today = new Date();
  const lastDataMonth = today.getFullYear() === selectedYear ? today.getMonth() : 11;
  const cumulative = monthlyData.reduce((acc, m, i) => { acc.push((acc[i-1]||0)+m.balance); return acc; }, []);

  const chartData = {
    labels: MONTHS,
    datasets: [
      { type:"bar", label:"Receitas",  data:monthlyData.map((m,i)=>i<=lastDataMonth?m.income:null),   backgroundColor:"rgba(107,155,107,0.7)", borderRadius:4, barPercentage:0.6, categoryPercentage:0.7, yAxisID:"y",  order:2 },
      { type:"bar", label:"Despesas",  data:monthlyData.map((m,i)=>i<=lastDataMonth?m.expenses:null), backgroundColor:"rgba(192,120,120,0.7)", borderRadius:4, barPercentage:0.6, categoryPercentage:0.7, yAxisID:"y",  order:2 },
      { type:"line",label:"Saldo acumulado", data:cumulative.map((v,i)=>i<=lastDataMonth?v:null),
        borderColor:"var(--burgundy-800)", backgroundColor:"transparent", borderWidth:2.5,
        pointRadius:4, pointBackgroundColor:cumulative.map((v,i)=>i>lastDataMonth?"transparent":v>=0?"var(--success)":"var(--error)"),
        pointBorderColor:"white", pointBorderWidth:2, tension:0.35, yAxisID:"y2", order:1 },
    ],
  };
  const opts = {
    responsive:true, maintainAspectRatio:false, interaction:{mode:"index",intersect:false},
    plugins:{
      legend:{position:"top",labels:{font:{size:11},usePointStyle:true,boxWidth:8,padding:16}},
      tooltip:{backgroundColor:"#4A1D1D",padding:10,callbacks:{label:ctx=>`${ctx.dataset.label}: ${ctx.parsed.y!=null?(ctx.parsed.y>=0?"+":"")+ctx.parsed.y.toFixed(0)+"€":"—"}`}},
    },
    scales:{
      x:{grid:{display:false},ticks:{font:{size:11}}},
      y:{position:"left",grid:{color:"var(--beige-200)"},ticks:{callback:v=>`${v}€`,font:{size:10}},title:{display:true,text:"Receitas / Despesas",font:{size:10},color:"var(--beige-600)"}},
      y2:{position:"right",grid:{display:false},ticks:{callback:v=>`${v>=0?"+":""}${v}€`,font:{size:10}},title:{display:true,text:"Saldo acumulado",font:{size:10},color:"var(--beige-600)"}},
    },
  };
  return (
    <div style={{ background:"white", border:"1px solid var(--beige-300)", borderRadius:"12px", padding:"20px 16px 12px", marginBottom:"16px" }}>
      <div style={{ fontSize:"13px", fontWeight:600, color:"var(--burgundy-700)", marginBottom:"4px" }}>Receitas & Despesas — {selectedYear}</div>
      <div style={{ fontSize:"11px", color:"var(--beige-600)", marginBottom:"16px" }}>Barras: valores mensais · Linha: saldo acumulado ao longo do ano</div>
      <div style={{ height:"240px" }}><Bar data={chartData} options={opts}/></div>
    </div>
  );
};

/* ── Taxa de poupança mês a mês ── */
const SavingsRateChart = ({ monthlyData, selectedYear }) => {
  const today = new Date();
  const lastDataMonth = today.getFullYear() === selectedYear ? today.getMonth() : 11;

  const rates = monthlyData.map((m, i) => {
    if (i > lastDataMonth || m.income === 0) return null;
    return parseFloat(((m.balance / m.income) * 100).toFixed(1));
  });

  const chartData = {
    labels: MONTHS,
    datasets: [{
      label: "Taxa de poupança (%)",
      data: rates,
      borderColor: "var(--burgundy-600)",
      backgroundColor: rates.map(v => v === null ? "transparent" : v >= 0 ? "rgba(107,155,107,0.12)" : "rgba(192,120,120,0.12)"),
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: rates.map(v => v === null ? "transparent" : v >= 20 ? "var(--success)" : v >= 0 ? "var(--warning)" : "var(--error)"),
      pointBorderColor: "white",
      pointBorderWidth: 2,
      borderWidth: 2,
    }],
  };

  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor:"#4A1D1D", padding:10, callbacks:{
        label: ctx => ctx.parsed.y != null ? `Taxa de poupança: ${ctx.parsed.y >= 0 ? "+" : ""}${ctx.parsed.y}%` : "Sem dados",
      }},
    },
    scales: {
      x: { grid:{display:false}, ticks:{font:{size:11}} },
      y: {
        grid: { color:"var(--beige-200)" },
        ticks: { callback: v => `${v}%`, font:{size:10} },
        afterDataLimits: axis => { axis.min = Math.min(axis.min, -5); axis.max = Math.max(axis.max, 35); },
      },
    },
    // linha de referência em 20%
  };

  const avgRate = rates.filter(r => r !== null).reduce((s, r, _, a) => s + r / a.length, 0);

  return (
    <div style={{ background:"white", border:"1px solid var(--beige-300)", borderRadius:"12px", padding:"20px 16px 12px", marginBottom:"16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"4px" }}>
        <div style={{ fontSize:"13px", fontWeight:600, color:"var(--burgundy-700)" }}>Taxa de Poupança Mensal</div>
        <div style={{ fontSize:"12px", fontWeight:600, color: avgRate >= 20 ? "var(--success)" : avgRate >= 0 ? "var(--warning)" : "var(--error)" }}>
          Média: {avgRate >= 0 ? "+" : ""}{avgRate.toFixed(0)}%
        </div>
      </div>
      <div style={{ fontSize:"11px", color:"var(--beige-600)", marginBottom:"16px" }}>
        Verde ≥ 20% · Amarelo 0–20% · Vermelho negativo
      </div>
      <div style={{ height:"180px" }}><Line data={chartData} options={opts}/></div>
    </div>
  );
};

/* ── Doughnut despesas por categoria ── */
const CategoryDoughnut = ({ allTransactions, categories, selectedYear }) => {
  const catData = categories
    .filter(c => c.type === "expense" || !c.type || c.type === "both")
    .map(cat => {
      const total = allTransactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedYear && t.type === "expense" && t.categoryId === cat.id;
      }).reduce((s, t) => s + t.amount, 0);
      return { ...cat, total };
    })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);

  if (catData.length === 0) return null;

  const totalExp = catData.reduce((s, c) => s + c.total, 0);

  const chartData = {
    labels: catData.map(c => c.name),
    datasets: [{
      data: catData.map(c => c.total),
      backgroundColor: catData.map(c => c.color),
      borderWidth: 2, borderColor: "#fff", hoverOffset: 8,
    }],
  };

  const opts = {
    responsive: true, maintainAspectRatio: false, cutout: "62%",
    plugins: {
      legend: { position:"bottom", labels:{font:{size:11},usePointStyle:true,padding:12,boxWidth:10} },
      tooltip: { backgroundColor:"#4A1D1D", padding:10, callbacks:{
        label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(0)}€ (${((ctx.parsed/totalExp)*100).toFixed(0)}%)`,
      }},
    },
  };

  return (
    <div style={{ background:"white", border:"1px solid var(--beige-300)", borderRadius:"12px", padding:"20px 16px", marginBottom:"16px" }}>
      <div style={{ fontSize:"13px", fontWeight:600, color:"var(--burgundy-700)", marginBottom:"4px" }}>Despesas por Categoria</div>
      <div style={{ fontSize:"11px", color:"var(--beige-600)", marginBottom:"16px" }}>Distribuição do total gasto em {selectedYear}</div>
      <div style={{ height:"280px" }}><Doughnut data={chartData} options={opts}/></div>
    </div>
  );
};

/* ── Top 5 categorias ── */
const TopCategories = ({ allTransactions, categories, selectedYear }) => {
  const catData = categories
    .filter(c => c.type === "expense" || !c.type || c.type === "both")
    .map(cat => {
      const total = allTransactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedYear && t.type === "expense" && t.categoryId === cat.id;
      }).reduce((s, t) => s + t.amount, 0);
      const count = allTransactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedYear && t.type === "expense" && t.categoryId === cat.id;
      }).length;
      return { ...cat, total, count };
    })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (catData.length === 0) return null;

  const maxTotal = catData[0].total;

  return (
    <div style={{ background:"white", border:"1px solid var(--beige-300)", borderRadius:"12px", padding:"20px", marginBottom:"16px" }}>
      <div style={{ fontSize:"13px", fontWeight:600, color:"var(--burgundy-700)", marginBottom:"4px" }}>Top 5 Categorias</div>
      <div style={{ fontSize:"11px", color:"var(--beige-600)", marginBottom:"16px" }}>Maiores despesas do ano {selectedYear}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {catData.map((cat, i) => (
          <div key={cat.id}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
              <div style={{ fontSize:"11px", fontWeight:700, color:"var(--beige-600)", width:"16px", textAlign:"center" }}>#{i+1}</div>
              <div style={{ fontSize:"20px", width:"28px", height:"28px", background:`${cat.color}20`, borderRadius:"6px", display:"flex", alignItems:"center", justifyContent:"center" }}>{cat.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"13px", fontWeight:500, color:"var(--burgundy-900)" }}>{cat.name}</div>
                <div style={{ fontSize:"11px", color:"var(--beige-600)" }}>{cat.count} transações · {(cat.total/12).toFixed(0)}€/mês</div>
              </div>
              <div style={{ fontFamily:"var(--font-serif)", fontSize:"16px", fontWeight:600, color:"var(--burgundy-900)", whiteSpace:"nowrap" }}>
                {cat.total.toFixed(0)}€
              </div>
            </div>
            <div style={{ height:"6px", background:"var(--beige-200)", borderRadius:"999px", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(cat.total/maxTotal)*100}%`, background:cat.color, borderRadius:"999px", transition:"width 0.7s cubic-bezier(0.34,1.2,0.64,1)" }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Distribuição receitas vs despesas por categoria (barras horizontais) ── */
const CategoryDistributionChart = ({ allTransactions, categories, selectedYear }) => {
  const data = categories
    .filter(c => c.type === "expense" || !c.type || c.type === "both")
    .map(cat => {
      const exp = allTransactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedYear && t.type === "expense" && t.categoryId === cat.id;
      }).reduce((s, t) => s + t.amount, 0);
      return { ...cat, exp };
    })
    .filter(c => c.exp > 0)
    .sort((a, b) => b.exp - a.exp)
    .slice(0, 8);

  if (data.length === 0) return null;

  const totalIncome = allTransactions.filter(t => new Date(t.date).getFullYear() === selectedYear && t.type === "income").reduce((s, t) => s + t.amount, 0);

  const chartData = {
    labels: data.map(c => c.name),
    datasets: [
      {
        label: "Despesa anual",
        data: data.map(c => c.exp),
        backgroundColor: data.map(c => c.color),
        borderRadius: 4,
        barThickness: 16,
      },
      {
        label: "% das receitas",
        data: data.map(c => totalIncome > 0 ? parseFloat(((c.exp / totalIncome) * 100).toFixed(1)) : 0),
        backgroundColor: data.map(c => c.color + "44"),
        borderRadius: 4,
        barThickness: 16,
        yAxisID: "y2",
        xAxisID: "x2",
      },
    ],
  };

  const opts = {
    responsive: true, maintainAspectRatio: false, indexAxis: "y",
    interaction: { mode:"index", intersect:false },
    plugins: {
      legend: { position:"top", labels:{font:{size:11},usePointStyle:true,boxWidth:8,padding:16} },
      tooltip: { backgroundColor:"#4A1D1D", padding:10, callbacks:{
        label: ctx => ctx.datasetIndex === 0
          ? ` Despesa: ${ctx.parsed.x.toFixed(0)}€`
          : ` % receitas: ${ctx.parsed.x.toFixed(1)}%`,
      }},
    },
    scales: {
      x:  { position:"bottom", grid:{color:"var(--beige-200)"}, ticks:{callback:v=>`${v}€`,  font:{size:10}}, title:{display:true,text:"Valor gasto (€)",font:{size:10},color:"var(--beige-600)"} },
      x2: { position:"top",    grid:{display:false},            ticks:{callback:v=>`${v}%`,  font:{size:10}}, title:{display:true,text:"% das receitas",font:{size:10},color:"var(--beige-600)"} },
      y:  { grid:{display:false}, ticks:{font:{size:11}} },
      y2: { display:false },
    },
  };

  return (
    <div style={{ background:"white", border:"1px solid var(--beige-300)", borderRadius:"12px", padding:"20px 16px 12px", marginBottom:"16px" }}>
      <div style={{ fontSize:"13px", fontWeight:600, color:"var(--burgundy-700)", marginBottom:"4px" }}>Distribuição por Categoria</div>
      <div style={{ fontSize:"11px", color:"var(--beige-600)", marginBottom:"16px" }}>Valor gasto e peso nas receitas anuais</div>
      <div style={{ height:`${Math.max(200, data.length * 48)}px` }}><Bar data={chartData} options={opts}/></div>
    </div>
  );
};

/* ── Evolução histórica multi-ano ── */
const MultiYearChart = ({ allTransactions }) => {
  const currentYear = new Date().getFullYear();
  const years = [...new Set(allTransactions.map(t => new Date(t.date).getFullYear()))].sort();
  if (years.length < 2) return null;

  const colors = ["var(--burgundy-600)", "var(--success)", "var(--warning)", "#8B3D3D", "#7FA87F"];

  const datasets = years.map((year, i) => {
    const monthly = MONTHS.map((_, idx) => {
      const tx = allTransactions.filter(t => { const d = new Date(t.date); return d.getMonth()===idx && d.getFullYear()===year; });
      const inc = tx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
      const exp = tx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
      return inc - exp;
    });
    // Para o ano atual, ocultar meses futuros
    const lastMonth = year === currentYear ? new Date().getMonth() : 11;
    return {
      label: String(year),
      data: monthly.map((v, idx) => idx <= lastMonth ? v : null),
      borderColor: colors[i % colors.length],
      backgroundColor: "transparent",
      borderWidth: 2,
      pointRadius: 3,
      pointBorderColor: "white",
      pointBorderWidth: 1.5,
      tension: 0.35,
    };
  });

  const chartData = { labels: MONTHS, datasets };
  const opts = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode:"index", intersect:false },
    plugins: {
      legend: { position:"top", labels:{font:{size:11},usePointStyle:true,boxWidth:8,padding:12} },
      tooltip: { backgroundColor:"#4A1D1D", padding:10, callbacks:{
        label: ctx => ctx.parsed.y != null ? ` ${ctx.dataset.label}: ${ctx.parsed.y>=0?"+":""}${ctx.parsed.y.toFixed(0)}€` : null,
      }},
    },
    scales: {
      x: { grid:{display:false}, ticks:{font:{size:11}} },
      y: { grid:{color:"var(--beige-200)"}, ticks:{callback:v=>`${v>=0?"+":""}${v}€`,font:{size:10}} },
    },
  };

  return (
    <div style={{ background:"white", border:"1px solid var(--beige-300)", borderRadius:"12px", padding:"20px 16px 12px", marginBottom:"16px" }}>
      <div style={{ fontSize:"13px", fontWeight:600, color:"var(--burgundy-700)", marginBottom:"4px" }}>Evolução Histórica — Saldo Mensal</div>
      <div style={{ fontSize:"11px", color:"var(--beige-600)", marginBottom:"16px" }}>Comparação do saldo mensal entre anos</div>
      <div style={{ height:"220px" }}><Line data={chartData} options={opts}/></div>
    </div>
  );
};

/* ── Linha de evolução do saldo (dashboard compact) ── */
const BalanceTrendChart = ({ monthlyData, selectedYear }) => {
  const today = new Date();
  const lastDataMonth = today.getFullYear() === selectedYear ? today.getMonth() : 11;
  const cumulative = monthlyData.reduce((acc, m, i) => { acc.push((acc[i-1]||0)+m.balance); return acc; }, []);
  const visibleData = cumulative.map((v, i) => i <= lastDataMonth ? v : null);
  const isPositive  = (cumulative[lastDataMonth] || 0) >= 0;

  const chartData = {
    labels: MONTHS,
    datasets: [{
      label: "Saldo acumulado",
      data: visibleData,
      borderColor: isPositive ? "var(--success)" : "var(--error)",
      backgroundColor: isPositive ? "rgba(107,155,107,0.08)" : "rgba(192,120,120,0.08)",
      fill: true, tension: 0.4,
      pointRadius: visibleData.map((_, i) => i === lastDataMonth ? 5 : 2),
      pointBackgroundColor: visibleData.map(v => v === null ? "transparent" : v >= 0 ? "var(--success)" : "var(--error)"),
      pointBorderColor: "white", pointBorderWidth: 2, borderWidth: 2.5,
    }],
  };
  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display:false },
      tooltip: { backgroundColor:"#4A1D1D", padding:10, callbacks:{label:ctx=>`Saldo: ${ctx.parsed.y>=0?"+":""}${ctx.parsed.y.toFixed(0)}€`} },
    },
    scales: {
      x: { grid:{display:false}, ticks:{font:{size:10}} },
      y: { grid:{color:"var(--beige-200)"}, ticks:{callback:v=>`${v>=0?"+":""}${v}€`,font:{size:10}} },
    },
  };
  return (
    <div style={{ background:"white", border:"1px solid var(--beige-300)", borderRadius:"12px", padding:"20px 16px 12px" }}>
      <div style={{ fontSize:"13px", fontWeight:600, color:"var(--burgundy-700)", marginBottom:"4px" }}>Evolução do Saldo — {selectedYear}</div>
      <div style={{ fontSize:"11px", color:"var(--beige-600)", marginBottom:"12px" }}>Saldo acumulado mês a mês</div>
      <div style={{ height:"180px" }}><Line data={chartData} options={opts}/></div>
    </div>
  );
};

/* ── Componente principal ── */
const AnnualView = ({ allTransactions, selectedYear, compact = false }) => {
  const monthlyData = MONTHS.map((month, index) => {
    const tx = allTransactions.filter(t => { const d = new Date(t.date); return d.getMonth()===index && d.getFullYear()===selectedYear; });
    const income   = tx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
    const expenses = tx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
    return { month, income, expenses, balance: income-expenses, count: tx.length };
  });

  const yearTotals = {
    income:       monthlyData.reduce((s,m)=>s+m.income,   0),
    expenses:     monthlyData.reduce((s,m)=>s+m.expenses, 0),
    balance:      monthlyData.reduce((s,m)=>s+m.balance,  0),
    transactions: monthlyData.reduce((s,m)=>s+m.count,    0),
  };

  const monthsWithData = monthlyData.filter(m=>m.count>0);
  const bestMonth  = monthsWithData.length>0 ? monthsWithData.reduce((b,c)=>c.balance>b.balance?c:b) : null;
  const worstMonth = monthsWithData.length>0 ? monthsWithData.reduce((w,c)=>c.balance<w.balance?c:w) : null;
  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();

  // categorias necessárias para os gráficos — lidas do localStorage como fallback
  const [categories] = useState(() => {
    try { return JSON.parse(localStorage.getItem("categories")) || []; } catch { return []; }
  });

  const BalanceSection = () => (
    <div style={{ marginBottom:"16px" }}>
      <div className="balance-card-main" style={{
        background: yearTotals.balance>=0 ? "linear-gradient(135deg,rgba(107,155,107,0.15) 0%,white 100%)" : "linear-gradient(135deg,var(--burgundy-100) 0%,white 100%)",
        borderColor: yearTotals.balance>=0 ? "rgba(107,155,107,0.3)" : "var(--burgundy-200)", marginBottom:"12px",
      }}>
        <div className="balance-header">
          <div className="balance-info">
            <div className="balance-label-main" style={{ color:yearTotals.balance>=0?"var(--success)":"var(--burgundy-700)" }}>Saldo Anual</div>
            <div className={`balance-amount-main ${yearTotals.balance>=0?"positive":"negative"}`}>
              {yearTotals.balance>=0?"+":""}{yearTotals.balance.toFixed(2)}€
            </div>
          </div>
        </div>
      </div>
      <div className="stats-compact">
        <div className="stat-compact income">
          <div className="stat-compact-header"><span className="stat-compact-label">Receitas</span></div>
          <div className="stat-compact-value positive">+{yearTotals.income.toFixed(2)}€</div>
          <div className="stat-compact-detail">{yearTotals.transactions} transações</div>
        </div>
        <div className="stat-compact expense">
          <div className="stat-compact-header"><span className="stat-compact-label">Despesas</span></div>
          <div className="stat-compact-value negative">−{yearTotals.expenses.toFixed(2)}€</div>
          <div className="stat-compact-detail">Média {(yearTotals.expenses/12).toFixed(0)}€/mês</div>
        </div>
      </div>
    </div>
  );

  /* ── compact: dashboard ── */
  if (compact) {
    return (
      <section className="section">
        <h2 className="section-title" style={{ marginBottom:"16px" }}>Resumo de {selectedYear}</h2>
        <BalanceSection />
        <BalanceTrendChart monthlyData={monthlyData} selectedYear={selectedYear} />
      </section>
    );
  }

  /* ── full: análise ── */
  return (
    <section className="section">
      <FinancialHealthGauge allTransactions={allTransactions} />
      <BalanceSection />

      {(bestMonth || worstMonth) && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px" }}>
          {bestMonth && (
            <div className="annual-stat-mini">
              <div className="annual-stat-mini-label">Melhor mês</div>
              <div className="annual-stat-mini-value" style={{ color:"var(--success)" }}>{bestMonth.month}</div>
              <div style={{ fontSize:"11px", color:"var(--beige-600)", marginTop:"2px" }}>+{bestMonth.balance.toFixed(0)}€</div>
            </div>
          )}
          {worstMonth && (
            <div className="annual-stat-mini">
              <div className="annual-stat-mini-label">Pior mês</div>
              <div className="annual-stat-mini-value" style={{ color:"var(--error)" }}>{worstMonth.month}</div>
              <div style={{ fontSize:"11px", color:"var(--beige-600)", marginTop:"2px" }}>{worstMonth.balance.toFixed(0)}€</div>
            </div>
          )}
        </div>
      )}

      <AnnualChart        monthlyData={monthlyData}    selectedYear={selectedYear} />
      <SavingsRateChart   monthlyData={monthlyData}    selectedYear={selectedYear} />
      <TopCategories      allTransactions={allTransactions} categories={categories} selectedYear={selectedYear} />
      <CategoryDoughnut   allTransactions={allTransactions} categories={categories} selectedYear={selectedYear} />
      <CategoryDistributionChart allTransactions={allTransactions} categories={categories} selectedYear={selectedYear} />
      <MultiYearChart     allTransactions={allTransactions} />

      <div className="annual-table-container">
        <table className="annual-table">
          <thead>
            <tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Saldo</th><th style={{textAlign:"center"}}>N°</th></tr>
          </thead>
          <tbody>
            {monthlyData.map((data, index) => (
              <tr key={index} className={`${data.count===0?"empty-month":""} ${index===currentMonth&&selectedYear===currentYear?"current-month-row":""}`}>
                <td className="month-name">{data.month}</td>
                <td className="amount-positive">{data.income>0?`+${data.income.toFixed(0)}€`:"—"}</td>
                <td className="amount-negative">{data.expenses>0?`−${data.expenses.toFixed(0)}€`:"—"}</td>
                <td className={data.balance>=0?"amount-positive":"amount-negative"}>
                  <strong>{data.balance!==0?`${data.balance>=0?"+":""}${data.balance.toFixed(0)}€`:"—"}</strong>
                </td>
                <td className="transaction-count">{data.count||"—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td><strong>Total</strong></td>
              <td className="amount-positive"><strong>+{yearTotals.income.toFixed(0)}€</strong></td>
              <td className="amount-negative"><strong>−{yearTotals.expenses.toFixed(0)}€</strong></td>
              <td className={yearTotals.balance>=0?"amount-positive":"amount-negative"}>
                <strong>{yearTotals.balance>=0?"+":""}{yearTotals.balance.toFixed(0)}€</strong>
              </td>
              <td className="transaction-count"><strong>{yearTotals.transactions}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default AnnualView;