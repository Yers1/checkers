"use client";

export function HelpSection() {
  return (
    <div className="menu-section help-section">
      <p className="section-lead">Краткая инструкция по BlitzCheckers.</p>

      <article className="help-block">
        <h3>♟️ Как играть</h3>
        <ol>
          <li>Откройте вкладку <strong>Игра</strong> и выберите режим.</li>
          <li>Нажмите на свою шашку, затем на подсвеченную клетку.</li>
          <li>Если можно бить — взятие обязательно (русские шашки).</li>
          <li>Дамка ходит на любое расстояние по диагонали.</li>
        </ol>
      </article>

      <article className="help-block">
        <h3>🏅 Достижения</h3>
        <p>
          Вкладка <strong>Достижения</strong> — у каждого награды есть блок{" "}
          <strong>«Как получить»</strong> с пошаговым условием.
        </p>
      </article>

      <article className="help-block">
        <h3>🎨 Скины доски</h3>
        <ul>
          <li>
            <strong>Классика</strong> — бесплатно, вкладка Скины → Применить.
          </li>
          <li>
            <strong>Неон / Мрамор / Полночь</strong> — нужен Pro (кнопка в Скинах или
            Настройках).
          </li>
        </ul>
      </article>

      <article className="help-block">
        <h3>🌐 Онлайн с другом</h3>
        <p>
          Режим «Онлайн» → «Создать комнату» → скопируйте ссылку и отправьте другу.
        </p>
      </article>

      <article className="help-block">
        <h3>🎬 После партии</h3>
        <p>
          Появится <strong>AI Coach</strong> с разбором и слайдер <strong>повтора
          ходов</strong> под доской.
        </p>
      </article>
    </div>
  );
}
