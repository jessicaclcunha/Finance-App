const MonthPicker = ({ selectedDate, onDateChange, viewMode, onViewModeChange }) => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevMonth = () => {
    const newMonth = selectedDate.month === 0 ? 11 : selectedDate.month - 1;
    const newYear = selectedDate.month === 0 ? selectedDate.year - 1 : selectedDate.year;
    onDateChange({ month: newMonth, year: newYear });
  };

  const handleNextMonth = () => {
    const newMonth = selectedDate.month === 11 ? 0 : selectedDate.month + 1;
    const newYear = selectedDate.month === 11 ? selectedDate.year + 1 : selectedDate.year;
    onDateChange({ month: newMonth, year: newYear });
  };

  const handlePrevYear = () => {
    onDateChange({ ...selectedDate, year: selectedDate.year - 1 });
  };

  const handleNextYear = () => {
    onDateChange({ ...selectedDate, year: selectedDate.year + 1 });
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedDate.month === now.getMonth() && selectedDate.year === now.getFullYear();
  };

  const isCurrentYear = () => {
    const now = new Date();
    return selectedDate.year === now.getFullYear();
  };

  return (
    <div className="month-picker-container">
      {/* Toggle Vista */}
      <div className="view-mode-toggle">
        <button
          onClick={() => onViewModeChange('month')}
          className={viewMode === 'month' ? 'view-btn active' : 'view-btn'}
        >
          Mensal
        </button>
        <button
          onClick={() => onViewModeChange('year')}
          className={viewMode === 'year' ? 'view-btn active' : 'view-btn'}
        >
          Anual
        </button>
      </div>

      {/* Navegação */}
      <div className="date-navigation">
        {viewMode === 'month' ? (
          <>
            <button
              onClick={handlePrevMonth}
              className="nav-arrow"
              title="Mês anterior"
            >
              ←
            </button>
            
            <div className="date-display">
              <div className="month-name">{months[selectedDate.month]}</div>
              <div className="year-label">{selectedDate.year}</div>
            </div>
            
            <button
              onClick={handleNextMonth}
              className="nav-arrow"
              title="Próximo mês"
            >
              →
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handlePrevYear}
              className="nav-arrow"
              title="Ano anterior"
            >
              ←
            </button>
            
            <div className="date-display">
              <div className="year-name">{selectedDate.year}</div>
              <div className="year-label">Ano completo</div>
            </div>
            
            <button
              onClick={handleNextYear}
              className="nav-arrow"
              title="Próximo ano"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Botão voltar ao atual */}
      {((viewMode === 'month' && !isCurrentMonth()) || (viewMode === 'year' && !isCurrentYear())) && (
        <button
          onClick={() => {
            const now = new Date();
            onDateChange({ month: now.getMonth(), year: now.getFullYear() });
          }}
          className="btn btn-secondary btn-small"
          style={{ width: '100%', marginTop: '12px' }}
        >
          Voltar ao {viewMode === 'month' ? 'mês' : 'ano'} atual
        </button>
      )}
    </div>
  );
};

export default MonthPicker;