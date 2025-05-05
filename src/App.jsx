import React, { useState, useEffect, useRef, useCallback } from 'react';
import MemeFeed from './components/MemeFeed';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import Sidebar from './components/Sidebar';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import AboutModal from './components/AboutModal';
import BreakModal from './components/BreakModal';
import './App.css';

// --- Helper for Fallback IDs ---
let fallbackIdCounter = 0;
const generateFallbackId = () => `fallback-${Date.now()}-${fallbackIdCounter++}`;

// --- API Endpoint ---
const API_URL = 'https://meme-api.com/gimme/5'; // Вытягиваем по 5 мемов

function App() {
  // --- State Management ---
  const [memes, setMemes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [activeView, setActiveView] = useState('all');
  const [showAboutModal, setShowAboutModal] = useState(false);

  // --- Settings State ---
  const [stopProcrastinatingEnabled, setStopProcrastinatingEnabled] = useState(false);
  const [memesBeforeBreak, setMemesBeforeBreak] = useState(10); // По умолчанию 10
  const [memesViewedSinceBreak, setMemesViewedSinceBreak] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);
  // --- End Settings State ---

  const initialFetchInitiated = useRef(false); // Для StrictMode

  // --- Data Fetching ---
  const fetchMemes = useCallback(async (isInitialLoad = false) => {
    // Предотвращаем запуск, если уже идет загрузка или мы не в 'all' виде
    if (isLoading && !isInitialLoad) return;
    if (!isInitialLoad && activeView !== 'all') return;

    console.log('Fetching memes...');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      let data = await response.json();
      // Обработка ответа с одним мемом
      if (data && !data.memes && data.postLink) data = { memes: [data] };
      else if (!data || !Array.isArray(data.memes)) throw new Error('Invalid API response format');

      // --- ИЗМЕНЕНИЕ ЛОГИКИ ЗДЕСЬ ---

      // 1. Получаем текущие ID (нужен доступ к 'memes' ДО setMemes)
      const currentMemeIds = new Set(memes.map(m => m.id)); // << Используем текущее состояние 'memes'

      // 2. Вычисляем НОВЫЕ УНИКАЛЬНЫЕ мемы ДО вызова setMemes
      const newMemes = data.memes
          .filter(meme => !meme.nsfw) // Фильтр NSFW
          .map(meme => { // Генерация ID и структуры
              let uniqueId = meme.postLink || meme.url || generateFallbackId();
              return {
                  ...meme, id: uniqueId,
                  likes: meme.ups || Math.floor(Math.random() * 100),
                  dislikes: Math.floor(Math.random() * 20),
                  isFavorite: false, userVote: null,
              };
          })
          .filter(meme => !currentMemeIds.has(meme.id)); // Фильтр дубликатов

      // 3. Получаем количество ДОБАВЛЕННЫХ мемов
      const addedMemesCount = newMemes.length;
      console.log("New unique non-NSFW memes to add:", newMemes);

      // 4. Обновляем состояние, если есть новые мемы
      if (addedMemesCount > 0) {
          setMemes(prevMemes => [...prevMemes, ...newMemes]); // Добавляем ВЫЧИСЛЕННЫЕ мемы
      }

      // 5. Проверяем условие и ОБНОВЛЯЕМ СЧЕТЧИК
      console.log(`--- CHECKING COUNTER UPDATE --- Enabled: ${stopProcrastinatingEnabled}, View: ${activeView}, Added: ${addedMemesCount}`);
      if (stopProcrastinatingEnabled && activeView === 'all' && addedMemesCount > 0) {
          setMemesViewedSinceBreak(prevCount => {
              const newCount = prevCount + addedMemesCount;
              console.log(`>>> Counter updated: ${prevCount} + ${addedMemesCount} = ${newCount} / ${memesBeforeBreak}`);
              return newCount;
          });
      } else {
          console.log(`--- Counter NOT updated (Reason: Enabled=${stopProcrastinatingEnabled}, View=${activeView}, Added=${addedMemesCount})`);
      }

      if (isInitialLoad) setInitialLoadComplete(true);

    } catch (e) {
        console.error("Failed to fetch or process memes:", e);
        setError(e.message || 'Failed to fetch memes. Please try again.');
        if (isInitialLoad) setInitialLoadComplete(true);
    } finally {
      setIsLoading(false);
    }
  // ВАЖНО: Добавляем 'memes' в зависимости, т.к. теперь мы читаем его ДО setMemes
  }, [isLoading, activeView, stopProcrastinatingEnabled, memesBeforeBreak, memes]);

  // --- Effect: Initial Load ---
  useEffect(() => {
    // Используем ref для предотвращения двойного вызова в StrictMode
    if (!initialFetchInitiated.current && memes.length === 0 && !initialLoadComplete && !isLoading) {
      console.log(">>> TRIGGERING INITIAL FETCH (Strict Mode check) <<<");
      initialFetchInitiated.current = true; // Устанавливаем флаг
      fetchMemes(true);
    }
  }, [fetchMemes, memes.length, initialLoadComplete, isLoading]); // Зависимости для запуска

  // --- Effect: Scroll to Top on View Change ---
  useEffect(() => {
    // Добавляем 'settings' к видам, для которых скроллим вверх
    if (activeView === 'all' || activeView === 'favorites' || activeView === 'settings') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeView]); // Запускается при смене activeView

  // --- Effect: Check for Break Time ---
  useEffect(() => {
    // Показываем модалку, если: режим включен, мы в ленте ('all'), счетчик достиг лимита, и модалка еще не показана
    if (
      stopProcrastinatingEnabled &&
      activeView === 'all' &&
      memesViewedSinceBreak >= memesBeforeBreak &&
      !showBreakModal
    ) {
      console.log("!!! BREAK TIME TRIGGERED !!!");
      setShowBreakModal(true); // Показать модальное окно
    }
    // Зависит от счетчика, лимита, статуса режима, текущего вида и статуса модалки
  }, [memesViewedSinceBreak, memesBeforeBreak, stopProcrastinatingEnabled, activeView, showBreakModal]);

   // --- Effect: Reset counter if settings change or mode disabled ---
   useEffect(() => {
       // Сбрасываем счетчик при выключении режима или изменении лимита,
       // чтобы предотвратить немедленное срабатывание после изменения настроек.
       if (!stopProcrastinatingEnabled) { // Условие для сброса
         console.log("Settings changed or mode disabled, resetting procrastination counter.");
         setMemesViewedSinceBreak(0);
       }
   }, [stopProcrastinatingEnabled]); // Зависит от настроек


  // --- Action Handlers (Voting) ---
  const handleVote = useCallback((memeId, voteType) => {
    setMemes(prevMemes =>
      prevMemes.map(meme => {
        if (meme.id === memeId) {
          const currentVote = meme.userVote;
          let newLikes = meme.likes;
          let newDislikes = meme.dislikes;
          let newUserVote = null;
          if (voteType === 'like') {
            if (currentVote === 'like') { newLikes -= 1; newUserVote = null; }
            else if (currentVote === 'dislike') { newLikes += 1; newDislikes -= 1; newUserVote = 'like'; }
            else { newLikes += 1; newUserVote = 'like'; }
          } else if (voteType === 'dislike') {
            if (currentVote === 'dislike') { newDislikes -= 1; newUserVote = null; }
            else if (currentVote === 'like') { newDislikes += 1; newLikes -= 1; newUserVote = 'dislike'; }
            else { newDislikes += 1; newUserVote = 'dislike'; }
          }
          newLikes = Math.max(0, newLikes);
          newDislikes = Math.max(0, newDislikes);
          return { ...meme, likes: newLikes, dislikes: newDislikes, userVote: newUserVote };
        }
        return meme;
      })
    );
  }, []);

  // --- Action Handlers (Favorites) ---
  const handleToggleFavorite = useCallback((memeId) => {
    setMemes(prevMemes =>
      prevMemes.map(meme => {
        if (meme.id === memeId) {
          return { ...meme, isFavorite: !meme.isFavorite };
        }
        return meme;
      })
    );
  }, []);

  // --- View and Modal Handlers ---
  const handleSetView = (view) => setActiveView(view);
  const handleShowAboutModal = () => setShowAboutModal(true);
  const handleCloseAboutModal = () => setShowAboutModal(false);

  // --- Settings Handlers ---
  const handleToggleProcrastination = (isEnabled) => {
    setStopProcrastinatingEnabled(isEnabled);
    // Не сбрасываем счетчик здесь, этим займется отдельный useEffect
  };

  const handleBreakCountChange = (count) => {
    setMemesBeforeBreak(count);
     // Не сбрасываем счетчик здесь, этим займется отдельный useEffect
  };

  const handleCloseBreakModal = () => {
    setShowBreakModal(false);
    // Сбрасываем счетчик ПОСЛЕ закрытия модалки, чтобы начать отсчет заново
    setMemesViewedSinceBreak(0);
    console.log("Break modal closed, counter reset.");
  };
  // --- End Settings Handlers ---

  const getVisibleMemes = () => {
    if (activeView === 'favorites') return memes.filter(meme => meme.isFavorite);
    // Для 'all' возвращаем все, для других видов (profile, settings) - пустой массив
    return activeView === 'all' ? memes : [];
  };

  const visibleMemes = getVisibleMemes(); // Вычисляем видимые мемы для передачи в MemeFeed

  return (
    <div className="App">
      {/* Sidebar для навигации */}
      <Sidebar
        activeView={activeView}
        onSetView={handleSetView}
        onShowAbout={handleShowAboutModal}
      />

      {/* Основной контент */}
      <main className="main-content">
        {/* Заголовок страницы */}
        <header className="App-header">
            <h1>
                 {activeView === 'all' && 'Лента мемов'}
                 {activeView === 'favorites' && 'Избранные мемы'}
                 {activeView === 'profile' && 'Профиль пользователя'}
                 {activeView === 'settings' && 'Настройки'}
            </h1>
        </header>

        {/* Рендер страниц в зависимости от activeView */}
        {activeView === 'profile' && <ProfilePage />}

        {activeView === 'settings' && (
          <SettingsPage
            isEnabled={stopProcrastinatingEnabled}
            onToggleEnabled={handleToggleProcrastination}
            breakCount={memesBeforeBreak}
            onBreakCountChange={handleBreakCountChange}
          />
        )}

        {/* Рендер ленты мемов (для 'all' и 'favorites') */}
        {(activeView === 'all' || activeView === 'favorites') && (
          <div className="meme-feed-container">
             {/* Отображение ошибки (только в 'all') */}
             {error && activeView === 'all' && <ErrorDisplay message={error} />}
             {/* Компонент ленты */}
             <MemeFeed
               memes={visibleMemes}
               onVote={handleVote}
               onToggleFavorite={handleToggleFavorite}
             />

             {/* Кнопка "Загрузить еще" и индикаторы загрузки (только в 'all') */}
             {activeView === 'all' && (
                <>
                    {isLoading && <LoadingSpinner />}
                    {!isLoading && initialLoadComplete && (
                    <button
                        className="load-more-button"
                        onClick={() => fetchMemes(false)}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Загрузка...' : 'Загрузить еще...'}
                    </button>
                    )}
                    {!initialLoadComplete && isLoading && <LoadingSpinner />}
                    {initialLoadComplete && !isLoading && memes.length === 0 && !error && (
                        <p>Could not load initial memes or no memes found. Try loading more.</p>
                    )}
                </>
             )}
             {/* Сообщение для пустых Favorites */}
             {activeView === 'favorites' && visibleMemes.length === 0 && !isLoading && (
                <p>Ты еще не добавил ни одного мема в избранное!</p>
             )}
          </div>
        )}
      </main>

      {/* Модальные окна */}
      <AboutModal show={showAboutModal} onClose={handleCloseAboutModal} />
      <BreakModal show={showBreakModal} onClose={handleCloseBreakModal} />
    </div>
  );
}

export default App;