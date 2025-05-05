import React from 'react';
import MemeCard from './MemeCard';

function MemeFeed({ memes, onVote, onToggleFavorite }) {

    if (!memes || memes.length === 0) {
      // Не показываем "Нечего отображать" если идет загрузка (чтобы не мелькало)
      return <p>Нечего отображать</p>;
    }
  
    return (
      <div className="meme-feed">
        {memes.map((meme) => (
          // Используем meme.id, который теперь должен быть надежным
          <MemeCard
            key={meme.id}
            meme={meme}
            onVote={onVote}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    );
  }
  
  export default MemeFeed;