import { useEffect } from "react";

const useRecurringInjector = (transactions, setTransactions) => {
  useEffect(() => {
    const raw = localStorage.getItem("recurringTransactions");
    if (!raw) return;

    let recurring;
    try {
      recurring = JSON.parse(raw);
    } catch {
      return;
    }

    const active = recurring.filter(r => r.active);
    if (active.length === 0) return;

    const now = new Date();
    const newTransactions = [];

    active.forEach(r => {
      // Datas a verificar dependendo da frequência
      const occurrences = getOccurrencesSince(r, now);

      occurrences.forEach(date => {
        const key = `recurring_${r.id}_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
        const alreadyExists = transactions.some(t => t.recurringKey === key);
        if (!alreadyExists) {
          newTransactions.push({
            id: Date.now() + Math.random(),
            date: date.getTime(),
            description: r.description,
            amount: r.amount,
            type: r.type,
            categoryId: r.categoryId || null,
            recurringKey: key,
            isRecurring: true,
          });
        }
      });
    });

    if (newTransactions.length > 0) {
      setTransactions(prev => [...prev, ...newTransactions]);
    }
  // Só corre uma vez no mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/**
 * Retorna todas as datas em que a recorrente devia ter acontecido
 * desde a sua criação até hoje.
 */
function getOccurrencesSince(recurring, now) {
  const createdAt = new Date(recurring.createdAt || Date.now());
  const occurrences = [];

  const startYear = createdAt.getFullYear();
  const startMonth = createdAt.getMonth();

  const endYear = now.getFullYear();
  const endMonth = now.getMonth();

  if (recurring.frequency === "yearly") {
    // Um por ano, no dia configurado do mês de criação
    for (let y = startYear; y <= endYear; y++) {
      const d = new Date(y, createdAt.getMonth(), recurring.dayOfMonth);
      if (d >= createdAt && d <= now) occurrences.push(d);
    }
    return occurrences;
  }

  if (recurring.frequency === "weekly") {
    const d = new Date(createdAt);
    while (d <= now) {
      const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (target >= createdAt && target <= now) occurrences.push(new Date(target));
      d.setDate(d.getDate() + 7);
    }
    return occurrences;
  }

  if (recurring.frequency === "biweekly") {
    const d = new Date(createdAt);
    while (d <= now) {
      const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (target >= createdAt && target <= now) occurrences.push(new Date(target));
      d.setDate(d.getDate() + 14);
    }
    return occurrences;
  }

  // monthly (default)
  for (
    let y = startYear, m = startMonth;
    y < endYear || (y === endYear && m <= endMonth);
    m === 11 ? (y++, m = 0) : m++
  ) {
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const day = Math.min(recurring.dayOfMonth, daysInMonth);
    const d = new Date(y, m, day);
    if (d >= createdAt && d <= now) occurrences.push(d);
  }

  return occurrences;
}

export default useRecurringInjector;