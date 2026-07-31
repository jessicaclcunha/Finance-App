import { useMemo } from "react";

export const ACHIEVEMENTS = [
  { id:"first_transaction", icon:"🌱", title:"Primeiro Passo",        description:"Registou a primeira transação",               check:(tx)=>tx.length>=1 },
  { id:"ten_transactions",  icon:"📊", title:"Em Ritmo",              description:"10 transações registadas",                    check:(tx)=>tx.length>=10 },
  { id:"fifty_transactions",icon:"🏃", title:"Consistente",           description:"50 transações registadas",                    check:(tx)=>tx.length>=50 },
  { id:"first_positive_month",icon:"✨",title:"Mês Verde",            description:"Primeiro mês com saldo positivo",             check:(tx)=>hasPositiveMonth(tx) },
  { id:"three_positive_months",icon:"🌿",title:"Tendência Positiva",  description:"3 meses consecutivos positivos",              check:(tx)=>countConsecutivePositiveMonths(tx)>=3 },
  { id:"saved_500",         icon:"💰", title:"Poupador",              description:"Poupou 500€ num mês",                         check:(tx)=>hasMonthlySaving(tx,500) },
  { id:"saved_1000",        icon:"💎", title:"Milhar",                description:"Poupou 1000€ num mês",                        check:(tx)=>hasMonthlySaving(tx,1000) },
  { id:"first_goal",        icon:"🎯", title:"Com Objetivos",         description:"Criou a primeira meta de poupança",           check:(_,__,g)=>g.length>=1 },
  { id:"goal_completed",    icon:"🏆", title:"Meta Atingida",         description:"Completou uma meta de poupança",              check:(_,__,g)=>g.some(x=>x.saved>=x.target) },
  { id:"goal_exceeded",     icon:"🚀", title:"Além da Meta",          description:"Poupou mais do que o objetivo numa meta",     check:(_,__,g)=>g.some(x=>x.saved>x.target) },
  { id:"budget_master",     icon:"🎖️",title:"Dentro do Orçamento",   description:"Ficou abaixo do orçamento em todas as categorias", check:(tx,cats)=>withinBudgetAllCategories(tx,cats) },
  { id:"streak_7",          icon:"🔥", title:"Semana de Fogo",        description:"7 dias consecutivos a registar",              check:(tx)=>calculateStreak(tx)>=7 },
  { id:"streak_30",         icon:"⚡", title:"Mês Imparável",         description:"30 dias consecutivos a registar",             check:(tx)=>calculateStreak(tx)>=30 },
  { id:"diversified",       icon:"🗂️",title:"Organizado",            description:"Usou 5 categorias diferentes num mês",        check:(tx)=>hasUsedCategoriesInMonth(tx,5) },
  { id:"savings_rate_30",   icon:"📈", title:"Taxa de Elite",         description:"Taxa de poupança acima de 30% num mês",       check:(tx)=>hasSavingsRate(tx,0.30) },
];

export const generateChallenges = (transactions, categories, selectedDate) => {
  const { month, year } = selectedDate;
  const monthTx = transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===month&&d.getFullYear()===year;});
  const prevMonth = month===0?11:month-1;
  const prevYear  = month===0?year-1:year;
  const prevTx = transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===prevMonth&&d.getFullYear()===prevYear;});

  const income   = monthTx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses = monthTx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const daysInMonth = new Date(year,month+1,0).getDate();
  const today = new Date();
  const currentDay = today.getMonth()===month&&today.getFullYear()===year ? today.getDate() : daysInMonth;

  const challenges = [];

  // 2. Poupança 20%
  const savingsTarget = income>0 ? Math.round(income*0.2) : 200;
  challenges.push({
    id:"save_20pct", icon:"💰", title:"Regra dos 20%",
    description:`Poupa pelo menos ${savingsTarget}€ este mês`,
    target:savingsTarget, current:Math.max(0,income-expenses), unit:"€", type:"progress",
  });

  // 3. Reduzir categoria top
  const topCatId = getTopExpenseCategory(monthTx);
  const topCat = categories.find(c=>c.id===topCatId);
  if (topCat && prevTx.length>0) {
    const prevSpent = prevTx.filter(t=>t.type==="expense"&&t.categoryId===topCatId).reduce((s,t)=>s+t.amount,0);
    const currSpent = monthTx.filter(t=>t.type==="expense"&&t.categoryId===topCatId).reduce((s,t)=>s+t.amount,0);
    const target = Math.round(prevSpent*0.9);
    if (prevSpent>0) challenges.push({
      id:`reduce_${topCatId}`, icon:topCat.icon, title:`Reduzir ${topCat.name}`,
      description:`Gasta menos de ${target}€ (−10% vs mês anterior)`,
      target, current:target-currSpent, currentRaw:currSpent, prevRaw:prevSpent,
      unit:"€", type:"reduce", color:topCat.color,
    });
  }

  // 4. Saldo positivo
  challenges.push({
    id:"positive_balance", icon:"📈", title:"Fechar no Verde",
    description:"Terminar o mês com saldo positivo",
    target:1, current:income>expenses?1:0, unit:"", type:"boolean",
  });

  return challenges;
};

