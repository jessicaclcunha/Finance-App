import { useState, useEffect, useRef } from "react";

/* ── Score animado ── */
const ScoreRing = ({ score }) => {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = score;
    if (start === end) return;
    const duration = 900;
    const startTime = performance.now();
    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(animate);
      else prevRef.current = end;
    };
    requestAnimationFrame(animate);
  }, [score]);

  const getColor = (s) => {
    if (s >= 80) return "#6B9B6B";
    if (s >= 60) return "#D4A574";
    if (s >= 40) return "#A85252";
    return "#C07878";
  };

  const getLabel = (s) => {
    if (s >= 80) return "Excelente";
    if (s >= 60) return "Bom";
    if (s >= 40) return "A melhorar";
    return "Atenção";
  };

  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const progress = (displayed / 100) * circ;
  const color = getColor(displayed);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div style={{ position: "relative", width: 108, height: 108 }}>
        <svg width="108" height="108" style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx="54" cy="54" r={radius} fill="none"
            stroke="var(--beige-200)" strokeWidth="8" />
          {/* Progress */}
          <circle cx="54" cy="54" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${progress} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.05s linear, stroke 0.4s" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "var(--font-serif)", fontSize: "28px",
            fontWeight: 600, color: "var(--burgundy-900)", lineHeight: 1,
          }}>{displayed}</span>
          <span style={{ fontSize: "10px", color: "var(--beige-700)", fontWeight: 500 }}>/ 100</span>
        </div>
      </div>
      <span style={{
        fontSize: "12px", fontWeight: 600, padding: "3px 10px",
        borderRadius: "20px",
        background: color + "20",
        color,
      }}>{getLabel(displayed)}</span>
    </div>
  );
};

