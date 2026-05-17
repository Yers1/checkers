"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MENU_TABS, type MenuTab } from "./types";
import { PlaySection } from "./PlaySection";
import { AchievementsSection } from "./AchievementsSection";
import { SkinsSection } from "./SkinsSection";
import { ProfileSection } from "./ProfileSection";
import { SettingsSection } from "./SettingsSection";
import { HelpSection } from "./HelpSection";
import { useGameStore } from "@/store/gameStore";

interface Props {
  theme: "light" | "dark";
  onThemeToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const TAB_TITLES: Record<MenuTab, string> = {
  play: "Игра",
  achievements: "Достижения",
  skins: "Скины доски",
  profile: "Профиль",
  settings: "Настройки",
  help: "Справка",
};

export function AppMenu({ theme, onThemeToggle, mobileOpen, onMobileClose }: Props) {
  const [tab, setTab] = useState<MenuTab>("play");
  const profile = useGameStore((s) => s.profile);

  useEffect(() => {
    document.documentElement.setAttribute("data-skin", profile.boardSkin);
  }, [profile.boardSkin]);

  const selectTab = (id: MenuTab) => {
    setTab(id);
    onMobileClose();
  };

  return (
    <>
      <div
        className={`menu-backdrop ${mobileOpen ? "open" : ""}`}
        onClick={onMobileClose}
        aria-hidden
      />

      <aside className={`app-menu ${mobileOpen ? "open" : ""}`}>
        <div className="menu-brand">
          <span className="brand-icon pulse">⚡</span>
          <div>
            <h1>BlitzCheckers</h1>
            <p>Меню</p>
          </div>
        </div>

        <nav className="menu-nav" aria-label="Главное меню">
          {MENU_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? "nav-item active" : "nav-item"}
              onClick={() => selectTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
              {t.id === "achievements" && (
                <span className="nav-badge">
                  {profile.unlockedAchievements.length}/{8}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="menu-content panel">
          <h2 className="menu-content-title">{TAB_TITLES[tab]}</h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              {tab === "play" && <PlaySection />}
              {tab === "achievements" && <AchievementsSection />}
              {tab === "skins" && <SkinsSection />}
              {tab === "profile" && <ProfileSection />}
              {tab === "settings" && (
                <SettingsSection theme={theme} onThemeToggle={onThemeToggle} />
              )}
              {tab === "help" && <HelpSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}
