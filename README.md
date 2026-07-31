<div align="center">

# PureProsper

**As tuas finanças, sem drama.**

**[🔗 Ver demo](https://pure-prosper.vercel.app)**

> ⚠️ Projeto em desenvolvimento ativo — funcionalidades podem estar incompletas ou sujeitas a alterações.

</div>

---

## Porque é que isto existe

Ninguém gosta de registar despesas. Por isso o PureProsper tenta tornar o hábito viciante em vez de aborrecido: streaks 🔥, conquistas 🏆, um score de saúde financeira que sobe (ou desce) consoante os teus hábitos, e confetti a sério quando completas uma meta de poupança.

É uma SPA em React que fala diretamente com o Supabase (sem backend próprio) — cada utilizador só vê e edita os seus dados, garantido por Row Level Security (RLS) nas tabelas.

## Funcionalidades

### Dashboard
Vista mensal ou anual (alternável no `MonthPicker`) com saldo do período, total de receitas/despesas, e insights automáticos: dias restantes do mês, média de gasto diário, orçamento disponível por dia, e uma projeção do gasto total até ao fim do mês baseada na média atual. Mostra ainda o top 5 de maiores despesas do período.

### Transações
CRUD completo com pesquisa por descrição, ordenação (data / valor / nome) e filtro por tipo (receita/despesa). As transações são agrupadas por mês na listagem. Em mobile, arrastar um item para a esquerda revela a opção de eliminar (swipe-to-delete).

### Transações recorrentes
Define uma despesa/receita (ex: renda, Netflix, salário) com frequência — semanal, quinzenal, mensal ou anual — e o `useRecurringInjector` gera automaticamente, ao iniciar sessão, todas as ocorrências que ainda faltam desde a criação até hoje, evitando duplicados através de uma `recurring_key` única por ocorrência.

### Categorias
Cada categoria tem ícone (emoji livre), cor e um orçamento mensal opcional. Podem ser só de despesa, só de receita, ou "ambos". Categorias com orçamento definido acionam alertas visuais (`BudgetAlerts`) quando o gasto se aproxima (≥80%) ou ultrapassa o limite.

### Metas de poupança
Cada meta tem valor alvo, prazo e valor poupado até agora. A barra de progresso anima-se ao adicionar valor (botões rápidos +5/+10/+20 ou valor livre), mostra marcos aos 25/50/75/100%, e dispara confetti + destaque visual ao atingir 100% pela primeira vez. Se poupares mais do que o alvo, a meta continua a aceitar valores e mostra o excedente.

### Análise
Três vistas complementares ao dashboard:
- **Previsão** — gráfico de gasto acumulado real vs. projetado até ao fim do mês.
- **Categorias** — comparação do gasto por categoria face ao mês anterior, com variação percentual.
- **Padrões** — em que dia da semana e em que semana do mês gastas mais.

A vista anual (`AnnualView`) acrescenta um "gauge" de saúde financeira global (baseado na tua taxa de poupança histórica), evolução do saldo acumulado, taxa de poupança mês a mês, distribuição de despesas por categoria (doughnut) e comparação entre anos, quando existe histórico de mais do que um ano.

### Gamificação
- **Score (0–100)** — combina saldo positivo do mês (30 pts), taxa de poupança do mês (25 pts), respeito pelos orçamentos definidos (25 pts) e a média da taxa de poupança dos últimos 3 meses (20 pts).
- **Streak** — dias consecutivos com pelo menos uma transação registada.
- **15 conquistas** — desde "primeira transação" a "taxa de poupança acima de 30%", passando por metas atingidas/superadas e uso de várias categorias.
- **Desafios do mês** — gerados dinamicamente: poupar 20% do rendimento, reduzir 10% na categoria onde mais gastas, e fechar o mês com saldo positivo.

### Multi-moeda
EUR, USD, GBP e BRL, escolhida em **Minha Conta → Preferências** e guardada nos metadados do utilizador Supabase — aplica-se instantaneamente a toda a app via `CurrencyContext`.

### Exportação & Backup
- **CSV** — tabela simples para Excel/Sheets.
- **JSON** — dados estruturados com estatísticas agregadas.
- **Backup completo** — inclui transações, categorias, metas e recorrências; pode ser restaurado noutra conta (os IDs são remapeados, os dados são *adicionados*, não substituem os existentes).

### Autenticação
Email/palavra-passe (com confirmação de email obrigatória antes de aceder à app) ou login com Google, ambos via Supabase Auth.

## Tecnologias usadas

- **Frontend:** React + Vite
- **Gráficos:** Chart.js / react-chartjs-2
- **Backend:** Supabase (Postgres, Auth, Row Level Security)

Sem Redux nem gestor de estado externo: o estado global vive em três Contexts (`AuthContext`, `CategoriesContext`, `CurrencyContext`) e o resto é `useState`/`useMemo` local a cada componente.

## Estrutura

```
src/
├── components/   # UI — um componente por ecrã/secção
│   ├── Dashboard.jsx          # saldo + receitas/despesas do período
│   ├── TransactionList.jsx    # CRUD de transações
│   ├── CategoryManager.jsx    # CRUD de categorias
│   ├── SavingsGoals.jsx       # metas de poupança
│   ├── AnalysisView.jsx       # previsão / categorias / padrões
│   ├── AnnualView.jsx         # vista anual completa
│   ├── GamificationPanel.jsx  # score, streak, conquistas, desafios
│   ├── Account.jsx            # perfil, preferências, sign out
│   └── Auth.jsx                # login / registo / confirmação de email
├── contexts/     # AuthContext, CategoriesContext, CurrencyContext
├── hooks/        # useGamification (score/streak/conquistas), useRecurringInjector
├── lib/          # supabaseClient, mappers (linha da BD ⇄ objeto da app), currency
├── styles/       # 1 ficheiro CSS por secção, todos importados em index.css
public/
└── logo.svg / logo.png
```



## Notas

- Interface toda em português de Portugal (pt-PT) 🇵🇹
- Moeda configurável em **Minha Conta → Preferências**, aplicada em toda a app instantaneamente
- Sem anúncios, sem tracking esquisito — só tu e as tuas contas

---

<div align="center">
<sub>Feito para quem quer poupar sem sofrer a fazê-lo.</sub>

Feito com ❤️ por <a href="https://github.com/jessicaclcunha">Jessica Cunha</a>
</div>