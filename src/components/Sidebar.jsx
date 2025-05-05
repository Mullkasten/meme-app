import React from 'react';

function Sidebar({ activeView, onSetView, onShowAbout }) {
  return (
    <nav className="sidebar">
      <h2>Meme Shelter</h2>
      <button
        onClick={() => onSetView('all')}
        className={activeView === 'all' ? 'active' : ''}
      >
        Мемы
      </button>
      <button
        onClick={() => onSetView('favorites')}
        className={activeView === 'favorites' ? 'active' : ''}
      >
        Избранное
      </button>
      <button
        onClick={() => onSetView('profile')}
        className={activeView === 'profile' ? 'active' : ''}
      >
        Профиль
      </button>
      {/* Новая кнопка Настроек */}
      <button
        onClick={() => onSetView('settings')}
        className={activeView === 'settings' ? 'active' : ''}
      >
        Настройки
      </button>
      <button onClick={onShowAbout}>
        О мемах
      </button>
    </nav>
  );
}

export default Sidebar;