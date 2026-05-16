import type { GameState, PlayerProfile } from "./game/types";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    icon: "🏆",
    title: "Первая победа",
    description: "Одержите первую победу против ИИ",
  },
  {
    id: "combo_king",
    icon: "🔥",
    title: "Комбо-король",
    description: "Съешьте 3+ фигур за один ход",
  },
  {
    id: "blitz_hero",
    icon: "⚡",
    title: "Блиц-герой",
    description: "Выиграйте партию в режиме блиц",
  },
  {
    id: "puzzle_5",
    icon: "🧩",
    title: "Тактик",
    description: "Решите 5 тактических задач",
  },
  {
    id: "streak_3",
    icon: "📈",
    title: "На волне",
    description: "Серия из 3 побед подряд",
  },
  {
    id: "veteran",
    icon: "🎖️",
    title: "Ветеран",
    description: "Сыграйте 10 партий",
  },
  {
    id: "daily_done",
    icon: "📅",
    title: "Челлендж дня",
    description: "Выполните ежедневную задачу",
  },
  {
    id: "pro_member",
    icon: "💎",
    title: "Pro игрок",
    description: "Активируйте Pro",
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
