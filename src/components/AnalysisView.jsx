import { useState, useEffect, useRef } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

/* ─── Helpers ─── */
const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const getMonthTx = (tx, month, year) =>
  tx.filter(t => { const d = new Date(t.date); return d.getMonth()===month && d.getFullYear()===year; });

/* ─── Cartão de stat simples ─── */
const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background:"white", border:"1px solid var(--beige-300)", borderRadius:"10px",
    padding:"14px 16px", display:"flex", flexDirection:"column", gap:"4px",
    borderLeft: color ? `3px solid ${color}` : undefined,
  }}>
    <div style={{fontFamily:"var(--font-serif)", fontSize:"22px", fontWeight:500, color:"var(--burgundy-900)"}}>{value}</div>
    {sub && <div style={{fontSize:"11px", color:"var(--beige-600)"}}>{sub}</div>}
  </div>
);

/* ─── Comparação por categoria ─── */
const CategoryComparison = ({ transactions, categories, selectedDate }) => {
  const { month, year } = selectedDate;
  const prevMonth = month===0?11:month-1;
  const prevYear  = month===0?year-1:year;

  const curr = getMonthTx(transactions, month, year);
  const prev = getMonthTx(transactions, prevMonth, prevYear);

  const data = categories
    .filter(c => c.type==="expense" || !c.type || c.type==="both")
    .map(cat => {
      const currAmt = curr.filter(t=>t.type==="expense"&&t.categoryId===cat.id).reduce((s,t)=>s+t.amount,0);
      const prevAmt = prev.filter(t=>t.type==="expense"&&t.categoryId===cat.id).reduce((s,t)=>s+t.amount,0);
      const delta = prevAmt>0 ? ((currAmt-prevAmt)/prevAmt)*100 : null;
      return { ...cat, currAmt, prevAmt, delta };
    })
    .filter(c => c.currAmt>0 || c.prevAmt>0)
    .sort((a,b)=>b.currAmt-a.currAmt);

  if (data.length===0) return (
    <div style={{textAlign:"center",padding:"32px",color:"var(--beige-600)"}}>
      Sem dados para comparar
    </div>
  );

  const chartData = {
    labels: data.map(c=>`${c.name}`),
    datasets:[
      { label:"Este mês", data:data.map(c=>c.currAmt), backgroundColor:data.map(c=>c.color), borderRadius:5, barThickness:16 },
      { label:"Mês anterior", data:data.map(c=>c.prevAmt), backgroundColor:data.map(c=>c.color+"55"), borderRadius:5, barThickness:16 },
    ]
  };

  const opts = {
    responsive:true, maintainAspectRatio:false, indexAxis:"y",
    plugins:{ legend:{position:"top", labels:{font:{size:11},usePointStyle:true}},
      tooltip:{ callbacks:{ label: ctx=>`${ctx.dataset.label}: ${ctx.parsed.x.toFixed(2)}€` }}},
    scales:{
      x:{ grid:{color:"var(--beige-200)"}, ticks:{callback:v=>`${v}€`, font:{size:11}} },
      y:{ grid:{display:false}, ticks:{font:{size:11}} }
    }
  };

  return (
    <div>
      {/* Barras horizontais */}
      <div style={{height:`${Math.max(180, data.length*52)}px`, marginBottom:"20px"}}>
        <Bar data={chartData} options={opts}/>
      </div>

      {/* Lista com deltas */}
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {data.map(cat=>(
          <div key={cat.id} style={{
            display:"flex",alignItems:"center",gap:"10px",
            padding:"10px 12px", background:"var(--beige-50)",
            border:"1px solid var(--beige-200)", borderRadius:"8px",
          }}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:"13px",fontWeight:500,color:"var(--burgundy-900)"}}>{cat.name}</div>
              <div style={{fontSize:"11px",color:"var(--beige-600)"}}>
                Anterior: {cat.prevAmt>0?`${cat.prevAmt.toFixed(0)}€`:"—"}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:"16px",fontWeight:500,color:"var(--burgundy-900)"}}>
                {cat.currAmt.toFixed(0)}€
              </div>
              {cat.delta!==null && (
                <div style={{
                  fontSize:"11px",fontWeight:600,
                  color: cat.delta>10?"var(--error)":cat.delta<-10?"var(--success)":"var(--beige-700)"
                }}>
                  {cat.delta>0?"+":""}{cat.delta.toFixed(0)}%
                  {cat.delta>10?" ↑":cat.delta<-10?" ↓":" →"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Previsão fim do mês ─── */
const ForecastSection = ({ transactions, selectedDate }) => {
  const { month, year } = selectedDate;
  const today = new Date();
  const isCurrentMonth = today.getMonth()===month && today.getFullYear()===year;

  const monthTx = getMonthTx(transactions, month, year);
  const daysInMonth = new Date(year,month+1,0).getDate();
  const daysPassed  = isCurrentMonth ? today.getDate() : daysInMonth;
  const daysLeft    = daysInMonth - daysPassed;

  const income   = monthTx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses = monthTx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const dailyAvg = daysPassed>0 ? expenses/daysPassed : 0;
  const projected = expenses + dailyAvg*daysLeft;
  const projBalance = income - projected;

  // Histórico diário acumulado para o gráfico
  const dailyExp = Array.from({length:daysInMonth},(_,i)=>{
    const day = i+1;
    return monthTx
      .filter(t=>t.type==="expense"&&new Date(t.date).getDate()===day)
      .reduce((s,t)=>s+t.amount,0);
  });

  const cumulative = dailyExp.reduce((acc,v,i)=>{
    acc.push((acc[i-1]||0)+v); return acc;
  },[]);

  // Linha de projeção (só a partir de hoje)
  const projLine = Array.from({length:daysInMonth},(_,i)=>{
    if(i<daysPassed-1) return null;
    if(i===daysPassed-1) return cumulative[i];
    return cumulative[daysPassed-1] + dailyAvg*(i-daysPassed+1);
  });

  const labels = Array.from({length:daysInMonth},(_,i)=>i+1);

  const chartData = {
    labels,
    datasets:[
      {
        label:"Gastos reais",
        data: cumulative.map((v,i)=>i<daysPassed?v:null),
        borderColor:"var(--burgundy-600)", backgroundColor:"rgba(168,82,82,0.08)",
        fill:true, tension:0.3, pointRadius:2, borderWidth:2,
      },
      {
        label:"Projeção",
        data: projLine,
        borderColor:"var(--beige-500)", backgroundColor:"transparent",
        borderDash:[5,4], tension:0.3, pointRadius:0, borderWidth:2,
      }
    ]
  };

  const opts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{position:"top",labels:{font:{size:11},usePointStyle:true}},
      tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: ${(ctx.parsed.y||0).toFixed(2)}€`}}},
    scales:{
      x:{ grid:{display:false}, ticks:{font:{size:10}, maxTicksLimit:10} },
      y:{ grid:{color:"var(--beige-200)"}, ticks:{callback:v=>`${v}€`,font:{size:11}} }
    }
  };

  return (
    <div>
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"10px",marginBottom:"20px"}}>
        <StatCard label="Gasto até hoje" value={`${expenses.toFixed(0)}€`}
          sub={`${dailyAvg.toFixed(1)}€/dia`} color="var(--warning)"/>
        <StatCard label="Projeção fim do mês" value={`${projected.toFixed(0)}€`}
          sub={isCurrentMonth?`${daysLeft} dias restantes`:"Mês encerrado"} color="var(--beige-500)"/>
        <StatCard label="Receitas" value={`+${income.toFixed(0)}€`}
          color="var(--success)"/>
        <StatCard label="Saldo previsto" value={`${projBalance>=0?"+":""}${projBalance.toFixed(0)}€`}
          color={projBalance>=0?"var(--success)":"var(--error)"}/>
      </div>

      <div style={{height:"220px"}}>
        <Line data={chartData} options={opts}/>
      </div>

      {!isCurrentMonth && (
        <p style={{fontSize:"12px",color:"var(--beige-600)",textAlign:"center",marginTop:"8px"}}>
          Mês encerrado — a projeção não se aplica
        </p>
      )}
    </div>
  );
};

/* ─── Padrões de gasto ─── */
const PatternsSection = ({ transactions, selectedDate }) => {
  const { month, year } = selectedDate;
  const monthTx = getMonthTx(transactions, month, year)
    .filter(t=>t.type==="expense");

  // Por dia da semana
  const byWeekday = Array(7).fill(0);
  const byWeekdayCount = Array(7).fill(0);
  monthTx.forEach(t=>{
    const wd = new Date(t.date).getDay();
    byWeekday[wd]+=t.amount;
    byWeekdayCount[wd]++;
  });
  const avgByWeekday = byWeekday.map((v,i)=>byWeekdayCount[i]>0?v/byWeekdayCount[i]:0);

  // Por semana do mês
  const byWeek = [0,0,0,0,0];
  monthTx.forEach(t=>{
    const w = Math.floor((new Date(t.date).getDate()-1)/7);
    byWeek[w]+=t.amount;
  });

  const maxWd = Math.max(...avgByWeekday,1);
  const maxWk = Math.max(...byWeek,1);

  const topWeekday = avgByWeekday.indexOf(Math.max(...avgByWeekday));
  const topWeek    = byWeek.indexOf(Math.max(...byWeek));

  const weekdayColors = ["#C46B6B","#A85252","#D4A574","#7FA87F","#8A7866","#8B3D3D","#6B9B6B"];

  if (monthTx.length===0) return (
    <div style={{textAlign:"center",padding:"32px",color:"var(--beige-600)"}}>
      Sem despesas neste mês para analisar padrões
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>

      {/* Insights rápidos */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
        <div style={{
          background:"var(--warning-light)",border:"1px solid rgba(212,165,116,0.3)",
          borderRadius:"10px",padding:"12px",textAlign:"center"
        }}>
          <div style={{fontSize:"11px",color:"var(--beige-700)",fontWeight:600,marginBottom:"4px"}}>Dia mais caro</div>
          <div style={{fontFamily:"var(--font-serif)",fontSize:"20px",color:"var(--burgundy-900)"}}>{WEEKDAYS[topWeekday]}</div>
          <div style={{fontSize:"11px",color:"var(--beige-600)"}}>{avgByWeekday[topWeekday].toFixed(0)}€ em média</div>
        </div>
        <div style={{
          background:"var(--burgundy-100)",border:"1px solid var(--burgundy-200)",
          borderRadius:"10px",padding:"12px",textAlign:"center"
        }}>
          <div style={{fontSize:"11px",color:"var(--beige-700)",fontWeight:600,marginBottom:"4px"}}>Semana mais cara</div>
          <div style={{fontFamily:"var(--font-serif)",fontSize:"20px",color:"var(--burgundy-900)"}}>{topWeek+1}ª semana</div>
          <div style={{fontSize:"11px",color:"var(--beige-600)"}}>{byWeek[topWeek].toFixed(0)}€ gastos</div>
        </div>
      </div>

      {/* Gasto médio por dia da semana */}
      <div>
        <div style={{fontSize:"13px",fontWeight:600,color:"var(--burgundy-700)",marginBottom:"12px"}}>
          Gasto médio por dia da semana
        </div>
        <div style={{display:"flex",gap:"6px",alignItems:"flex-end",height:"80px"}}>
          {WEEKDAYS.map((d,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",height:"100%",justifyContent:"flex-end"}}>
              <div style={{
                width:"100%",borderRadius:"4px 4px 0 0",
                height:`${(avgByWeekday[i]/maxWd)*68}px`,
                background: i===topWeekday ? "var(--burgundy-600)" : weekdayColors[i]+"99",
                minHeight: avgByWeekday[i]>0?"3px":"0",
                transition:"height 0.6s cubic-bezier(0.34,1.2,0.64,1)",
              }}/>
              <div style={{fontSize:"10px",color: i===topWeekday?"var(--burgundy-700)":"var(--beige-600)",fontWeight: i===topWeekday?700:400}}>
                {d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gasto por semana do mês */}
      <div>
        <div style={{fontSize:"13px",fontWeight:600,color:"var(--burgundy-700)",marginBottom:"12px"}}>
          Gasto por semana do mês
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {byWeek.map((v,i)=>v>0?(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{fontSize:"12px",color:"var(--beige-700)",width:"60px",flexShrink:0}}>
                {i+1}ª sem.
              </div>
              <div style={{flex:1,height:"8px",background:"var(--beige-200)",borderRadius:"999px",overflow:"hidden"}}>
                <div style={{
                  height:"100%",width:`${(v/maxWk)*100}%`,
                  background: i===topWeek?"var(--burgundy-600)":"var(--burgundy-400)",
                  borderRadius:"999px",
                  transition:"width 0.7s cubic-bezier(0.34,1.2,0.64,1)",
                }}/>
              </div>
              <div style={{fontSize:"12px",fontFamily:"var(--font-serif)",color:"var(--burgundy-900)",width:"52px",textAlign:"right"}}>
                {v.toFixed(0)}€
              </div>
            </div>
          ):null)}
        </div>
      </div>
    </div>
  );
};

/* ─── Vista anual melhorada ─── */
const AnnualAnalysis = ({ transactions, selectedYear, categories }) => {
  const monthlyData = MONTHS.map((m,i)=>{
    const tx = transactions.filter(t=>{
      const d=new Date(t.date);
      return d.getMonth()===i && d.getFullYear()===selectedYear;
    });
    const inc = tx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
    const exp = tx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
    return { month:m, inc, exp, balance:inc-exp, count:tx.length };
  });

  const totals = {
    inc: monthlyData.reduce((s,m)=>s+m.inc,0),
    exp: monthlyData.reduce((s,m)=>s+m.exp,0),
    balance: monthlyData.reduce((s,m)=>s+m.balance,0),
    tx: monthlyData.reduce((s,m)=>s+m.count,0),
  };

  const monthsWithData = monthlyData.filter(m=>m.count>0);
  const savingsRate = totals.inc>0 ? (totals.balance/totals.inc)*100 : 0;
  const positiveMonths = monthlyData.filter(m=>m.balance>0).length;
  const bestMonth = monthsWithData.length>0
    ? monthsWithData.reduce((b,c)=>c.balance>b.balance?c:b) : null;
  const worstMonth = monthsWithData.length>0
    ? monthsWithData.reduce((w,c)=>c.balance<w.balance?c:w) : null;

  // Gráfico linha receitas vs despesas
  const lineData = {
    labels: MONTHS,
    datasets:[
      { label:"Receitas", data:monthlyData.map(m=>m.inc),
        borderColor:"#6B9B6B", backgroundColor:"rgba(107,155,107,0.08)",
        fill:true, tension:0.4, pointRadius:3, borderWidth:2 },
      { label:"Despesas", data:monthlyData.map(m=>m.exp),
        borderColor:"#A85252", backgroundColor:"rgba(168,82,82,0.08)",
        fill:true, tension:0.4, pointRadius:3, borderWidth:2 },
    ]
  };

  // Gráfico barras saldo
  const balanceData = {
    labels: MONTHS,
    datasets:[{
      label:"Saldo",
      data: monthlyData.map(m=>m.balance),
      backgroundColor: monthlyData.map(m=>m.balance>=0?"rgba(107,155,107,0.8)":"rgba(192,120,120,0.8)"),
      borderRadius:4, barThickness:18,
    }]
  };

  // Doughnut por categoria (ano inteiro)
  const catData = categories
    .filter(c=>c.type==="expense"||!c.type||c.type==="both")
    .map(cat=>{
      const total = transactions
        .filter(t=>{const d=new Date(t.date);return d.getFullYear()===selectedYear&&t.type==="expense"&&t.categoryId===cat.id;})
        .reduce((s,t)=>s+t.amount,0);
      return {...cat, total};
    }).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);

  const doughnutData = {
    labels: catData.map(c=>`${c.name}`),
    datasets:[{
      data: catData.map(c=>c.total),
      backgroundColor: catData.map(c=>c.color),
      borderWidth:2, borderColor:"#fff", hoverOffset:8,
    }]
  };

  const baseOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{position:"top",labels:{font:{size:11},usePointStyle:true,boxWidth:8}},
      tooltip:{backgroundColor:"#4A1D1D",padding:10,
        callbacks:{label:ctx=>`${ctx.dataset?.label||ctx.label}: ${(ctx.parsed?.y??ctx.parsed).toFixed(0)}€`}}
    },
    scales:{
      x:{grid:{display:false},ticks:{font:{size:10}}},
      y:{grid:{color:"var(--beige-200)"},ticks:{callback:v=>`${v}€`,font:{size:10}}}
    }
  };

  const doughnutOpts = {
    responsive:true, maintainAspectRatio:false, cutout:"60%",
    plugins:{
      legend:{position:"bottom",labels:{font:{size:11},usePointStyle:true,padding:12}},
      tooltip:{backgroundColor:"#4A1D1D",padding:10,
        callbacks:{label:ctx=>{
          const total=ctx.dataset.data.reduce((a,b)=>a+b,0);
          return ` ${ctx.label}: ${ctx.parsed.toFixed(0)}€ (${((ctx.parsed/total)*100).toFixed(0)}%)`;
        }}}
    }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>

      {/* KPIs anuais */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"10px"}}>
        <StatCard label="Saldo anual" value={`${totals.balance>=0?"+":""}${totals.balance.toFixed(0)}€`}
          color={totals.balance>=0?"var(--success)":"var(--error)"}/>
        <StatCard label="Taxa de poupança" value={`${savingsRate.toFixed(0)}%`}
          sub={`${totals.inc.toFixed(0)}€ receitas`} color="var(--warning)"/>
        <StatCard label="Meses positivos" value={`${positiveMonths}/12`}
          color="var(--success)"/>
        <StatCard label="Total transações" value={totals.tx}
          sub={`~${(totals.tx/12).toFixed(0)}/mês`} color="var(--beige-500)"/>
      </div>

      {bestMonth && worstMonth && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
          <div style={{background:"rgba(107,155,107,0.08)",border:"1px solid rgba(107,155,107,0.2)",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
            <div style={{fontSize:"10px",color:"var(--beige-700)",fontWeight:600,marginBottom:"4px"}}>🏆 MELHOR MÊS</div>
            <div style={{fontFamily:"var(--font-serif)",fontSize:"18px",color:"var(--success)"}}>{bestMonth.month}</div>
            <div style={{fontSize:"12px",color:"var(--beige-600)"}}>+{bestMonth.balance.toFixed(0)}€</div>
          </div>
          <div style={{background:"var(--burgundy-100)",border:"1px solid var(--burgundy-200)",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
            <div style={{fontSize:"10px",color:"var(--beige-700)",fontWeight:600,marginBottom:"4px"}}>⚠️ PIOR MÊS</div>
            <div style={{fontFamily:"var(--font-serif)",fontSize:"18px",color:"var(--error)"}}>{worstMonth.month}</div>
            <div style={{fontSize:"12px",color:"var(--beige-600)"}}>{worstMonth.balance.toFixed(0)}€</div>
          </div>
        </div>
      )}

      {/* Linha receitas vs despesas */}
      <div>
        <div style={{fontSize:"13px",fontWeight:600,color:"var(--burgundy-700)",marginBottom:"12px"}}>
          Receitas vs Despesas
        </div>
        <div style={{height:"200px"}}>
          <Line data={lineData} options={{...baseOpts}}/>
        </div>
      </div>

      {/* Barras saldo mensal */}
      <div>
        <div style={{fontSize:"13px",fontWeight:600,color:"var(--burgundy-700)",marginBottom:"12px"}}>
          Saldo por Mês
        </div>
        <div style={{height:"160px"}}>
          <Bar data={balanceData} options={{
            ...baseOpts,
            plugins:{...baseOpts.plugins,legend:{display:false}},
          }}/>
        </div>
      </div>

      {/* Doughnut categorias */}
      {catData.length>0 && (
        <div>
          <div style={{fontSize:"13px",fontWeight:600,color:"var(--burgundy-700)",marginBottom:"12px"}}>
            Despesas por Categoria (ano completo)
          </div>
          <div style={{height:"280px"}}>
            <Doughnut data={doughnutData} options={doughnutOpts}/>
          </div>
        </div>
      )}

      {/* Tabela mensal */}
      <div style={{background:"white",border:"1px solid var(--beige-300)",borderRadius:"10px",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"var(--beige-100)"}}>
              {["Mês","Receitas","Despesas","Saldo","Nº"].map(h=>(
                <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:"10px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",color:"var(--burgundy-900)",borderBottom:"2px solid var(--beige-300)"}}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((m,i)=>(
              <tr key={i} style={{background: new Date().getMonth()===i&&new Date().getFullYear()===selectedYear?"var(--beige-50)":"white", opacity:m.count===0?0.4:1}}>
                <td style={{padding:"7px 10px",fontSize:"12px",fontWeight:500,color:"var(--burgundy-900)"}}>{m.month}</td>
                <td style={{padding:"7px 10px",fontSize:"12px",fontFamily:"var(--font-serif)",color:"var(--success)"}}>{m.inc>0?`+${m.inc.toFixed(0)}€`:"—"}</td>
                <td style={{padding:"7px 10px",fontSize:"12px",fontFamily:"var(--font-serif)",color:"var(--warning)"}}>{m.exp>0?`−${m.exp.toFixed(0)}€`:"—"}</td>
                <td style={{padding:"7px 10px",fontSize:"12px",fontFamily:"var(--font-serif)",fontWeight:600,color:m.balance>0?"var(--success)":m.balance<0?"var(--error)":"var(--beige-600)"}}>
                  {m.balance!==0?`${m.balance>0?"+":""}${m.balance.toFixed(0)}€`:"—"}
                </td>
                <td style={{padding:"7px 10px",fontSize:"12px",color:"var(--beige-700)",textAlign:"center"}}>{m.count||"—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{borderTop:"2px solid var(--beige-300)",background:"var(--beige-100)"}}>
              <td style={{padding:"8px 10px",fontSize:"12px",fontWeight:700}}>Total</td>
              <td style={{padding:"8px 10px",fontSize:"12px",fontFamily:"var(--font-serif)",fontWeight:700,color:"var(--success)"}}>+{totals.inc.toFixed(0)}€</td>
              <td style={{padding:"8px 10px",fontSize:"12px",fontFamily:"var(--font-serif)",fontWeight:700,color:"var(--warning)"}}>−{totals.exp.toFixed(0)}€</td>
              <td style={{padding:"8px 10px",fontSize:"12px",fontFamily:"var(--font-serif)",fontWeight:700,color:totals.balance>=0?"var(--success)":"var(--error)"}}>
                {totals.balance>=0?"+":""}{totals.balance.toFixed(0)}€
              </td>
              <td style={{padding:"8px 10px",fontSize:"12px",fontWeight:700,textAlign:"center",color:"var(--beige-700)"}}>{totals.tx}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

/* ─── Componente principal ─── */
const AnalysisView = ({ transactions, categories, selectedDate, onDateChange, viewMode, onViewModeChange }) => {
  const [tab, setTab] = useState("forecast");

  const tabs = [
    { id:"forecast",    label:"Previsão"},
    { id:"categories",  label:"Categorias"},
    { id:"patterns",    label:"Padrões"},
  ];

  const isAnnual = viewMode==="year";

  return (
    <section className="section">
      <h2 className="section-title" style={{marginBottom:"16px"}}>Análise</h2>

      {/* Toggle mensal/anual */}
      <div className="view-mode-toggle" style={{marginBottom:"16px"}}>
        <button onClick={()=>onViewModeChange("month")} className={viewMode==="month"?"view-btn active":"view-btn"}>Mensal</button>
        <button onClick={()=>onViewModeChange("year")}  className={viewMode==="year" ?"view-btn active":"view-btn"}>Anual</button>
      </div>

      {isAnnual ? (
        <AnnualAnalysis
          transactions={transactions}
          selectedYear={selectedDate.year}
          categories={categories}
        />
      ) : (
        <>
          {/* Tabs mensais */}
          <div style={{
            display:"flex",gap:"4px",background:"var(--beige-100)",
            padding:"4px",borderRadius:"8px",marginBottom:"20px",
          }}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                flex:1, padding:"9px 4px",
                fontSize:"12px", fontWeight:tab===t.id?600:500,
                color:tab===t.id?"var(--burgundy-900)":"var(--beige-700)",
                background:tab===t.id?"white":"transparent",
                border:"none",borderRadius:"6px",cursor:"pointer",
                boxShadow:tab===t.id?"var(--shadow-sm)":"none",
                transition:"all 0.2s",
                display:"flex",alignItems:"center",justifyContent:"center",gap:"5px",
              }}>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="card">
            {tab==="forecast"   && <ForecastSection   transactions={transactions} selectedDate={selectedDate}/>}
            {tab==="categories" && <CategoryComparison transactions={transactions} categories={categories} selectedDate={selectedDate}/>}
            {tab==="patterns"   && <PatternsSection    transactions={transactions} selectedDate={selectedDate}/>}
          </div>
        </>
      )}
    </section>
  );
};

export default AnalysisView;