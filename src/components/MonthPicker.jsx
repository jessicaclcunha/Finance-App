import { useState, useRef } from "react";

const MonthPicker = ({ selectedDate, onDateChange, viewMode, onViewModeChange }) => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const [slideDir, setSlideDir] = useState(null); // "left" | "right" | null
  const animating = useRef(false);

  const navigate = (direction, newDate) => {
    if (animating.current) return;
    animating.current = true;
    setSlideDir(direction);
    setTimeout(() => {
      onDateChange(newDate);
      setSlideDir(null);
      animating.current = false;
    }, 220);
  };

  const handlePrevMonth = () => navigate("right", {
    month: selectedDate.month === 0 ? 11 : selectedDate.month - 1,
    year: selectedDate.month === 0 ? selectedDate.year - 1 : selectedDate.year,
  });

  const handleNextMonth = () => navigate("left", {
    month: selectedDate.month === 11 ? 0 : selectedDate.month + 1,
    year: selectedDate.month === 11 ? selectedDate.year + 1 : selectedDate.year,
  });

  const handlePrevYear = () => navigate("right", { ...selectedDate, year: selectedDate.year - 1 });
  const handleNextYear = () => navigate("left",  { ...selectedDate, year: selectedDate.year + 1 });

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedDate.month === now.getMonth() && selectedDate.year === now.getFullYear();
  };

  const isCurrentYear = () => new Date().getFullYear() === selectedDate.year;

  const slideStyle = {
    display: "inline-block",
    transition: slideDir ? "opacity 0.2s ease, transform 0.2s ease" : "none",
    opacity: slideDir ? 0 : 1,
    transform: slideDir === "left"
      ? "translateX(-16px)"
      : slideDir === "right"
      ? "translateX(16px)"
      : "translateX(0)",
  };

  return (
    <div className="month-picker-container">
      <div className="view-mode-toggle">
        <button onClick={() => onViewModeChange("month")}
          className={viewMode === "month" ? "view-btn active" : "view-btn"}>
          Mensal
        </button>
        <button onClick={() => onViewModeChange("year")}
          className={viewMode === "year" ? "view-btn active" : "view-btn"}>
          Anual
        </button>
      </div>

      <div className="date-navigation">
        <button
          onClick={viewMode === "month" ? handlePrevMonth : handlePrevYear}
          className="nav-arrow"
          title={viewMode === "month" ? "Mês anterior" : "Ano anterior"}
        >←</button>

        <div className="date-display" style={{ overflow: "hidden" }}>
          <div style={slideStyle}>
            {viewMode === "month" ? (
              <>
                <div className="month-name">{months[selectedDate.month]}</div>
                <div className="year-label">{selectedDate.year}</div>
              </>
            ) : (
              <>
                <div className="year-name">{selectedDate.year}</div>
                <div className="year-label">Ano completo</div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={viewMode === "month" ? handleNextMonth : handleNextYear}
          className="nav-arrow"
          title={viewMode === "month" ? "Próximo mês" : "Próximo ano"}
        >→</button>
      </div>

      {((viewMode === "month" && !isCurrentMonth()) || (viewMode === "year" && !isCurrentYear())) && (
        <button
          onClick={() => {
            const now = new Date();
            onDateChange({ month: now.getMonth(), year: now.getFullYear() });
          }}
          className="btn btn-secondary btn-small"
          style={{ width: "100%", marginTop: "12px" }}
        >
          Voltar ao {viewMode === "month" ? "mês" : "ano"} atual
        </button>
      )}
    </div>
  );
};

export default MonthPicker;