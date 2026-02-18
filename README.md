<div align="center">

# PureProsper

### Gestor de Finanças Pessoais

**PureProsper** é uma aplicação web para acompanhar receitas e despesas, gerir orçamentos por categoria, visualizar gráficos e definir objetivos de poupança — tudo guardado localmente no teu browser, sem necessidade de conta ou servidor.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://finance-atatne2pq-jessicas-projects-19cffcf6.vercel.app)

🔗 [Ver Demo ao Vivo](https://finance-atatne2pq-jessicas-projects-19cffcf6.vercel.app) &nbsp;·&nbsp; [Repositório](https://github.com/jessicaclcunha/Finance-App)

> ⚠️ Projeto em desenvolvimento ativo — funcionalidades podem estar incompletas ou sujeitas a alterações.

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Arquitetura e Decisões Técnicas](#-arquitetura-e-decisões-técnicas)

---

## Sobre o Projeto

O **PureProsper** nasceu da necessidade de ter uma ferramenta simples e intuitiva para gerir as finanças pessoais do dia a dia. Sem contas, sem servidores, sem complicações — os dados ficam no teu browser e só tu tens acesso a eles.

A aplicação permite ter uma visão clara de para onde vai o dinheiro, comparar meses, acompanhar o progresso face aos objetivos de poupança, registar transações recorrentes e gerir orçamentos por categoria de forma totalmente personalizável.

---

## Funcionalidades

### Dashboard
Visão geral do mês selecionado com saldo atual, total de receitas e total de despesas. Inclui widgets inteligentes com dias restantes no mês, média diária de gastos, orçamento disponível por dia e projeção de gastos até ao fim do mês. Lista também as 5 maiores despesas do período.

### Transações
Registo completo de receitas e despesas com suporte a criação, edição e eliminação via modal. Inclui pesquisa por descrição, filtragem por tipo (todas / receitas / despesas) e ordenação por data, valor ou nome. As datas são apresentadas de forma amigável ("Hoje", "Ontem", etc.).

### Transações Recorrentes
Gestão de pagamentos e receitas que se repetem regularmente, como subscrições, renda ou salário. Suporta frequências semanais, quinzenais, mensais e anuais, com possibilidade de ativar/desativar cada entrada individualmente.

### Análise
Gráficos interativos com duas vistas: comparação entre gasto real e orçamento por categoria (gráfico de barras) e distribuição percentual de gastos (gráfico de rosca). Inclui também a evolução mensal de receitas vs despesas ao longo do ano com um gráfico de linhas.

### Vista Anual
Resumo completo do ano com gráfico de barras interativo mês a mês (com tooltip ao passar o rato), tabela detalhada com receitas, despesas e saldo de cada mês, totais anuais e identificação do melhor e pior mês.

### Objetivos de Poupança
Criação e acompanhamento de metas financeiras com data-alvo. Barra de progresso animada com marcos a 25%, 50% e 75%, efeito de celebração ao atingir 100%, botões de adição rápida de valores (+10€, +50€, +100€) e a possibilidade de inserir um valor personalizado.

### Categorias Personalizadas
Criação e gestão de categorias com nome, ícone (qualquer emoji), cor personalizada (color picker) e orçamento mensal. Inclui um conjunto de categorias predefinidas para começar de imediato e sugestões rápidas de emojis.

### Etiquetas
Sistema de etiquetas (tags) para classificar e organizar transações com cores personalizadas, guardadas em `localStorage`.

### Exportação e Backup
Exportação das transações para CSV (compatível com Excel e Google Sheets), criação de backups completos em JSON (inclui transações, categorias, metas e transações recorrentes) e restauro de backups anteriores.

### Design Responsivo
Navegação adaptada a mobile com menu hamburger e layout fluido para diferentes tamanhos de ecrã.

---

## Tecnologias

| Tecnologia | Versão | Descrição |
|---|---|---|
| [React](https://react.dev/) | 18+ | Biblioteca principal para a interface |
| [Vite](https://vitejs.dev/) | 5+ | Bundler e servidor de desenvolvimento |
| [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) | — | Gráficos de barras, rosca e linhas |
| Context API | — | Gestão de estado global das categorias |
| `localStorage` | — | Persistência de dados no browser |
| CSS Modular | — | Estilos organizados por componente |

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── Header.jsx                 # Navegação principal com menu hamburger (mobile)
│   ├── Dashboard.jsx              # Saldo, receitas e despesas do mês
│   ├── MonthInsights.jsx          # Widgets inteligentes e maiores despesas
│   ├── TransactionList.jsx        # Lista de transações com filtros e pesquisa
│   ├── TransactionForm.jsx        # Formulário de criação de nova transação
│   ├── RecurringTransactions.jsx  # Gestão de transações recorrentes
│   ├── Charts.jsx                 # Gráficos de barras e rosca por categoria
│   ├── MonthlyComparison.jsx      # Gráfico de linhas — evolução mensal anual
│   ├── AnnualView.jsx             # Vista anual com gráfico e tabela resumo
│   ├── MonthPicker.jsx            # Seletor de mês/ano com toggle mensal/anual
│   ├── SavingsGoals.jsx           # Metas de poupança com barra animada
│   ├── CategoryManager.jsx        # Criação e edição de categorias
│   ├── TagsManager.jsx            # Gestão de etiquetas personalizadas
│   └── ExportData.jsx             # Exportação CSV, backup e restauro JSON
├── contexts/
│   └── CategoriesContext.jsx      # Estado global das categorias (Context API)
├── App.jsx                        # Componente raiz, routing e estado principal
├── App.css                        # Estilos globais
├── main.jsx                       # Entry point da aplicação
└── index.css                      # Reset e variáveis CSS
```

---

## Arquitetura e Decisões Técnicas

**Estado Global vs. Local** — As categorias são geridas globalmente via Context API (`CategoriesContext`) por serem partilhadas entre vários componentes. O estado das transações vive no `App.jsx` e é passado por props, mantendo um fluxo de dados previsível.

**Persistência** — Todos os dados são guardados em `localStorage` com chaves separadas por entidade (`transactions`, `categories`, `savingsGoals`, `recurringTransactions`, `tags`), permitindo backups parciais e restauros granulares.

**Routing por Estado** — A navegação entre vistas é feita via estado React (`view` state) em vez de um router externo, simplificando a estrutura para uma SPA sem necessidade de URLs distintas.

**Animações** — A barra de progresso das metas usa `requestAnimationFrame` com easing cúbico para uma animação suave, sem dependências externas.

---

<div align="center">
  Feito com ❤️ por <a href="https://github.com/jessicaclcunha">Jessica Cunha</a>
</div>