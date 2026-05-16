"use client";

interface Props {
  onClose: () => void;
  onUpgrade: () => void;
}

export function ProModal({ onClose, onUpgrade }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>BlitzCheckers Pro</h3>
        <p>Кастомные скины фигур, расширенный AI Coach и приоритет в лидерборде.</p>
        <ul className="pro-features">
          <li>🎨 12 премиум-скинов доски</li>
          <li>📊 Глубокий разбор каждого хода</li>
          <li>🏆 Значок PRO в рейтинге города</li>
        </ul>
        <p className="price">$4.99 / месяц · демо-режим</p>
        <div className="modal-actions">
          <button type="button" className="btn pro" onClick={onUpgrade}>
            Активировать Pro (демо)
          </button>
          <button type="button" className="btn ghost" onClick={onClose}>
            Позже
          </button>
        </div>
        <p className="stripe-note">
          Интеграция Stripe готова к подключению в production.
        </p>
      </div>
    </div>
  );
}
