import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Tooltip, Legend, Filler
} from "chart.js";
import AnnualView from "./AnnualView";
import { useCurrency } from "../contexts/CurrencyContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const getMonthTx = (tx, month, year) =>
  tx.filter(t => { const d = new Date(t.date); return d.getMonth()===month && d.getFullYear()===year; });

/* ── Previsão fim do mês ── */
const ForecastSection = ({ transactions, selectedDate }) => {
  const { formatCurrency } = useCurrency();
  const { month, year } = selectedDate;
  const today = new Date();
  const isCurrentMonth = today.getMonth()===month && today.getFullYear()===year;
  const monthTx    = getMonthTx(transactions, month, year);
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const daysPassed  = isCurrentMonth ? today.getDate() : daysInMonth;
  const daysLeft    = daysInMonth - daysPassed;
  const income      = monthTx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount, 0);
  const expenses    = monthTx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount, 0);
  const dailyAvg    = daysPassed > 0 ? expenses / daysPassed : 0;
  const projected   = expenses + dailyAvg * daysLeft;
  const projBalance = income - projected;

  const dailyExp = Array.from({length:daysInMonth}, (_,i) =>
    monthTx.filter(t=>t.type==="expense"&&new Date(t.date).getDate()===i+1).reduce((s,t)=>s+t.amount,0)
  );
  const cumulative = dailyExp.reduce((acc,v,i) => { acc.push((acc[i-1]||0)+v); return acc; }, []);
  const projLine   = Array.from({length:daysInMonth}, (_,i) => {
    if (i < daysPassed-1) return null;
    if (i === daysPassed-1) return cumulative[i];
    return cumulative[daysPassed-1] + dailyAvg*(i-daysPassed+1);
  });

  const chartData = {
    labels: Array.from({length:daysInMonth},(_,i)=>i+1),
    datasets:[
      { label:"Gastos reais", data:cumulative.map((v,i)=>i<daysPassed?v:null), borderColor:"var(--burgundy-600)", backgroundColor:"rgba(168,82,82,0.08)", fill:true, tension:0.3, pointRadius:2, borderWidth:2 },
      { label:"Projeção",     data:projLine, borderColor:"var(--beige-500)", backgroundColor:"transparent", borderDash:[5,4], tension:0.3, pointRadius:0, borderWidth:2 },
    ],
  };
  const opts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{position:"top",labels:{font:{size:11},usePointStyle:true}}, tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y||0,{decimals:2})}`}} },
    scales:{ x:{grid:{display:false},ticks:{font:{size:10},maxTicksLimit:10}}, y:{grid:{color:"var(--beige-200)"},ticks:{callback:v=>formatCurrency(v,{decimals:0}),font:{size:11}}} },
  };

  return (
    <div>
      {/* Cards padronizados — usa as classes existentes stat-compact */}
      <div className="stats-compact" style={{ marginBottom:"16px" }}>
        <div className="stat-compact">
          <div className="stat-compact-header"><span className="stat-compact-label">Gasto até hoje</span></div>
          <div className="stat-compact-value negative">{formatCurrency(expenses,{decimals:0})}</div>
          <div className="stat-compact-detail">{dailyAvg.toFixed(1)}/dia</div>
        </div>
        <div className="stat-compact">
          <div className="stat-compact-header"><span className="stat-compact-label">Projeção fim do mês</span></div>
          <div className="stat-compact-value">{formatCurrency(projected,{decimals:0})}</div>
          <div className="stat-compact-detail">{isCurrentMonth ? `${daysLeft} dias restantes` : "Mês encerrado"}</div>
        </div>
      </div>
      <div className="stats-compact" style={{ marginBottom:"20px" }}>
        <div className="stat-compact">
          <div className="stat-compact-header"><span className="stat-compact-label">Receitas</span></div>
          <div className="stat-compact-value positive">{formatCurrency(income,{decimals:0,showSign:true})}</div>
          <div className="stat-compact-detail">&nbsp;</div>
        </div>
        <div className="stat-compact">
          <div className="stat-compact-header"><span className="stat-compact-label">Saldo previsto</span></div>
          <div className={`stat-compact-value ${projBalance >= 0 ? "positive" : "negative"}`}>
            {formatCurrency(projBalance,{decimals:0,showSign:true})}
          </div>
          <div className="stat-compact-detail">&nbsp;</div>
        </div>
      </div>
      <div style={{height:"220px"}}><Line data={chartData} options={opts}/></div>
      {!isCurrentMonth && (
        <p style={{fontSize:"12px",color:"var(--beige-600)",textAlign:"center",marginTop:"8px"}}>
          Mês encerrado — a projeção não se aplica
        </p>
      )}
    </div>
  );
};

/* ── Comparação por categoria ── */
const CategoryComparison = ({ transactions, categories, selectedDate }) => {
  const { formatCurrency } = useCurrency();
  const { month, year } = selectedDate;
  const curr = getMonthTx(transactions, month, year);
  const prev = getMonthTx(transactions, month===0?11:month-1, month===0?year-1:year);

  const data = categories
    .filter(c => c.type==="expense"||!c.type||c.type==="both")
    .map(cat => {
      const currAmt = curr.filter(t=>t.type==="expense"&&t.categoryId===cat.id).reduce((s,t)=>s+t.amount,0);
      const prevAmt = prev.filter(t=>t.type==="expense"&&t.categoryId===cat.id).reduce((s,t)=>s+t.amount,0);
      const delta   = prevAmt > 0 ? ((currAmt-prevAmt)/prevAmt)*100 : null;
      return {...cat, currAmt, prevAmt, delta};
    })
    .filter(c => c.currAmt>0||c.prevAmt>0)
    .sort((a,b) => b.currAmt-a.currAmt);

  if (data.length===0) return <div style={{textAlign:"center",padding:"32px",color:"var(--beige-600)"}}>Sem dados para comparar</div>;

  const chartData = {
    labels: data.map(c=>c.name),
    datasets:[
      { label:"Este mês",    data:data.map(c=>c.currAmt), backgroundColor:data.map(c=>c.color),       borderRadius:5, barThickness:16 },
      { label:"Mês anterior",data:data.map(c=>c.prevAmt), backgroundColor:data.map(c=>c.color+"55"), borderRadius:5, barThickness:16 },
    ],
  };
  const opts = {
    responsive:true, maintainAspectRatio:false, indexAxis:"y",
    plugins:{ legend:{position:"top",labels:{font:{size:11},usePointStyle:true}}, tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: ${formatCurrency(ctx.parsed.x,{decimals:2})}`}} },
    scales:{ x:{grid:{color:"var(--beige-200)"},ticks:{callback:v=>formatCurrency(v,{decimals:0}),font:{size:11}}}, y:{grid:{display:false},ticks:{font:{size:11}}} },
  };

  return (
    <div>
      <div style={{height:`${Math.max(180,data.length*52)}px`,marginBottom:"20px"}}><Bar data={chartData} options={opts}/></div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {data.map(cat=>(
          <div key={cat.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",background:"var(--beige-50)",border:"1px solid var(--beige-200)",borderRadius:"8px"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:"13px",fontWeight:500,color:"var(--burgundy-900)"}}>{cat.name}</div>
              <div style={{fontSize:"11px",color:"var(--beige-600)"}}>Anterior: {cat.prevAmt>0?formatCurrency(cat.prevAmt,{decimals:0}):"—"}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:"16px",fontWeight:500,color:"var(--burgundy-900)"}}>{formatCurrency(cat.currAmt,{decimals:0})}</div>
              {cat.delta!==null && (
                <div style={{fontSize:"11px",fontWeight:600,color:cat.delta>10?"var(--error)":cat.delta<-10?"var(--success)":"var(--beige-700)"}}>
                  {cat.delta>0?"+":""}{cat.delta.toFixed(0)}%{cat.delta>10?" ↑":cat.delta<-10?" ↓":" →"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Padrões de gasto ── */
const PatternsSection = ({ transactions, selectedDate }) => {
  const { formatCurrency } = useCurrency();
  const { month, year } = selectedDate;
  const monthTx = getMonthTx(transactions, month, year).filter(t=>t.type==="expense");
  const byWeekday = Array(7).fill(0), byWeekdayCount = Array(7).fill(0);
  monthTx.forEach(t=>{ const wd=new Date(t.date).getDay(); byWeekday[wd]+=t.amount; byWeekdayCount[wd]++; });
  const avgByWeekday = byWeekday.map((v,i) => byWeekdayCount[i]>0 ? v/byWeekdayCount[i] : 0);
  const byWeek = [0,0,0,0,0];
  monthTx.forEach(t=>{ byWeek[Math.floor((new Date(t.date).getDate()-1)/7)]+=t.amount; });
  const maxWd      = Math.max(...avgByWeekday, 1);
  const topWeekday = avgByWeekday.indexOf(Math.max(...avgByWeekday));
  const topWeek    = byWeek.indexOf(Math.max(...byWeek));
  const colors     = ["#C46B6B","#A85252","#D4A574","#7FA87F","#8A7866","#8B3D3D","#6B9B6B"];

  if (monthTx.length===0) return <div style={{textAlign:"center",padding:"32px",color:"var(--beige-600)"}}>Sem despesas neste mês para analisar padrões</div>;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
      <div className="stats-compact">
        <div className="stat-compact">
          <div className="stat-compact-header"><span className="stat-compact-label">Dia mais caro</span></div>
          <div className="stat-compact-value">{WEEKDAYS[topWeekday]}</div>
          <div className="stat-compact-detail">{formatCurrency(avgByWeekday[topWeekday],{decimals:0})} em média</div>
        </div>
        <div className="stat-compact">
          <div className="stat-compact-header"><span className="stat-compact-label">Semana mais cara</span></div>
          <div className="stat-compact-value">{topWeek+1}ª semana</div>
          <div className="stat-compact-detail">{formatCurrency(byWeek[topWeek],{decimals:0})} gastos</div>
        </div>
      </div>
      <div>
        <div style={{fontSize:"13px",fontWeight:600,color:"var(--burgundy-700)",marginBottom:"12px"}}>Gasto médio por dia da semana</div>
        <div style={{display:"flex",gap:"6px",alignItems:"flex-end",height:"80px"}}>
          {WEEKDAYS.map((d,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",height:"100%",justifyContent:"flex-end"}}>
              <div style={{width:"100%",borderRadius:"4px 4px 0 0",height:`${(avgByWeekday[i]/maxWd)*68}px`,background:i===topWeekday?"var(--burgundy-600)":colors[i]+"99",minHeight:avgByWeekday[i]>0?"3px":"0",transition:"height 0.6s cubic-bezier(0.34,1.2,0.64,1)"}}/>
              <div style={{fontSize:"10px",color:i===topWeekday?"var(--burgundy-700)":"var(--beige-600)",fontWeight:i===topWeekday?700:400}}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Componente principal ── */
const AnalysisView = ({ transactions, categories, selectedDate, onDateChange, viewMode, onViewModeChange }) => {
  const [tab, setTab] = useState("forecast");
  const isAnnual = viewMode === "year";

  const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const handlePrev = () => isAnnual
    ? onDateChange({...selectedDate, year: selectedDate.year-1})
    : onDateChange({ month: selectedDate.month===0?11:selectedDate.month-1, year: selectedDate.month===0?selectedDate.year-1:selectedDate.year });

  const handleNext = () => isAnnual
    ? onDateChange({...selectedDate, year: selectedDate.year+1})
    : onDateChange({ month: selectedDate.month===11?0:selectedDate.month+1, year: selectedDate.month===11?selectedDate.year+1:selectedDate.year });

  const isCurrentPeriod = () => {
    const now = new Date();
    if (isAnnual) return selectedDate.year === now.getFullYear();
    return selectedDate.month === now.getMonth() && selectedDate.year === now.getFullYear();
  };

  const tabs = [
    { id:"forecast",   label:"Previsão"   },
    { id:"categories", label:"Categorias" },
    { id:"patterns",   label:"Padrões"    },
  ];

  return (
    <section className="section">
      <h2 className="section-title" style={{ marginBottom:"16px" }}>Análise</h2>

      {/* Navegação — idêntica à MonthPicker da dashboard */}
      <div className="month-picker-container">
        <div className="view-mode-toggle">
          <button onClick={()=>onViewModeChange("month")} className={viewMode==="month"?"view-btn active":"view-btn"}>Mensal</button>
          <button onClick={()=>onViewModeChange("year")}  className={viewMode==="year" ?"view-btn active":"view-btn"}>Anual</button>
        </div>
        <div className="date-navigation">
          <button onClick={handlePrev} className="nav-arrow">←</button>
          <div className="date-display">
            {isAnnual ? (
              <><div className="year-name">{selectedDate.year}</div><div className="year-label">Ano completo</div></>
            ) : (
              <><div className="month-name">{months[selectedDate.month]}</div><div className="year-label">{selectedDate.year}</div></>
            )}
          </div>
          <button onClick={handleNext} className="nav-arrow">→</button>
        </div>
        {!isCurrentPeriod() && (
          <button
            onClick={() => { const n=new Date(); onDateChange({month:n.getMonth(),year:n.getFullYear()}); }}
            className="btn btn-secondary btn-small"
            style={{ width:"100%", marginTop:"12px" }}
          >
            Voltar ao {isAnnual ? "ano" : "mês"} atual
          </button>
        )}
      </div>

      {isAnnual ? (
        <AnnualView allTransactions={transactions} selectedYear={selectedDate.year} compact={false} />
      ) : (
        <>
          <div style={{display:"flex",gap:"4px",background:"var(--beige-100)",padding:"4px",borderRadius:"8px",marginBottom:"20px",marginTop:"16px"}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                flex:1, padding:"9px 4px", fontSize:"12px",
                fontWeight: tab===t.id ? 600 : 500,
                color:      tab===t.id ? "var(--burgundy-900)" : "var(--beige-700)",
                background: tab===t.id ? "white" : "transparent",
                border:"none", borderRadius:"6px", cursor:"pointer",
                boxShadow: tab===t.id ? "var(--shadow-sm)" : "none",
                transition:"all 0.2s",
              }}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="card">
            {tab==="forecast"   && <ForecastSection    transactions={transactions} selectedDate={selectedDate}/>}
            {tab==="categories" && <CategoryComparison transactions={transactions} categories={categories} selectedDate={selectedDate}/>}
            {tab==="patterns"   && <PatternsSection    transactions={transactions} selectedDate={selectedDate}/>}
          </div>
        </>
      )}
    </section>
  );
};

export default AnalysisView;