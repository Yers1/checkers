export type MenuTab = "play" | "achievements" | "skins" | "profile" | "settings" | "help";

export const MENU_TABS: { id: MenuTab; label: string; icon: string }[] = [
  { id: "play", label: "Игра", icon: "♟️" },
  { id: "achievements", label: "Достижения", icon: "🏅" },
  { id: "skins", label: "Скины", icon: "🎨" },
  { id: "profile", label: "Профиль", icon: "👤" },
  { id: "settings", label: "Настройки", icon: "⚙️" },
  { id: "help", label: "Справка", icon: "❓" },
];
