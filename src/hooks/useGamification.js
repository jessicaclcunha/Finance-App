import { useMemo } from "react";

export const ACHIEVEMENTS = [
  {
    id: "first_transaction",
    icon: "🌱",
    title: "Primeiro Passo",
    description: "Registou a primeira transação",
    check: (tx) => tx.length >= 1,
  },
  {
    id: "ten_transactions",
    icon: "📊",
    title: "Em Ritmo",
    description: "10 transações registadas",
    check: (tx) => tx.length >= 10,
  },
  {
    id: "fifty_transactions",
    icon: "🏃",
    title: "Consistente",
    description: "50 transações registadas",
    check: (tx) => tx.length >= 50,
  },
  {
    id: "first_positive_month",
    icon: "✨",
    title: "Mês Verde",
    description: "Primeiro mês com saldo positivo",
    check: (tx) => hasPositiveMonth(tx),
  },
  {
    id: "three_positive_months",
    icon: "🌿",
    title: "Tendência Positiva",
    description: "3 meses consecutivos com saldo positivo",
    check: (tx) => countConsecutivePositiveMonths(tx) >= 3,
  },
  {
    id: "saved_500",
    icon: "💰",
    title: "Poupador",
    description: "Poupou 500€ num mês",
    check: (tx) => hasMonthlySaving(tx, 500),
  },
  {
    id: "saved_1000",
    icon: "💎",
    title: "Milhar",
    description: "Poupou 1000€ num mês",
    check: (tx) => hasMonthlySaving(tx, 1000),
  },
  {
    id: "first_goal",
    icon: "🎯",
    title: "Com Objetivos",
    description: "Criou a primeira meta de poupança",
    check: (tx, cats, goals) => goals.length >= 1,
  },
  {
    id: "goal_completed",
    icon: "🏆",
    title: "Meta Atingida",
    description: "Completou uma meta de poupança",
    check: (tx, cats, goals) => goals.some(g => g.saved >= g.target),
  },
  {
    id: "budget_master",
    icon: "🎖️",
    title: "Dentro do Orçamento",
    description: "Ficou abaixo do orçamento em todas as categorias num mês",
    check: (tx, cats) => withinBudgetAllCategories(tx, cats),
  },
  {
    id: "streak_7",
    icon: "🔥",
    title: "Semana de Fogo",
    description: "7 dias consecutivos a registar",
    check: (tx) => calculateStreak(tx) >= 7,
  },
  {
    id: "streak_30",
    icon: "⚡",
    title: "Mês Imparável",
    description: "30 dias consecutivos a registar",
    check: (tx) => calculateStreak(tx) >= 30,
  },
  {
    id: "diversified",
    icon: "🗂️",
    title: "Organizado",
    description: "Usou 5 categorias diferentes num mês",
    check: (tx) => hasUsedCategoriesInMonth(tx, 5),
  },
  {
    id: "no_overspend",
    icon: "🛡️",
    title: "Disciplinado",
    description: "Nenhuma categoria excedeu o orçamento este mês",
    check: (tx, cats) => noCategoryExceeded(tx, cats),
  },
];

/* ─────────────────────────────────────────
   DESAFIOS MENSAIS
   Gerados com base no mês atual e nos dados do utilizador
───────────────────────────────────────── */
export const generateChallenges = (transactions, categories, selectedDate) => {
  const { month, year } = selectedDate;

  const monthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  // Mês anterior para comparação
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const challenges = [];

  // 1. Desafio de registo diário
  const uniqueDays = new Set(monthTx.map(t => new Date(t.date).getDate())).size;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const currentDay = today.getMonth() === month && today.getFullYear() === year
    ? today.getDate() : daysInMonth;
  challenges.push({
    id: "daily_log",
    icon: "📅",
    title: "Registo Diário",
    description: `Regista despesas em ${Math.min(15, currentDay)} dias este mês`,
    target: Math.min(15, currentDay),
    current: uniqueDays,
    unit: "dias",
    type: "progress",
  });

  // 2. Desafio de poupança
  const income = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savingsTarget = income > 0 ? Math.round(income * 0.2) : 200;
  challenges.push({
    id: "save_20pct",
    icon: "💰",
    title: "Regra dos 20%",
    description: `Poupa pelo menos ${savingsTarget}€ este mês`,
    target: savingsTarget,
    current: Math.max(0, income - expenses),
    unit: "€",
    type: "progress",
  });

  // 3. Desafio de categoria (reduzir o maior gasto vs mês anterior)
  const topCatId = getTopExpenseCategory(monthTx);
  const topCat = categories.find(c => c.id === topCatId);
  if (topCat && prevTx.length > 0) {
    const prevSpent = prevTx
      .filter(t => t.type === "expense" && t.categoryId === topCatId)
      .reduce((s, t) => s + t.amount, 0);
    const currSpent = monthTx
      .filter(t => t.type === "expense" && t.categoryId === topCatId)
      .reduce((s, t) => s + t.amount, 0);
    const target = Math.round(prevSpent * 0.9);
    if (prevSpent > 0) {
      challenges.push({
        id: `reduce_${topCatId}`,
        icon: topCat.icon,
        title: `Reduzir ${topCat.name}`,
        description: `Gasta menos de ${target}€ em ${topCat.name} (−10% vs mês anterior)`,
        target,
        current: target - currSpent, // quanto "sobra" para o objetivo
        currentRaw: currSpent,
        prevRaw: prevSpent,
        unit: "€",
        type: "reduce",
        color: topCat.color,
      });
    }
  }

  // 4. Desafio de saldo positivo
  challenges.push({
    id: "positive_balance",
    icon: "📈",
    title: "Fechar no Verde",
    description: "Terminar o mês com saldo positivo",
    target: 1,
    current: income > expenses ? 1 : 0,
    unit: "",
    type: "boolean",
  });

  return challenges;
};

