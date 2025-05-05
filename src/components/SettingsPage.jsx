import React from 'react';

function SettingsPage({
  isEnabled,          // boolean: включен ли режим "хватит прокрастинировать"
  onToggleEnabled,    // function: переключить isEnabled
  breakCount,         // number: количество мемов до перерыва
  onBreakCountChange, // function: изменить breakCount
}) {

  const handleCheckboxChange = (event) => {
    onToggleEnabled(event.target.checked);
  };

  const handleInputChange = (event) => {
    // Преобразуем в число, минимум 1
    const count = Math.max(1, parseInt(event.target.value, 10) || 1);
    onBreakCountChange(count);
  };

  return (
    <div className="settings-page">
      <h2>Настройки просмотра</h2>
      <div className="setting-item">
        <label htmlFor="procrastination-toggle">
          <input
            type="checkbox"
            id="procrastination-toggle"
            checked={isEnabled}
            onChange={handleCheckboxChange}
          />
          Режим "Анти-прокрастинатор"
        </label>
        <p className="setting-description">
          Включи если хочешь вернуться к работе после определенного количества мемов
        </p>
      </div>

      {/* Показываем поле ввода только если режим включен */}
      {isEnabled && (
        <div className="setting-item">
          <label htmlFor="break-count-input">
            Мемов до перерыва:
          </label>
          <input
            type="number"
            id="break-count-input"
            value={breakCount}
            onChange={handleInputChange}
            min="1" // Минимальное значение
            className="break-count-input"
          />
           <p className="setting-description">
             Количество мемов которое будет показано до напоминания о необходимости вернуться к работе
           </p>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;