/* ── Score (0-100) — troca consistência por taxa de poupança histórica ── */
export const calculateScore = (transactions, categories, selectedDate) => {
  const { month, year } = selectedDate;
  const monthTx = transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===month&&d.getFullYear()===year;});
  if (monthTx.length===0) return { score:0, breakdown:[] };

  const income   = monthTx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses = monthTx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const balance  = income-expenses;

  const breakdown = [];

  // 1. Saldo positivo (30 pts)
  const balanceScore = income>0 ? Math.min(30,Math.round((balance/income)*60)) : 0;
  breakdown.push({ label:"Saldo positivo", score:Math.max(0,balanceScore), max:30, icon:"💚" });

  // 2. Taxa de poupança este mês (25 pts) — meta 20%
  const savingsRate = income>0 ? balance/income : 0;
  const savingsScore = Math.min(25,Math.round(savingsRate*125));
  breakdown.push({ label:"Taxa de poupança", score:Math.max(0,savingsScore), max:25, icon:"💰" });

  // 3. Orçamentos respeitados (25 pts)
  const budgetCats = categories.filter(c=>(c.type==="expense"||!c.type)&&c.budget>0);
  let budgetScore = 25;
  if (budgetCats.length>0) {
    const exceeded = budgetCats.filter(cat=>{
      const spent = monthTx.filter(t=>t.type==="expense"&&t.categoryId===cat.id).reduce((s,t)=>s+t.amount,0);
      return spent>cat.budget;
    }).length;
    budgetScore = Math.round(25*(1-exceeded/budgetCats.length));
  }
  breakdown.push({ label:"Orçamentos respeitados", score:budgetScore, max:25, icon:"🎯" });

  // 4. Taxa de poupança histórica (20 pts) — média dos últimos 3 meses
  const historicalScore = getHistoricalSavingsScore(transactions, month, year);
  breakdown.push({ label:"Poupança histórica", score:historicalScore, max:20, icon:"📈" });

  const total = breakdown.reduce((s,b)=>s+b.score,0);
  return { score:Math.min(100,total), breakdown };
};

export const calculateStreak = (transactions) => {
  if (transactions.length===0) return 0;
  const days = new Set(transactions.map(t=>{
    const d=new Date(t.date); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  let streak=0;
  const today=new Date();
  for (let i=0;i<365;i++) {
    const d=new Date(today); d.setDate(d.getDate()-i);
    const key=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(key)) streak++;
    else if (i>0) break;
  }
  return streak;
};

const useGamification = (transactions, categories, goals, selectedDate) => {
  return useMemo(()=>{
    const streak = calculateStreak(transactions);
    const unlockedIds = new Set(ACHIEVEMENTS.filter(a=>a.check(transactions,categories,goals)).map(a=>a.id));
    const achievements = ACHIEVEMENTS.map(a=>({...a, unlocked:unlockedIds.has(a.id)}));
    const { score, breakdown } = calculateScore(transactions,categories,selectedDate);
    const challenges = generateChallenges(transactions,categories,selectedDate);
    return { streak, achievements, score, breakdown, challenges };
  }, [transactions, categories, goals, selectedDate]);
};

export default useGamification;

/* ── Helpers ── */
function hasPositiveMonth(tx) {
  const m=groupByMonth(tx);
  return Object.values(m).some(t=>{
    const i=t.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0);
    const e=t.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);
    return i>e;
  });
}
function countConsecutivePositiveMonths(tx) {
  const m=groupByMonth(tx); const keys=Object.keys(m).sort();
  let max=0,cur=0;
  keys.forEach(k=>{
    const t=m[k];
    const i=t.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0);
    const e=t.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);
    if (i>e){cur++;max=Math.max(max,cur);}else cur=0;
  });
  return max;
}
function hasMonthlySaving(tx,amount) {
  const m=groupByMonth(tx);
  return Object.values(m).some(t=>{
    const i=t.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0);
    const e=t.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);
    return (i-e)>=amount;
  });
}
function hasSavingsRate(tx,rate) {
  const m=groupByMonth(tx);
  return Object.values(m).some(t=>{
    const i=t.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0);
    const e=t.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);
    return i>0&&(i-e)/i>=rate;
  });
}
function withinBudgetAllCategories(tx,cats) {
  const m=groupByMonth(tx);
  return Object.values(m).some(t=>
    cats.filter(c=>c.budget>0&&(c.type==="expense"||!c.type)).every(cat=>{
      const spent=t.filter(x=>x.type==="expense"&&x.categoryId===cat.id).reduce((s,x)=>s+x.amount,0);
      return spent<=cat.budget;
    })
  );
}
function hasUsedCategoriesInMonth(tx,n) {
  const now=new Date();
  const m=tx.filter(t=>{const d=new Date(t.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
  return new Set(m.filter(t=>t.categoryId).map(t=>t.categoryId)).size>=n;
}
function getTopExpenseCategory(tx) {
  const totals={};
  tx.filter(t=>t.type==="expense"&&t.categoryId).forEach(t=>{ totals[t.categoryId]=(totals[t.categoryId]||0)+t.amount; });
  return Object.entries(totals).sort((a,b)=>b[1]-a[1])[0]?.[0];
}
function groupByMonth(tx) {
  const map={};
  tx.forEach(t=>{ const d=new Date(t.date); const k=`${d.getFullYear()}-${d.getMonth()}`; if(!map[k])map[k]=[]; map[k].push(t); });
  return map;
}
function getHistoricalSavingsScore(transactions, currentMonth, currentYear) {
  // Média da taxa de poupança dos últimos 3 meses (excluindo o atual)
  let totalRate=0, count=0;
  for (let i=1;i<=3;i++) {
    let m=currentMonth-i, y=currentYear;
    if (m<0){m+=12;y--;}
    const tx=transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===m&&d.getFullYear()===y;});
    if (tx.length===0) continue;
    const inc=tx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
    const exp=tx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
    if (inc>0) { totalRate+=(inc-exp)/inc; count++; }
  }
  if (count===0) return 0;
  const avgRate=totalRate/count;
  return Math.min(20,Math.max(0,Math.round(avgRate*100)));
}