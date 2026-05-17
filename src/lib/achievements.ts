import type { GameState, PlayerProfile } from "./game/types";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  /** Понятная инструкция для игрока */
  howToUnlock: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    icon: "🏆",
    title: "Первая победа",
    description: "Одержите первую победу против ИИ",
    howToUnlock:
      'Режим «Против ИИ» → выиграйте партию (вы играете белыми). После победы достижение откроется автоматически.',
  },
  {
    id: "combo_king",
    icon: "🔥",
    title: "Комбо-король",
    description: "Съешьте 3+ фигур за один ход",
    howToUnlock:
      "В любой партии сделайте взятие сразу 3 фигур соперника за один ход (цепочка боя). Подсказки можно включить в настройках.",
  },
  {
    id: "blitz_hero",
    icon: "⚡",
    title: "Блиц-герой",
    description: "Выиграйте партию в режиме блиц",
    howToUnlock:
      'Меню «Игра» → «Блиц 3 мин» → победите до истечения времени (у вас 3 минуты на партию).',
  },
  {
    id: "puzzle_5",
    icon: "🧩",
    title: "Тактик",
    description: "Решите 5 тактических задач",
    howToUnlock:
      'Меню «Игра» → раздел «Тактика» или режим «Тактика» — решите 5 разных задач (счётчик 🧩 в профиле).',
  },
  {
    id: "streak_3",
    icon: "📈",
    title: "На волне",
    description: "Серия из 3 побед подряд",
    howToUnlock:
      "Выиграйте 3 партии подряд против ИИ без поражений между ними. Серия 🔥 отображается над доской.",
  },
  {
    id: "veteran",
    icon: "🎖️",
    title: "Ветеран",
    description: "Сыграйте 10 партий",
    howToUnlock:
      "Завершите 10 партий в любом режиме (ИИ, блиц, вдвоём, онлайн). Считаются только оконченные игры.",
  },
  {
    id: "daily_done",
    icon: "📅",
    title: "Челлендж дня",
    description: "Выполните ежедневную задачу",
    howToUnlock:
      'Меню «Игра» → «Челлендж дня» → найдите правильную комбинацию. Новый челлендж каждый день.',
  },
  {
    id: "pro_member",
    icon: "💎",
    title: "Pro игрок",
    description: "Активируйте Pro",
    howToUnlock:
      'Меню «Скины» или «Настройки» → кнопка «Получить Pro» → «Активировать Pro (демо)». Откроет все скины доски.',
  },
];

export function checkNewAchievements(
  profile: PlayerProfile,
  game: GameState,
  lastCaptureCount: number,
  humanWon: boolean,
  puzzleSolved?: boolean,
): string[] {
  const unlocked = new Set(profile.unlockedAchievements);
  const newly: string[] = [];

  const grant = (id: string) => {
    if (!unlocked.has(id)) {
      newly.push(id);
      unlocked.add(id);
    }
  };

  if (humanWon && profile.wins === 1) grant("first_win");
  if (lastCaptureCount >= 3) grant("combo_king");
  if (humanWon && game.mode === "blitz") grant("blitz_hero");
  if (profile.puzzlesSolved >= 5) grant("puzzle_5");
  if (profile.streak >= 3) grant("streak_3");
  if (profile.gamesPlayed >= 10) grant("veteran");
  if (puzzleSolved && game.mode === "daily") grant("daily_done");
  if (profile.isPro) grant("pro_member");

  return newly;
}
