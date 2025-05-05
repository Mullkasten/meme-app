import React from 'react';

function MemeCard({ meme, onVote, onToggleFavorite }) {
    if (!meme || !meme.url || !meme.title || !meme.id) {
      console.warn("Incomplete meme data:", meme);
      return null;
    }
  
    // Обработчики вызывают onVote с типом голоса
    const handleLikeClick = () => {
      onVote(meme.id, 'like');
    };
  
    const handleDislikeClick = () => {
      onVote(meme.id, 'dislike');
    };
  
    const handleFavoriteClick = () => {
      onToggleFavorite(meme.id);
    };
  
    // Классы для подсветки активных кнопок лайка/дизлайка
    const likeButtonClass = `like-button ${meme.userVote === 'like' ? 'voted-like' : ''}`;
    const dislikeButtonClass = `dislike-button ${meme.userVote === 'dislike' ? 'voted-dislike' : ''}`;
    const favoriteButtonClass = `favorite-button ${meme.isFavorite ? 'favorited' : ''}`;
  
  
    return (
      // Класс meme-card-wrapper для рамки
      <div className="meme-card">
        <img src={meme.url} alt={meme.title} loading="lazy" />
        <h3>{meme.title}</h3>
        {meme.postLink && ( // Условие на случай, если postLink нет
           <a href={meme.postLink} target="_blank" rel="noopener noreferrer">
             Ссылка на Reddit (r/{meme.subreddit || 'unknown'})
           </a>
        )}
  
        <div className="meme-actions">
          <button onClick={handleLikeClick} className={likeButtonClass} aria-label="Like meme">
            👍 <span className="action-count">{meme.likes}</span>
          </button>
          <button onClick={handleDislikeClick} className={dislikeButtonClass} aria-label="Dislike meme">
            👎 <span className="action-count">{meme.dislikes}</span>
          </button>
          <button
            onClick={handleFavoriteClick}
            className={favoriteButtonClass}
          >
            {meme.isFavorite ? '★ В избранном' : '☆ Избранное'}
          </button>
        </div>
      </div>
    );
  }
  
  export default MemeCard;