/* ─────────────────────────────────────────
   SCORE FINANCEIRO (0–100)
───────────────────────────────────────── */
export const calculateScore = (transactions, categories, selectedDate) => {
  const { month, year } = selectedDate;
  const monthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  if (monthTx.length === 0) return { score: 0, breakdown: [] };

  const income   = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance  = income - expenses;

  const breakdown = [];

  // 1. Saldo positivo (30 pts)
  const balanceScore = income > 0
    ? Math.min(30, Math.round((balance / income) * 60))
    : 0;
  breakdown.push({ label: "Saldo positivo", score: Math.max(0, balanceScore), max: 30, icon: "💚" });

  // 2. Taxa de poupança (25 pts) — meta: 20%
  const savingsRate = income > 0 ? (balance / income) : 0;
  const savingsScore = Math.min(25, Math.round(savingsRate * 125));
  breakdown.push({ label: "Taxa de poupança", score: Math.max(0, savingsScore), max: 25, icon: "💰" });

  // 3. Respeito dos orçamentos (25 pts)
  const budgetCats = categories.filter(c => (c.type === "expense" || !c.type) && c.budget > 0);
  let budgetScore = 25;
  if (budgetCats.length > 0) {
    const exceeded = budgetCats.filter(cat => {
      const spent = monthTx
        .filter(t => t.type === "expense" && t.categoryId === cat.id)
        .reduce((s, t) => s + t.amount, 0);
      return spent > cat.budget;
    }).length;
    budgetScore = Math.round(25 * (1 - exceeded / budgetCats.length));
  }
  breakdown.push({ label: "Orçamentos respeitados", score: budgetScore, max: 25, icon: "🎯" });

  // 4. Consistência de registo (20 pts)
  const uniqueDays = new Set(monthTx.map(t => new Date(t.date).getDate())).size;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const daysPassed = today.getMonth() === month && today.getFullYear() === year
    ? today.getDate() : daysInMonth;
  const consistencyScore = Math.min(20, Math.round((uniqueDays / daysPassed) * 20));
  breakdown.push({ label: "Consistência", score: consistencyScore, max: 20, icon: "📅" });

  const total = breakdown.reduce((s, b) => s + b.score, 0);
  return { score: Math.min(100, total), breakdown };
};

/* ─────────────────────────────────────────
   STREAK
───────────────────────────────────────── */
export const calculateStreak = (transactions) => {
  if (transactions.length === 0) return 0;

  const days = new Set(
    transactions.map(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
};

/* ─────────────────────────────────────────
   HOOK PRINCIPAL
───────────────────────────────────────── */
const useGamification = (transactions, categories, goals, selectedDate) => {
  return useMemo(() => {
    const streak = calculateStreak(transactions);

    const unlockedIds = new Set(
      ACHIEVEMENTS
        .filter(a => a.check(transactions, categories, goals))
        .map(a => a.id)
    );

    const achievements = ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
    }));

    const { score, breakdown } = calculateScore(transactions, categories, selectedDate);
    const challenges = generateChallenges(transactions, categories, selectedDate);

    return { streak, achievements, score, breakdown, challenges };
  }, [transactions, categories, goals, selectedDate]);
};

export default useGamification;

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function hasPositiveMonth(transactions) {
  const byMonth = groupByMonth(transactions);
  return Object.values(byMonth).some(tx => {
    const inc = tx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = tx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return inc > exp;
  });
}

function countConsecutivePositiveMonths(transactions) {
  const byMonth = groupByMonth(transactions);
  const keys = Object.keys(byMonth).sort();
  let max = 0, cur = 0;
  keys.forEach(k => {
    const tx = byMonth[k];
    const inc = tx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = tx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    if (inc > exp) { cur++; max = Math.max(max, cur); }
    else cur = 0;
  });
  return max;
}

function hasMonthlySaving(transactions, amount) {
  const byMonth = groupByMonth(transactions);
  return Object.values(byMonth).some(tx => {
    const inc = tx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = tx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return (inc - exp) >= amount;
  });
}

function withinBudgetAllCategories(transactions, categories) {
  const byMonth = groupByMonth(transactions);
  return Object.values(byMonth).some(tx => {
    return categories
      .filter(c => c.budget > 0 && (c.type === "expense" || !c.type))
      .every(cat => {
        const spent = tx.filter(t => t.type === "expense" && t.categoryId === cat.id)
          .reduce((s, t) => s + t.amount, 0);
        return spent <= cat.budget;
      });
  });
}

function noCategoryExceeded(transactions, categories) {
  const now = new Date();
  const monthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  return categories
    .filter(c => c.budget > 0 && (c.type === "expense" || !c.type))
    .every(cat => {
      const spent = monthTx.filter(t => t.type === "expense" && t.categoryId === cat.id)
        .reduce((s, t) => s + t.amount, 0);
      return spent <= cat.budget;
    });
}

function hasUsedCategoriesInMonth(transactions, n) {
  const now = new Date();
  const monthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  return new Set(monthTx.filter(t => t.categoryId).map(t => t.categoryId)).size >= n;
}

function getTopExpenseCategory(transactions) {
  const totals = {};
  transactions.filter(t => t.type === "expense" && t.categoryId).forEach(t => {
    totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount;
  });
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function groupByMonth(transactions) {
  const map = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map[key]) map[key] = [];
    map[key].push(t);
  });
  return map;
}