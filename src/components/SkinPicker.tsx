"use client";

import type { BoardSkin } from "@/lib/game/types";

const SKINS: { id: BoardSkin; label: string; preview: string }[] = [
  { id: "classic", label: "Классика", preview: "🪵" },
  { id: "neon", label: "Неон", preview: "💜" },
  { id: "marble", label: "Мрамор", preview: "🏛️" },
  { id: "midnight", label: "Полночь", preview: "🌙" },
];

interface Props {
  current: BoardSkin;
  isPro: boolean;
  onSelect: (skin: BoardSkin) => void;
}

export function SkinPicker({ current, isPro, onSelect }: Props) {
  return (
    <div className="skin-picker">
      {SKINS.map((s) => {
        const locked = !isPro && s.id !== "classic";
        return (
          <button
            key={s.id}
            type="button"
            className={current === s.id ? "skin-btn active" : "skin-btn"}
            disabled={locked}
            onClick={() => onSelect(s.id)}
            title={locked ? "Доступно в Pro" : s.label}
          >
            <span>{s.preview}</span>
            <span>{s.label}</span>
            {locked && <span className="lock">🔒</span>}
          </button>
        );
      })}
    </div>
  );
}
