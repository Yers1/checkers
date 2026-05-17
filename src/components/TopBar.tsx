"use client";

interface Props {
  onMenuOpen: () => void;
}

export function TopBar({ onMenuOpen }: Props) {
  return (
    <header className="top-bar">
      <button
        type="button"
        className="menu-toggle"
        onClick={onMenuOpen}
        aria-label="Открыть меню"
      >
        <span />
        <span />
        <span />
      </button>
      <div className="top-bar-title">
        <strong>BlitzCheckers</strong>
        <span>Нажмите ☰ — режимы, достижения, скины</span>
      </div>
    </header>
  );
}