/* ── Breakdown do score ── */
const ScoreBreakdown = ({ breakdown }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
    {breakdown.map((item, i) => (
      <div key={i}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "12px", color: "var(--burgundy-900)", fontWeight: 500 }}>
            {item.icon} {item.label}
          </span>
          <span style={{ fontSize: "12px", color: "var(--beige-700)", fontWeight: 600 }}>
            {item.score}/{item.max}
          </span>
        </div>
        <div style={{ height: "5px", background: "var(--beige-200)", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(item.score / item.max) * 100}%`,
            background: item.score === item.max
              ? "var(--success)"
              : item.score > item.max * 0.5
              ? "var(--warning)"
              : "var(--error)",
            borderRadius: "999px",
            transition: "width 0.8s cubic-bezier(0.34,1.2,0.64,1)",
          }} />
        </div>
      </div>
    ))}
  </div>
);

/* ── Streak ── */
const StreakBadge = ({ streak }) => {
  const flames = streak >= 30 ? 3 : streak >= 7 ? 2 : 1;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      background: streak > 0 ? "rgba(212,165,116,0.12)" : "var(--beige-100)",
      border: `1px solid ${streak > 0 ? "rgba(212,165,116,0.3)" : "var(--beige-300)"}`,
      borderRadius: "10px", padding: "12px 16px",
      marginBottom: "16px",
    }}>
      <span style={{ fontSize: "28px", lineHeight: 1 }}>
        {"🔥".repeat(flames)}
      </span>
      <div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 600, color: "var(--burgundy-900)", lineHeight: 1 }}>
          {streak} {streak === 1 ? "dia" : "dias"}
        </div>
        <div style={{ fontSize: "12px", color: "var(--beige-700)", marginTop: "2px" }}>
          {streak === 0
            ? "Regista hoje para começar o streak"
            : streak >= 30
            ? "Streak incrível! Continua assim 🏆"
            : streak >= 7
            ? "Estás em chama! Não pares 💪"
            : "Continua a registar todos os dias"}
        </div>
      </div>
    </div>
  );
};

/* ── Conquistas ── */
const AchievementCard = ({ a }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "12px",
    padding: "12px 14px",
    background: a.unlocked ? "white" : "var(--beige-100)",
    border: `1px solid ${a.unlocked ? "var(--beige-300)" : "var(--beige-300)"}`,
    borderRadius: "10px",
    opacity: a.unlocked ? 1 : 0.7,
    transition: "transform 0.2s, box-shadow 0.2s",
  }}
  onMouseEnter={e => { if (a.unlocked) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; } }}
  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
  >
    <span style={{
      fontSize: "26px", lineHeight: 1, flexShrink: 0,
      filter: a.unlocked ? "none" : "grayscale(1)",
      opacity: a.unlocked ? 1 : 0.6,
    }}>{a.icon}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: "13px", fontWeight: 600,
        color: a.unlocked ? "var(--burgundy-800)" : "var(--beige-700)",
        display: "flex", alignItems: "center", gap: "6px",
      }}>
        {a.title}
        {a.unlocked && <span style={{ color: "var(--success)", fontSize: "12px" }}>✓</span>}
      </div>
      <div style={{ fontSize: "12px", color: "var(--beige-600)", marginTop: "2px", lineHeight: 1.4 }}>
        {a.description}
      </div>
    </div>
  </div>
);

const AchievementsGrid = ({ achievements }) => {
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "16px", color: "var(--burgundy-700)", margin: 0 }}>
          Conquistas
        </h4>
        <span style={{ fontSize: "12px", color: "var(--beige-700)", fontWeight: 500 }}>
          {unlocked.length}/{achievements.length}
        </span>
      </div>

      {unlocked.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--beige-600)", marginBottom: "8px" }}>
            Desbloqueadas
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {unlocked.map(a => <AchievementCard key={a.id} a={a} />)}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--beige-600)", marginBottom: "8px" }}>
            Por desbloquear
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {locked.map(a => <AchievementCard key={a.id} a={a} />)}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Desafios ── */
const ChallengesSection = ({ challenges }) => (
  <div>
    <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "16px", color: "var(--burgundy-700)", marginBottom: "12px" }}>
      Desafios do Mês
    </h4>
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {challenges.map(c => {
        const pct = c.type === "boolean"
          ? (c.current >= c.target ? 100 : 0)
          : c.type === "reduce"
          ? Math.min(100, Math.max(0, ((c.prevRaw - c.currentRaw) / (c.prevRaw * 0.1)) * 100))
          : Math.min(100, (c.current / c.target) * 100);

        const done = pct >= 100;

        return (
          <div key={c.id} style={{
            padding: "12px 14px",
            background: done ? "rgba(107,155,107,0.08)" : "white",
            border: `1px solid ${done ? "rgba(107,155,107,0.3)" : "var(--beige-300)"}`,
            borderRadius: "10px",
            transition: "all 0.3s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "20px" }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--burgundy-900)" }}>
                    {c.title}
                    {done && <span style={{ marginLeft: "6px", color: "var(--success)" }}>✓</span>}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--beige-700)", marginTop: "1px" }}>
                    {c.description}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: "12px", fontWeight: 700,
                color: done ? "var(--success)" : "var(--burgundy-900)",
                whiteSpace: "nowrap", marginLeft: "8px",
              }}>
                {Math.round(pct)}%
              </span>
            </div>

            {c.type !== "boolean" && (
              <div style={{ height: "5px", background: "var(--beige-200)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: done ? "var(--success)" : pct > 60 ? "var(--warning)" : "var(--burgundy-600)",
                  borderRadius: "999px",
                  transition: "width 0.8s cubic-bezier(0.34,1.2,0.64,1)",
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/* ── Painel principal ── */
const GamificationPanel = ({ score, breakdown, streak, achievements, challenges }) => {
  const [tab, setTab] = useState("score");

  const tabs = [
    { id: "score",        label: "Score",      icon: "📊" },
    { id: "challenges",   label: "Desafios",   icon: "🎯" },
    { id: "achievements", label: "Conquistas", icon: "🏆" },
  ];

  return (
    <div className="card" style={{ marginBottom: "24px" }}>
      {/* Header com streak sempre visível */}
      <StreakBadge streak={streak} />

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "4px",
        background: "var(--beige-100)", padding: "4px",
        borderRadius: "8px", marginBottom: "16px",
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "8px 4px",
            fontSize: "12px", fontWeight: tab === t.id ? 600 : 500,
            color: tab === t.id ? "var(--burgundy-900)" : "var(--beige-700)",
            background: tab === t.id ? "white" : "transparent",
            border: "none", borderRadius: "6px", cursor: "pointer",
            boxShadow: tab === t.id ? "var(--shadow-sm)" : "none",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
          }}>
            <span>{t.icon}</span>
            <span style={{ display: window.innerWidth < 380 ? "none" : "inline" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tab === "score" && (
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <ScoreRing score={score} />
          {breakdown.length > 0
            ? <ScoreBreakdown breakdown={breakdown} />
            : <p style={{ fontSize: "13px", color: "var(--beige-600)" }}>
                Adiciona transações este mês para calcular o teu score.
              </p>
          }
        </div>
      )}

      {tab === "challenges" && <ChallengesSection challenges={challenges} />}
      {tab === "achievements" && <AchievementsGrid achievements={achievements} />}
    </div>
  );
};

export { AchievementsGrid };
export default GamificationPanel;