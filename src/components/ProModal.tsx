"use client";

interface Props {
  onClose: () => void;
  onUpgrade: () => void;
}

export function ProModal({ onClose, onUpgrade }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>💎 BlitzCheckers Pro</h3>
        <p className="modal-intro">
          Демо-версия — нажмите кнопку ниже, и Pro активируется сразу (без оплаты).
        </p>

        <div className="pro-unlock-list">
          <h4>Что откроется:</h4>
          <ul>
            <li>
              <strong>🎨 Скины:</strong> Неон, Мрамор, Полночь — вкладка «Скины» →
              «Применить»
            </li>
            <li>
              <strong>🏅 Достижение</strong> «Pro игрок»
            </li>
            <li>
              <strong>🏆 Значок PRO</strong> в профиле и рейтинге
            </li>
          </ul>
        </div>

        <p className="price">$4.99 / месяц · сейчас — бесплатное демо</p>
        <div className="modal-actions">
          <button type="button" className="btn pro" onClick={onUpgrade}>
            Активировать Pro (демо)
          </button>
          <button type="button" className="btn ghost" onClick={onClose}>
            Позже
          </button>
        </div>
        <p className="stripe-note">
          После активации зайдите в меню <strong>Скины</strong> и выберите любой
          стиль доски.
        </p>
      </div>
    </div>
  );
}
