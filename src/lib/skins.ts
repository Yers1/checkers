import type { BoardSkin } from "./game/types";

export interface SkinInfo {
  id: BoardSkin;
  label: string;
  preview: string;
  description: string;
  /** Как получить */
  howToGet: string;
  requiresPro: boolean;
}

export const BOARD_SKINS: SkinInfo[] = [
  {
    id: "classic",
    label: "Классика",
    preview: "🪵",
    description: "Тёплое дерево — стиль турнирных шашек",
    howToGet: "Доступен всем сразу, без Pro",
    requiresPro: false,
  },
  {
    id: "neon",
    label: "Неон",
    preview: "💜",
    description: "Киберпанк-свечение и фиолетовые клетки",
    howToGet: 'Нужен Pro: «Скины» → «Получить Pro» → активировать демо',
    requiresPro: true,
  },
  {
    id: "marble",
    label: "Мрамор",
    preview: "🏛️",
    description: "Холодный мрамор — спокойная эстетика",
    howToGet: 'Нужен Pro: «Скины» → «Получить Pro» → активировать демо',
    requiresPro: true,
  },
  {
    id: "midnight",
    label: "Полночь",
    preview: "🌙",
    description: "Глубокий синий — для ночных партий",
    howToGet: 'Нужен Pro: «Скины» → «Получить Pro» → активировать демо',
    requiresPro: true,
  },
];
